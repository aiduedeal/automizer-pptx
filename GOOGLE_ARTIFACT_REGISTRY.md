# Publishing to Google Artifact Registry

## Prerequisites

1. Google Cloud account with Artifact Registry API enabled
2. A repository created in Google Artifact Registry
3. Proper permissions to publish packages

## Setup

1. **Create a repository in Google Artifact Registry**:
   ```bash
   gcloud artifacts repositories create REPOSITORY_NAME --repository-format=npm --location=REGION --description="NPM repository"
   ```

2. **Configure authentication**:

   - Using gcloud:
   ```bash
   gcloud auth application-default login
   ```

   - For CI/CD, create a service account with Artifact Registry Writer role and generate a key

3. **Update package.json**:
   - Ensure the `publishConfig` points to your repository
   - Replace placeholders with your actual values
   ```json
   "publishConfig": {
     "registry": "https://REGION-npm.pkg.dev/PROJECT_ID/REPOSITORY_NAME/"
   }
   ```

4. **Configure authentication in .npmrc**:
   - For local development, you can use gcloud credentials:
   ```bash
   npm config set //REGION-npm.pkg.dev/PROJECT_ID/REPOSITORY_NAME/:_authToken="$(gcloud auth print-access-token)"
   ```
   
   - For CI/CD environments, set the NPM_TOKEN environment variable

## Publishing

1. **Build the package**:
   ```bash
   npm run build
   ```

2. **Publish to the registry**:
   ```bash
   npm publish
   ```

## Installing the package

To install the package from your private registry:

1. **Configure authentication**:
   ```bash
   npm config set //REGION-npm.pkg.dev/PROJECT_ID/REPOSITORY_NAME/:_authToken="$(gcloud auth print-access-token)"
   ```

2. **Install the package**:
   ```bash
   npm install pptx-automizer --registry=https://REGION-npm.pkg.dev/PROJECT_ID/REPOSITORY_NAME/
   ```

## CI/CD Integration

For GitHub Actions, add these steps to your workflow:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '16'
    registry-url: 'https://REGION-npm.pkg.dev/PROJECT_ID/REPOSITORY_NAME/'

- name: Authenticate with Google Cloud
  uses: google-github-actions/auth@v1
  with:
    credentials_json: ${{ secrets.GOOGLE_CREDENTIALS }}

- name: Setup gcloud
  uses: google-github-actions/setup-gcloud@v1

- name: Set npm authentication token
  run: npm config set //REGION-npm.pkg.dev/PROJECT_ID/REPOSITORY_NAME/:_authToken "$(gcloud auth print-access-token)"

- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build

- name: Publish
  run: npm publish
``` 