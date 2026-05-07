# Glow Up App

Real-time digital beauty enhancement application featuring facial landmark detection, virtual makeup overlays (eyes, lashes, brows), skin retouching and shaders, liquify/deformation tools for lip fullness, and hair color/texture swapping. Fully serverless architecture on AWS.

---

## Features

- Real-time facial landmark detection (eyes, brows, lips, nose) using TensorFlow.js
- Virtual makeup overlay for eyes, lashes, and brows
- Skin retouching and shader effects
- Liquify/deformation tool using a warp filter for fuller lips
- Hair color and texture swap

---

## Tech Stack

- **Frontend:** React 18 + Vite + TensorFlow.js
- **Backend:** AWS Lambda (Node.js 20.x)
- **Storage:** S3 (images) + DynamoDB (user data)
- **CDN:** CloudFront
- **IaC:** Terraform

---

## Project Structure

```
glow-up-app/
├── .claude/                       # Claude Code configuration
├── docs/                          # Architecture, runbook, and troubleshooting documentation
├── frontend/
│   └── src/
│       ├── components/            # React components
│       ├── hooks/                 # Custom React hooks
│       ├── utils/                 # Utility functions
│       └── styles/                # CSS and design tokens
└── infrastructure/
    ├── terraform/                 # Terraform HCL files (one per AWS resource)
    ├── lambda/                    # Lambda function handler code
    └── scripts/                   # Deployment and helper scripts
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Terraform 1.5+
- AWS CLI configured
- Git

### Quick Start

```bash
git clone git@github.com:chaddickerson-loop8/glow-up-app.git
cd glow-up-app
git checkout develop

cp .env.example .env
# Open .env and fill in your real values

cd frontend
npm install
```

For full setup instructions — including AWS account preparation, Terraform backend bootstrap, and first deploy — see [`docs/runbook.md`](docs/runbook.md).

---

## Branching Strategy

- **`main`** — production. Never commit directly.
- **`develop`** — active development. All work happens here.
- Merges to `main` only happen through verified pull requests.

---

## Project Status

For the current phase, active task, known issues, and next steps, see [`PROJECT_STATUS.xml`](PROJECT_STATUS.xml).

---

## Security

- No secrets in code — environment variables only
- All S3 buckets private
- IAM least-privilege
- HTTPS enforced via CloudFront

See the verification checklist in [`CLAUDE.md`](CLAUDE.md) for the full pre-push and pre-deploy security gates.
