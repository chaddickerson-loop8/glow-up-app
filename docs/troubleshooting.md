# Troubleshooting

Living error log and fix reference for the Glow Up App.

---

## 1. Overview

This document is a living reference. Every time an error is encountered during development, it gets added here with:

- The **exact error message**
- Which **phase and task** it occurred during
- What **caused** it
- How it was **fixed**
- The **date**

Check here first before debugging — the answer may already exist. This file grows over time and serves as a knowledge base so the same problem never has to be debugged twice.

---

## 2. How to Use This File

1. **When you hit an error**, search this file first using `Ctrl+F` with keywords from the error message.
2. **If the error is already documented**, follow the fix.
3. **If it's a new error**, add it to the appropriate section below using the template in Section 3.
4. **Claude Code should also update `PROJECT_STATUS.xml`** with the error per the error handling protocol in `CLAUDE.md`.

---

## 3. Error Entry Template

All new entries must follow this format. Copy it, fill it in, and add it to the appropriate section.

```markdown
### Error: [Short description]

- **Date**: YYYY-MM-DD
- **Phase**: [phase number and name]
- **Task**: [task ID]
- **Error message**:
  ```
  [exact error text]
  ```
- **Root cause**: [what caused this]
- **Fix**: [exact steps to resolve, with commands in code blocks]
- **Status**: Resolved / Open
- **Prevention**: [what to do to avoid this in the future]
```

---

## 4. Git and Repository Issues

### Error: Repository not found when cloning via SSH

- **Date**: —
- **Phase**: Setup
- **Task**: Clone repository
- **Error message**:
  ```
  ERROR: Repository not found.
  fatal: Could not read from remote repository.
  ```
- **Root cause**: SSH key not configured for the GitHub account, or wrong account used.
- **Fix**: Verify your SSH key is added to the correct GitHub account. Run:
  ```bash
  ssh -T git@github.com
  ```
  If it shows the wrong username, add the correct SSH key in **GitHub Settings > SSH and GPG keys**.
- **Status**: Resolved
- **Prevention**: Always verify SSH connection before cloning with `ssh -T git@github.com`.

---

### Error: Push rejected because remote contains work you do not have locally

- **Date**: —
- **Phase**: Any
- **Task**: Git push
- **Error message**:
  ```
  Updates were rejected because the remote contains work that you do not have locally
  ```
- **Root cause**: Remote branch has commits that your local branch does not. Usually happens when the repo was created with a README on GitHub.
- **Fix**: Fetch the remote and align your local branch:
  ```bash
  git fetch origin
  # Option A — reset local to match remote (discards local-only commits):
  git reset --hard origin/main
  # Option B — rebase local commits on top of remote:
  git pull --rebase origin main
  ```
- **Status**: Resolved
- **Prevention**: Always `git pull` before starting work.

---

### Error: Accidentally committed to main instead of develop

- **Date**: —
- **Phase**: Any
- **Task**: Any
- **Error message**: N/A (no error — wrong branch)
- **Root cause**: Forgot to switch branches before working.
- **Fix**: Move the commits to `develop` and undo them from `main`:
  ```bash
  git log                          # identify the commit hashes
  git checkout develop
  git cherry-pick <commit-hash>    # repeat for each commit
  git checkout main
  git reset --hard origin/main     # undo the commits from main
  ```
- **Status**: Resolved
- **Prevention**: Always run `git branch` before starting work to verify you are on `develop`. The `CLAUDE.md` rules and `.claude/settings.json` protect against this.

---

## 5. Terraform Issues

### Error: S3 bucket name already exists

- **Date**: —
- **Phase**: Phase 3 — Infrastructure
- **Task**: Terraform state bucket bootstrap
- **Error message**:
  ```
  BucketAlreadyExists
  ```
  or
  ```
  BucketAlreadyOwnedByYou
  ```
- **Root cause**: S3 bucket names are globally unique across all AWS accounts. Someone else already has this name.
- **Fix**: Append your AWS account ID to the bucket name. Example:
  ```
  glow-up-app-tf-state-123456789012
  ```
  Update the name in your `.env` file and in any Terraform backend config.
- **Status**: Resolved
- **Prevention**: Always use account-ID-suffixed bucket names. See the note in `docs/runbook.md` Section 5 and `.env.example`.

---

### Error: terraform init fails with backend configuration error

- **Date**: —
- **Phase**: Phase 3 — Infrastructure
- **Task**: Terraform init
- **Error message**:
  ```
  Error configuring the backend "s3"
  ```
- **Root cause**: The S3 state bucket does not exist yet, or AWS credentials are not configured.
- **Fix**: Create the state bucket first using the bootstrap commands in `docs/runbook.md` Section 5, Step 1. Verify AWS credentials with:
  ```bash
  aws sts get-caller-identity
  ```
- **Status**: Resolved
- **Prevention**: Always run the bootstrap steps before `terraform init`.

---

### Error: Access Denied when running terraform plan or apply

- **Date**: —
- **Phase**: Phase 3 — Infrastructure
- **Task**: Terraform plan/apply
- **Error message**:
  ```
  AccessDenied
  ```
- **Root cause**: The IAM user or role running Terraform does not have sufficient permissions.
- **Fix**: Check which IAM identity is being used:
  ```bash
  aws sts get-caller-identity
  ```
  Verify it has permissions for the resources Terraform is trying to manage. At minimum it needs S3, DynamoDB, Lambda, CloudFront, IAM, and API Gateway permissions.
- **Status**: Resolved
- **Prevention**: Use an IAM user with `AdministratorAccess` during development only. Lock down to specific permissions for production.

---

## 6. Frontend Issues

### Error: Camera permissions denied

- **Date**: —
- **Phase**: Phase 2 — Frontend
- **Task**: Camera integration
- **Error message**:
  ```
  NotAllowedError: Permission denied
  ```
  (or similar browser-specific message)
- **Root cause**: Browser requires HTTPS for the `getUserMedia` API, or the user denied camera permission.
- **Fix**: `localhost` is exempt from the HTTPS requirement in most browsers. If using a different hostname, HTTPS is required. Check browser settings to ensure camera permission is allowed for the site.
- **Status**: Resolved
- **Prevention**: Always test on `localhost` during development.

---

### Error: TensorFlow.js model fails to load

- **Date**: —
- **Phase**: Phase 2 — Frontend
- **Task**: Face landmark detection
- **Error message**: Varies (check browser console)
- **Root cause**: Model files are large and may fail to download on slow connections, or CORS may block the download.
- **Fix**: Check the browser console for the specific error. If CORS, ensure the model is served from the same origin or CORS headers are set. If timeout, check network connection.
- **Status**: Resolved
- **Prevention**: Add loading state and error handling around model initialization.

---

### Error: npm install fails with dependency conflicts

- **Date**: —
- **Phase**: Phase 2 — Frontend
- **Task**: Dependency install
- **Error message**:
  ```
  ERESOLVE unable to resolve dependency tree
  ```
- **Root cause**: Version conflicts between packages, especially TensorFlow.js and its dependencies.
- **Fix**: Try installing with the legacy peer deps flag:
  ```bash
  npm install --legacy-peer-deps
  ```
  If that fails, check which packages conflict and pin versions in `package.json`.
- **Status**: Resolved
- **Prevention**: Pin exact versions in `package.json` rather than using `^` or `~` ranges.

---

## 7. AWS and Deployment Issues

### Error: Lambda function timeout

- **Date**: —
- **Phase**: Phase 3+ — Deployment
- **Task**: Lambda execution
- **Error message**:
  ```
  Task timed out after X.XX seconds
  ```
- **Root cause**: Function execution exceeds the configured timeout (default 3 seconds).
- **Fix**: Increase timeout in `lambda.tf`, but never exceed 15 seconds per the architecture constraints in `CLAUDE.md`. If the function genuinely needs more than 15 seconds, the logic needs to be restructured.
- **Status**: Resolved
- **Prevention**: Keep Lambda functions thin — only API logic, no heavy processing.

---

### Error: CORS errors in browser console

- **Date**: —
- **Phase**: Phase 3+ — Integration
- **Task**: Frontend-to-API communication
- **Error message**:
  ```
  Access to fetch at '...' from origin '...' has been blocked by CORS policy
  ```
- **Root cause**: API Gateway CORS configuration does not include the frontend's domain.
- **Fix**: Update CORS configuration in API Gateway to include the CloudFront domain. Must allow the specific origin, not a wildcard, for security.
- **Status**: Resolved
- **Prevention**: Configure CORS in Terraform from the start with the correct CloudFront domain.

---

### Error: CloudFront serving stale content after deployment

- **Date**: —
- **Phase**: Phase 3+ — Deployment
- **Task**: Frontend deploy
- **Error message**: N/A (old version of the site loads instead of new)
- **Root cause**: CloudFront caches files at edge locations. A new deployment does not automatically invalidate the cache.
- **Fix**: Run a CloudFront cache invalidation:
  ```bash
  aws cloudfront create-invalidation \
    --distribution-id YOUR_DIST_ID \
    --paths "/*"
  ```
- **Status**: Resolved
- **Prevention**: Include cache invalidation in the deployment script.

---

## 8. Session Recovery

When starting a new work session:

1. Open `PROJECT_STATUS.xml` to see the current phase, task, and any open errors.
2. Check this troubleshooting doc for any unresolved issues from the last session (search for **Status: Open**).
3. Verify your branch and working tree:
   ```bash
   git status
   git branch
   ```
   Confirm you are on `develop` with a clean working tree.
4. Pull the latest changes:
   ```bash
   git pull origin develop
   ```
5. Resume from where `PROJECT_STATUS.xml` says to pick up.
