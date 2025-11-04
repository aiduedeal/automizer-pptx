# Automizer-PPTX Deployment Guide

## Overview

This package is automatically deployed to Google Artifact Registry when changes are pushed to the `main` branch.

## Repository

- **GitHub**: https://github.com/aiduedeal/automizer-pptx
- **Artifact Registry**: https://us-central1-npm.pkg.dev/duedeal-staging/automizer-pptx/

## Automated Deployment

### Workflow Triggers

1. **Push to main branch**: Automatically builds, tests, and publishes
2. **Git tags (v*)**: Creates GitHub releases
3. **Manual trigger**: Via GitHub Actions UI

### Workflow Steps

1. Checkout code
2. Set up Node.js 20
3. Authenticate to Google Cloud using Workload Identity Federation
4. Configure npm authentication with Artifact Registry
5. Install dependencies
6. Build package (`npm run build`)
7. Run tests (`npm test`)
8. Publish to Artifact Registry (`npm publish`)
9. Create GitHub release (for tagged versions)

## Local Development

### Prerequisites

- Node.js 20+
- npm
- Google Cloud SDK (for publishing)
- Access to `duedeal-staging` GCP project

### Setup

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test-coverage

# Lint code
npm run lint

# Format code
npm run prettier
```

### Local Publishing

To publish locally (requires GCP authentication):

```bash
# Authenticate with Google Cloud
gcloud auth application-default login

# Configure npm to use Artifact Registry
npx google-artifactregistry-auth --repo-config=.npmrc

# Build and publish
npm run build
npm publish
```

## Version Management

### Bumping Versions

```bash
# Patch version (0.0.4 -> 0.0.5)
npm version patch

# Minor version (0.0.4 -> 0.1.0)
npm version minor

# Major version (0.0.4 -> 1.0.0)
npm version major
```

### Creating Releases

```bash
# Bump version and create git tag
npm version patch

# Push tag to trigger release workflow
git push origin main --tags
```

## Workload Identity Federation

The deployment uses Workload Identity Federation instead of service account keys for enhanced security.

**Configuration:**
- **Workload Identity Provider**: `projects/945024390284/locations/global/workloadIdentityPools/github-actions-pool/providers/github`
- **Service Account**: `github-actions@duedeal-staging.iam.gserviceaccount.com`
- **Repository**: `aiduedeal/automizer-pptx`

### Setup Script

To configure Workload Identity for this repository:

```bash
cd /Users/stefanidr/Work/duedeal/duedeal-service
./scripts/add-github-secrets.sh aiduedeal/automizer-pptx duedeal-staging
```

## Consuming the Package

### In duedeal-service

Update `package.json`:

```json
{
  "dependencies": {
    "automizer-pptx": "^0.0.4"
  }
}
```

Update `.npmrc`:

```
@automizer-pptx:registry=https://us-central1-npm.pkg.dev/duedeal-staging/automizer-pptx/
//us-central1-npm.pkg.dev/duedeal-staging/automizer-pptx/:always-auth=true
```

Authenticate and install:

```bash
npx google-artifactregistry-auth --repo-config=.npmrc
npm install
```

### In GitHub Actions

The workflow automatically configures authentication using Workload Identity Federation:

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/945024390284/locations/global/workloadIdentityPools/github-actions-pool/providers/github'
    service_account: 'github-actions@duedeal-staging.iam.gserviceaccount.com'

- name: Configure npm authentication
  run: npx google-artifactregistry-auth --repo-config=.npmrc
```

## Troubleshooting

### Authentication Issues

If you encounter `401 Unauthorized` errors:

```bash
# Re-authenticate with gcloud
gcloud auth application-default login

# Re-configure npm
npx google-artifactregistry-auth --repo-config=.npmrc
```

### Build Failures

Check the GitHub Actions logs:
```bash
gh run list --repo aiduedeal/automizer-pptx
gh run view <run-id> --repo aiduedeal/automizer-pptx
```

### Package Not Found

Verify the package exists:
```bash
gcloud artifacts packages list \
  --repository=automizer-pptx \
  --location=us-central1 \
  --project=duedeal-staging
```

## Related Documentation

- [Artifact Registry Migration Tool](../duedeal-service/docs/artifact-registry-migration.md)
- [GitHub Workload Identity Setup](../duedeal-service/scripts/add-github-secrets.sh)
- [duedeal-service Deployment Workflow](../duedeal-service/.github/workflows/deploy.yml)
