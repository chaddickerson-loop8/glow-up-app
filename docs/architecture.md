# Architecture

System design for the Glow Up App. Cost optimization and fully automated serverless resources are the priority throughout every decision.

---

## 1. Overview

Glow Up is a real-time beauty enhancement tool. The frontend runs entirely in the browser using TensorFlow.js for face detection and the Canvas API for image manipulation. The backend is fully serverless on AWS and handles only image storage, user data, and CDN delivery. There are no servers to manage.

The architecture is designed so that costs are near zero when idle and scale automatically under load. Every AWS resource is serverless and pay-per-use — nothing runs 24/7, nothing requires manual scaling, and nothing costs money when nobody is using it.

---

## 2. Architecture Diagram

```
                           ┌──────────────────────────────┐
                           │   User Browser               │
                           │   React + TensorFlow.js      │
                           │   Canvas API                 │
                           └──────────────────────────────┘
                                │              │
                  HTML/JS/CSS   │              │   API requests (JSON)
                  (cached)      │              │   presigned URLs
                                ▼              ▼
                      ┌──────────────┐   ┌──────────────────┐
                      │  CloudFront  │   │   API Gateway    │
                      │  CDN + HTTPS │   │   (HTTP API)     │
                      └──────────────┘   └──────────────────┘
                             │                     │
                  static     │                     │   invoke
                  assets     │                     ▼
                             ▼            ┌──────────────────┐
                       ┌──────────┐       │     Lambda       │
                       │    S3    │       │  (Node.js 20.x)  │
                       │ frontend │       └──────────────────┘
                       │  hosting │            │          │
                       └──────────┘            │          │
                                       user    │          │   image
                                       data    │          │   metadata +
                                               ▼          ▼   presigned URLs
                                       ┌────────────┐  ┌──────────┐
                                       │  DynamoDB  │  │    S3    │
                                       │ user data, │  │  image   │
                                       │  sessions  │  │ storage  │
                                       └────────────┘  └──────────┘
```

**Connections**

- Browser ⇄ CloudFront: HTML / JS / CSS (cached at edge)
- CloudFront → S3 (frontend bucket): static assets, only on cache miss
- Browser ⇄ API Gateway: API requests (JSON), presigned URL responses
- API Gateway → Lambda: function invocations
- Lambda ⇄ DynamoDB: user profiles, sessions, presets
- Lambda ⇄ S3 (image bucket): metadata reads, presigned URL generation
- Browser ⇄ S3 (image bucket): direct uploads/downloads via presigned URLs (no Lambda in the path)

---

## 3. Frontend Architecture

- **React 18** with **Vite** as the build tool.
- **Why Vite:** fastest build tool available, hot module replacement during development, optimized production builds with content-hashed assets.
- **TensorFlow.js `face-landmarks-detection`** runs entirely in the browser — no server round trip is needed for face detection. This means real-time performance and zero backend compute cost for the heaviest operation in the app.
- **Canvas API** for all image manipulation — makeup overlays, skin retouching, liquify deformation, hair color swap.

### Critical cost decision

**ALL face detection and image processing happens client-side in the browser.** The backend handles only storage and user data. This means Lambda invocations are minimal and short-lived.

If we processed images on the server, every filter application would be a Lambda call with high memory and long execution time — that would be expensive at scale. By processing in the browser, Lambda costs stay near zero regardless of how many filters users apply.

---

## 4. AWS Services

For each service: what it does, why it's the cheapest serverless option, and what alternative was rejected.

### S3 (Simple Storage Service)

- **What:** object storage for user-uploaded photos, processed images, and static frontend hosting.
- **Why cheapest:** $0.023 per GB/month for storage, $0.0004 per 1,000 GET requests. No running servers, no idle costs. Infinitely scalable without configuration.
- **Built-in features we get for free:** versioning, server-side encryption (AES-256), lifecycle policies to auto-delete old images and reduce storage costs.
- **S3 lifecycle policy:** automatically transition images older than 90 days to S3 Glacier Instant Retrieval ($0.004/GB) and delete images older than 365 days. Cost reduction is automated — no manual intervention.
- **Static website hosting:** the compiled React frontend is uploaded to S3 and served through CloudFront. No web server needed.
- **Security:** public access blocked at the bucket level; only CloudFront can read via Origin Access Control (OAC).
- **Alternative rejected:** EFS or EBS — block storage designed for EC2, not serverless. Would require a running server to access. More expensive and more complex.

### DynamoDB

- **What:** NoSQL database for user profiles, session data, and saved filter presets.
- **Why cheapest:** on-demand mode means $1.25 per million write requests, $0.25 per million read requests. Zero cost when idle. No running database server.
- **On-demand capacity is critical:** we pay per request, not per hour. A traditional database (RDS) costs $15–50/month minimum even with zero traffic. DynamoDB on-demand costs literally zero when nobody is using the app.
- **Built-in features we get for free:** encryption at rest, automatic backups, global tables if we need multi-region later.
- **TTL (Time to Live):** enabled on session records so expired sessions are automatically deleted by DynamoDB at no cost. No Lambda needed to clean up stale data.
- **Alternative rejected:** RDS PostgreSQL — minimum ~$15/month for the smallest instance even when idle, requires maintenance windows, patching, and manual scaling. Aurora Serverless v2 is closer but still has minimum capacity charges.

### Lambda

- **What:** serverless functions handling API logic — generating presigned URLs for S3, reading/writing user data to DynamoDB, image metadata operations.
- **Why cheapest:** the first 1 million requests per month are FREE. After that, $0.20 per million requests, plus $0.0000166667 per GB-second of compute. Our functions are lightweight API handlers (not image processing), so they run in under 1 second with 128–256 MB memory.
- **Cost optimization:** since all heavy image processing happens in the browser, Lambda only handles thin API operations. This means low memory allocation (128 MB where possible, 256 MB max), fast execution (under 1 second), and minimal cost.
- **Runtime:** Node.js 20.x.
- **Provisioned concurrency:** NOT used. On-demand only. Provisioned concurrency costs money when idle, which defeats the purpose.
- **Alternative rejected:** EC2 — runs 24/7 minimum ~$8/month for the smallest instance even when idle. ECS Fargate — minimum ~$10/month. Both require server management and cost money around the clock.

### CloudFront

- **What:** Content Delivery Network that serves the frontend globally and enforces HTTPS.
- **Why cheapest:** the first 1 TB of data transfer per month is FREE. Free HTTPS certificate via ACM. Caches static files at 400+ edge locations worldwide so S3 only gets hit once per cache period, reducing S3 request costs.
- **Cache strategy:** long cache TTLs on static assets (JS, CSS, images) since they are versioned by Vite's build hash. Most requests never reach S3 at all — they are served from the CloudFront edge cache for free.
- **Security:** HTTPS only, HTTP automatically redirected to HTTPS, Origin Access Control restricts S3 access to CloudFront only.
- **Alternative rejected:** serving directly from S3 — no HTTPS, no caching, no global distribution; every request hits S3 directly (more expensive at scale).

### API Gateway (HTTP API, not REST API)

- **What:** managed API layer in front of Lambda functions.
- **Why HTTP API specifically:** HTTP APIs cost $1.00 per million requests versus REST APIs at $3.50 per million. HTTP API is ~71% cheaper and supports everything we need — routing, CORS, JWT authorization.
- **Built-in features:** automatic throttling prevents runaway costs from abuse; request validation catches bad input before Lambda runs.
- **Alternative rejected:** REST API — same functionality at 3.5× the cost. Lambda function URLs — free but no built-in throttling, CORS configuration, or request validation.

---

## 5. Automated Resource Management

- **S3 lifecycle policies** automatically transition and delete old images — no manual cleanup, no Lambda cron jobs needed.
- **DynamoDB TTL** automatically deletes expired session records — zero cost, zero maintenance.
- **CloudFront cache invalidation** is automated through deployment scripts — when we push a new frontend build, the cache clears automatically.
- **Lambda** automatically scales to match demand and scales to zero when idle — no capacity planning.
- **All infrastructure managed by Terraform** — one command to create everything, one command to destroy everything, no manual console clicking.
- **Terraform state** stored in S3 with versioning — infrastructure state is backed up and recoverable automatically.
- **No cron jobs, no scheduled tasks, no background workers.** Everything is event-driven — a user action triggers a Lambda, otherwise nothing runs and nothing costs money.

---

## 6. Data Flow

### Flow 1 — User opens the app

1. Browser requests app from CloudFront.
2. CloudFront serves the cached React app from the edge (S3 only hit on first request or cache miss).
3. App loads in the browser.
4. TensorFlow.js model downloads and initializes.

**Cost:** essentially free — CloudFront's free tier covers 1 TB/month.

### Flow 2 — User activates camera and applies filters

1. Browser accesses the webcam via the `getUserMedia` API.
2. TensorFlow.js detects facial landmarks in real time.
3. Canvas API applies selected filters (makeup, retouching, liquify, hair).

**ALL processing happens locally in the browser** — zero Lambda calls, zero API calls, zero cost.

### Flow 3 — User saves a processed image

1. Frontend requests a presigned upload URL from API Gateway.
2. Lambda generates a presigned S3 URL (runs <500 ms, 128 MB memory).
3. Frontend uploads the image directly to S3 using the presigned URL.
4. Lambda writes metadata to DynamoDB.

**Cost:** 1 Lambda invocation + 1 DynamoDB write + S3 storage = a fraction of a penny.

### Flow 4 — User loads saved images

1. Frontend requests image list from API Gateway.
2. Lambda queries DynamoDB.
3. Lambda generates presigned download URLs for S3.
4. Frontend displays images using the presigned URLs.

**Cost:** 1 Lambda invocation + 1 DynamoDB read = a fraction of a penny.

---

## 7. Security Architecture

- No secrets in frontend code — all sensitive operations happen in Lambda.
- S3 presigned URLs for image upload/download — users never get direct S3 access; URLs expire after 15 minutes.
- IAM least-privilege — each Lambda function gets its own IAM role with only the specific permissions it needs, nothing more.
- HTTPS everywhere — CloudFront enforces TLS, HTTP is redirected.
- CORS locked down to only allow requests from our CloudFront domain.
- Input validation in every Lambda function before any database or storage operation.
- DynamoDB encryption at rest enabled by default.
- S3 server-side encryption enabled by default.
- API Gateway throttling prevents abuse and protects against cost spikes.

---

## 8. Cost Estimate

### Development and light usage (0–1,000 users/month)

| Resource      | Estimated cost                                |
| ------------- | --------------------------------------------- |
| S3 storage    | ~$0.05/month (a few GB of images)             |
| S3 requests   | ~$0.01/month                                  |
| DynamoDB      | ~$0.00/month (well within free tier)          |
| Lambda        | ~$0.00/month (well within 1M free requests)   |
| CloudFront    | ~$0.00/month (well within 1 TB free tier)     |
| API Gateway   | ~$0.01/month                                  |
| **Total**     | **< $1/month**                                |

### Moderate usage (1,000–10,000 users/month)

- **Total:** $2–5/month

### Why it stays this cheap

Because all heavy processing (face detection, filters, image manipulation) happens in the browser, the backend only handles lightweight API calls and storage. This is what makes the architecture so cheap.

If we processed images server-side, Lambda costs alone would be $50–100+/month at moderate usage.
