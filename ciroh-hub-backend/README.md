# ciroh-hub-backend

Serverless backend for the CIROH Hub Docusaurus site, built with the AWS Serverless Application Model (SAM). It provides API endpoints that handle reCAPTCHA verification and proxy calls to third-party services (Wikimedia citation lookup, Zotero), keeping API keys out of the frontend bundle.

## Project layout

- `zotero-import-request/` — Lambda function that handles citation import requests. Verifies a reCAPTCHA token, fetches citation data from Wikimedia, and creates the item in the Zotero staging library.
- `layers/common/` — Shared code layer reused across Lambda functions (currently exports `verifyRecaptcha`).
- `events/` — Sample event payloads for local `sam local invoke` testing.
- `template.yaml` — SAM template defining the Lambda functions, API Gateway, layer, parameters, and outputs.
- `samconfig.toml` — SAM CLI configuration for deployment defaults.
- `env.json` — Local development environment variables (gitignored; you'll need to create your own — see below).

## Prerequisites

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) — configured with credentials that can deploy CloudFormation stacks
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Node.js 22](https://nodejs.org/en/) (matches the Lambda runtime)
- [Docker](https://www.docker.com/) (required for `sam local invoke` and `sam local start-api`)

## Local development

### 1. Create `env.json`

The Lambda needs several environment variables. Create a file `env.json` in this directory with your local development values:

```json
{
  "ZoteroImportRequestFunction": {
    "ALLOWED_ORIGIN": "http://localhost:3001",
    "RECAPTCHA_SECRET_KEY": "your_recaptcha_secret_key",
    "RECAPTCHA_ALLOWED_HOSTS": "localhost,hub.ciroh.org",
    "ZOTERO_API_KEY_READ_WRITE": "your_zotero_write_key",
    "ZOTERO_STAGING_GROUP_ID": "5943481"
  }
}
```

> **Do not commit `env.json`** — it's gitignored because it contains secrets.

### 2. Build and run the API locally

```bash
sam build
sam local start-api --env-vars env.json
```

The API will be available at `http://localhost:3000`. The Zotero import endpoint lives at:

```
POST http://localhost:3000/zotero-import-request
```

### 3. Test a single function with `sam local invoke`

Sample events are in the `events/` folder. To invoke the function against a test event:

```bash
sam local invoke ZoteroImportRequestFunction \
  --event events/zotero-import-request.json \
  --env-vars env.json
```

## Resources

- [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [Lambda Node.js runtime documentation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [Google reCAPTCHA v2 documentation](https://developers.google.com/recaptcha/docs/display)
- [Zotero Web API documentation](https://www.zotero.org/support/dev/web_api/v3/start)
