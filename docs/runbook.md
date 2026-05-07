# Runbook

Step-by-step operations manual for the Glow Up App. Every command in this file is exact and copy-pasteable.

---

## 1. Overview

This runbook covers everything needed to set up, develop, test, and deploy `glow-up-app`. Follow each section in order for initial setup. Refer back to specific sections as needed during development.

---

## 2. Prerequisites

Install these before doing anything else. Each tool includes a version check command — run it after install to confirm.

### Node.js 20+

```bash
# macOS
brew install node@20

# Ubuntu / WSL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version    # should print v20.x.x or higher
```

### npm 9+

npm ships with Node.js. If your version is too old, upgrade in place:

```bash
npm install -g npm@latest

# Verify
npm --version     # should print 9.x.x or higher
```

### Git

```bash
# macOS
brew install git

# Ubuntu / WSL
sudo apt install -y git

# Verify
git --version
```

### Terraform 1.5+

```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Ubuntu / WSL
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install -y terraform

# Verify
terraform --version    # should print Terraform v1.5.x or higher
```

### AWS CLI v2

```bash
# macOS
brew install awscli

# Ubuntu / WSL
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version    # should print aws-cli/2.x.x
```

### AWS CLI credentials

```bash
aws configure
# Enter Access Key ID, Secret Access Key, default region (us-east-1), default output (json)

# Verify configuration
aws sts get-caller-identity
```

Expected output:

```json
{
  "UserId": "AIDA...",
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/your-name"
}
```

If you see an error, your credentials aren't configured — re-run `aws configure`.

### Code editor

- **VS Code** is recommended.
- Install **Claude Code** extension from the VS Code marketplace.

---

## 3. Initial Setup (first time only)

### Step 1 — Clone the repository

```bash
git clone git@github.com:chaddickerson-loop8/glow-up-app.git
cd glow-up-app
```

### Step 2 — Switch to develop branch

```bash
git checkout develop
```

All work happens on `develop`. Never commit directly to `main`.

### Step 3 — Create environment file

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in:

- `AWS_ACCOUNT_ID` — your 12-digit AWS account number (from `aws sts get-caller-identity`)
- `AWS_REGION` — defaults to `us-east-1`; change only if you're deploying elsewhere

The remaining values (`CLOUDFRONT_DISTRIBUTION_ID`, `VITE_API_URL`, `VITE_CLOUDFRONT_URL`) get filled in **after** the Terraform infrastructure is deployed in Phase 3. Leave them blank until then.

### Step 4 — Verify AWS access

```bash
aws sts get-caller-identity
```

You should see your account ID and IAM ARN. This confirms the AWS CLI can authenticate against your account, which is required before any Terraform work in Phase 3.

---

## 4. Frontend Local Development (Phase 2)

```bash
cd frontend
npm install         # install dependencies (first time, or after package.json changes)
npm run dev         # start the dev server
```

- The app opens at **http://localhost:5173**.
- **Hot reload is enabled** — saving a file refreshes the page automatically.

Other commands:

```bash
npm run build       # production build (output in frontend/dist/)
npm run preview     # serve the production build locally to verify it works
npm run lint        # run ESLint — must pass with zero errors before committing
```

---

## 5. Terraform Infrastructure (Phase 3)

### Important — S3 bucket names must be globally unique

S3 bucket names are globally unique across **all** AWS accounts. The default names in `.env.example` (`glow-up-app-tf-state` and `glow-up-app-assets`) will collide with other accounts that use the same defaults. Before Phase 3 begins, suffix each bucket name with your 12-digit AWS account ID:

| Default name              | Rename to                                  |
| ------------------------- | ------------------------------------------ |
| `glow-up-app-tf-state`    | `glow-up-app-tf-state-123456789012`        |
| `glow-up-app-assets`      | `glow-up-app-assets-123456789012`          |

Replace `123456789012` with the value from `aws sts get-caller-identity`. Update these names in your `.env` file **before** running any of the commands below.

### Step 1 — Initialize the Terraform state backend (one-time bootstrap)

Terraform stores its state in an S3 bucket. That bucket has to exist *before* `terraform init`, so we create it manually with the AWS CLI. This is a **one-time** step per AWS account.

```bash
# 1. Create the bucket
aws s3api create-bucket \
  --bucket glow-up-app-tf-state \
  --region us-east-1

# 2. Enable versioning
aws s3api put-bucket-versioning \
  --bucket glow-up-app-tf-state \
  --versioning-configuration Status=Enabled

# 3. Enable server-side encryption (AES-256)
aws s3api put-bucket-encryption \
  --bucket glow-up-app-tf-state \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# 4. Block all public access
aws s3api put-public-access-block \
  --bucket glow-up-app-tf-state \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

Why each command matters:

1. **Create bucket** — gives Terraform somewhere to put state. Outside `us-east-1` you also need `--create-bucket-configuration LocationConstraint=<region>`.
2. **Versioning** — every state change is preserved. If a `terraform apply` corrupts state, you can roll back by restoring the previous object version. Critical safety net.
3. **Encryption (AES-256)** — state files contain resource IDs, ARNs, and sometimes sensitive output values. Encryption at rest is mandatory.
4. **Public access block** — defense in depth. Even if a bucket policy is misconfigured, the account-level block prevents the state file from ever being publicly readable.

### Step 2 — Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

`terraform init` downloads the AWS provider plugin, configures the S3 backend (using `glow-up-app-tf-state`), and prepares the working directory. Run it once after cloning, and again any time the backend or provider versions change.

### Step 3 — Plan changes

```bash
terraform plan -out=tfplan
```

**ALWAYS review the plan output. NEVER skip this step.**

What to look for:

- Lines starting with `+` — resources being **created**
- Lines starting with `~` — resources being **modified in place**
- Lines starting with `-` — resources being **destroyed** (red flag — confirm this is intentional)
- Lines starting with `-/+` — resources being **destroyed and recreated** (also a red flag)
- The summary line: `Plan: X to add, Y to change, Z to destroy.`

If anything in the plan is unexpected, stop. Don't apply.

### Step 4 — Apply changes (only after user verification)

```bash
terraform apply tfplan
```

Only run this after the plan has been reviewed and confirmed. Apply executes the planned changes against AWS — buckets, tables, Lambdas, distributions, and IAM roles get created (or modified, or destroyed).

### Step 5 — Verify deployment

```bash
terraform output
```

This prints every output variable defined by the Terraform config — bucket names, the API Gateway endpoint, the CloudFront URL, etc. Capture these values into your `.env` file.

Then verify manually:

- Check each resource in the AWS Console (S3, DynamoDB, Lambda, CloudFront).
- Test API endpoints with `curl` or the browser.
- Open the CloudFront URL in a browser and confirm the frontend loads.

---

## 6. Git Workflow

### Daily workflow

```bash
git checkout develop                                  # always start on develop
# ... make changes ...
git add -A
git commit -m "feat: short description of change"
# verify everything still works (lint, build, test)
git push origin develop
```

### Promoting to production

- Only promote after full verification on `develop`.
- Open a pull request on GitHub from `develop` → `main`.
- Review the diff in the PR.
- Merge only after approval.
- **Never push directly to `main`.**

### Conventional commit format

| Prefix      | Meaning                                       |
| ----------- | --------------------------------------------- |
| `feat:`     | new feature                                   |
| `fix:`      | bug fix                                       |
| `docs:`     | documentation change                          |
| `chore:`    | maintenance task                              |
| `refactor:` | code restructure without behavior change      |
| `test:`     | adding or fixing tests                        |

---

## 7. Common Operations

### Add a new Lambda function

1. Create the handler file in `infrastructure/lambda/<function-name>/index.js`.
2. Add the `aws_lambda_function` resource to `infrastructure/terraform/lambda.tf`.
3. Add the matching IAM role and policy to `infrastructure/terraform/iam.tf` (least-privilege only — name the exact resources the function needs to touch).
4. From `infrastructure/terraform/`:
   ```bash
   terraform plan -out=tfplan
   # review plan
   terraform apply tfplan
   ```

### Update the frontend

```bash
# 1. Make changes in frontend/src/
cd frontend

# 2. Test locally
npm run dev

# 3. Build for production
npm run build

# 4. Upload build output to the frontend S3 bucket
aws s3 sync dist/ s3://<frontend-bucket-name>/ --delete

# 5. Invalidate the CloudFront cache so users get the new build immediately
aws cloudfront create-invalidation \
  --distribution-id <CLOUDFRONT_DISTRIBUTION_ID> \
  --paths "/*"
```

Replace `<frontend-bucket-name>` and `<CLOUDFRONT_DISTRIBUTION_ID>` with the values from `terraform output` (or your `.env`).

### Check costs

```bash
# Cost & usage for the current month
aws ce get-cost-and-usage \
  --time-period Start=2026-05-01,End=2026-06-01 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

Or visit the AWS Billing console: **Billing → Cost Explorer**.

---

## 8. Environment Variables Reference

Every variable from `.env.example`, with what it is, where the value comes from, and when it gets filled in.

| Variable                    | What it is                                                  | Where the value comes from                                       | When to fill in                          |
| --------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| `AWS_REGION`                | AWS region for all resources                                | Defaults to `us-east-1` — change only if deploying elsewhere     | Initial setup                            |
| `AWS_ACCOUNT_ID`            | Your 12-digit AWS account number                            | `aws sts get-caller-identity` → `Account` field                  | Initial setup                            |
| `S3_BUCKET_NAME`            | Bucket for user photos and processed images                 | Defaults to `glow-up-app-assets`                                 | Initial setup                            |
| `DYNAMODB_TABLE_NAME`       | Table for user data and sessions                            | Defaults to `glow-up-app-users`                                  | Initial setup                            |
| `CLOUDFRONT_DISTRIBUTION_ID`| CloudFront distribution ID (used for cache invalidation)    | `terraform output cloudfront_distribution_id`                    | After Phase 3 `terraform apply`          |
| `TF_STATE_BUCKET`           | S3 bucket holding the remote Terraform state                | Created in Section 5, Step 1 — defaults to `glow-up-app-tf-state`| Initial setup (before `terraform init`)  |
| `TF_STATE_REGION`           | Region of the Terraform state bucket                        | Same region as `AWS_REGION` — defaults to `us-east-1`            | Initial setup                            |
| `VITE_API_URL`              | API Gateway HTTP API endpoint URL                           | `terraform output api_gateway_url`                               | After Phase 3 `terraform apply`          |
| `VITE_CLOUDFRONT_URL`       | CloudFront URL where the frontend is served                 | `terraform output cloudfront_url`                                | After Phase 3 `terraform apply`          |

The `VITE_*` prefix is required — Vite only exposes env vars to client code if they begin with `VITE_`.
