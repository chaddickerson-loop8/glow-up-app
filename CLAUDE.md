# CLAUDE.md

Master instruction file for Claude Code. Read this at the start of every session.

---

## 1. Project Overview

This is a digital glow-up application. It provides:

- Real-time facial landmark detection
- Virtual makeup overlay (eyes, lashes, brows)
- Skin retouching and shaders
- Liquify / deformation tool for fuller lips
- Hair color and texture swap

Fully serverless on AWS.

---

## 2. Tech Stack

**Frontend**
- React 18
- Vite
- TensorFlow.js (`face-landmarks-detection`)

**Backend**
- AWS Lambda (Node.js 20.x runtime)

**Storage**
- S3 — images and assets
- DynamoDB — user data and sessions

**CDN**
- CloudFront distribution

**Infrastructure as Code**
- Terraform (HCL)

---

## 3. Rules for Claude Code

These are non-negotiable.

- **NEVER** deploy or provision AWS resources without explicit user approval
- **NEVER** hardcode secrets, API keys, or credentials — use environment variables
- **NEVER** skip error handling — every function must have try/catch or equivalent
- **NEVER** modify Terraform files without explaining the change first
- **NEVER** run `terraform apply` without user approval — always run `terraform plan` first
- **NEVER** commit or push to `main` — all work happens on `develop`
- **ALWAYS** check `PROJECT_STATUS.xml` before starting work
- **ALWAYS** update `PROJECT_STATUS.xml` after completing any task or encountering any error
- **ALWAYS** write code that passes ESLint before committing
- **ALWAYS** use conventional commit format: `feat:` / `fix:` / `docs:` / `chore:` / `refactor:` / `test:`
- **ALWAYS** explain what you are doing and why before doing it
- **NOTHING** gets deployed until the user explicitly verifies and approves

---

## 4. Git Branching Strategy

- `main` is production. Never commit directly.
- `develop` is the active working branch. All work happens here.
- Feature branches are optional. Branch off `develop` for large features.
- Claude Code must **ALWAYS** work on `develop`.
- Merges to `main` only happen after full verification through a pull request.

---

## 5. Architecture Constraints

- All backend is serverless. No EC2, no ECS, no containers.
- Lambda functions must stay under 15s execution time.
- S3 buckets must have versioning enabled and public access blocked.
- DynamoDB uses on-demand capacity mode.
- CloudFront enforces HTTPS only.
- All IAM roles follow least-privilege.
- Terraform state stored remotely in S3 backend.
- All Terraform changes require `plan` review before `apply`.

---

## 6. File Structure Rules

- React components → `frontend/src/components/`
- Custom hooks → `frontend/src/hooks/`
- Utilities → `frontend/src/utils/`
- Lambda code → `infrastructure/lambda/`
- Terraform configs → `infrastructure/terraform/` with each AWS resource in its own `.tf` file
- Never store `terraform.tfvars` in git

---

## 7. Verification Checklist

### Before ANY push to `develop`
- [ ] Code passes ESLint with zero errors
- [ ] No secrets or credentials in any file
- [ ] Error handling is present in every function
- [ ] Changes have been explained to the user
- [ ] User has approved the changes

### Before ANY infrastructure deploy
- [ ] `terraform plan` output has been reviewed
- [ ] S3 buckets are private
- [ ] Lambda IAM roles are least-privilege
- [ ] CloudFront uses HTTPS only
- [ ] CORS is configured restrictively
- [ ] Input validation on all Lambda endpoints
- [ ] Content-Security-Policy headers set
- [ ] Terraform state bucket is encrypted and private
- [ ] `terraform.tfvars` is in `.gitignore`
- [ ] User has explicitly approved `terraform apply`

---

## 8. Current Phase

Always check `PROJECT_STATUS.xml` for the active phase and task.

---

## 9. Error Handling Protocol

When an error occurs:

1. Log it in `PROJECT_STATUS.xml` with:
   - Timestamp
   - Phase
   - Task
   - Description
   - Attempted resolution
2. Do not proceed past the error without user acknowledgment.
