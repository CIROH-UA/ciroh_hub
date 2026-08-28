# CIROH Hub

CIROH Hub is constructed using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Repository

The source code for CIROH Hub is available at:  
[https://github.com/CIROH-UA/ciroh_hub](https://github.com/CIROH-UA/ciroh_hub)

## Environments

### Production
The production environment is available at:  

[https://hub.ciroh.org/](https://hub.ciroh.org/)

### Staging
The staging environment is used for testing and validating changes before deploying to production. This allows contributors to preview their changes in a live environment without affecting the production site.

[https://hub.ciroh.org/staging/main](https://hub.ciroh.org/staging/main): Daily preview; built from main branch when new changes are merged.  
[https://hub.ciroh.org/staging/{PR number}](https://github.com/CIROH-UA/subdomain-hub/tree/gh-pages/staging): Previews of PRs with the 'preview on staging' tag added by a maintainer. *(Hyperlink points to current contents of staging directory.)*

## How to Contribute

1. **Edit Content**: See something that needs to be updated? Click on the "Edit page" button at the bottom of the page to make direct changes to the documentation.

2. **Submit Changes**: Make your edits and create a Pull Request on GitHub. Your changes will be reviewed and merged by the admin team.

3. **Contribute a new Product or Blog Post**: If you have a product GitHub repository or Blog post that you'd like to submit, please create a new issue on GitHub

4. **Contribute to the Research Portal**: Information on contributing resources to a Portal can be found on [CIROH Hub's contribute page](https://hub.ciroh.org/contribute)

5. **Report Issues**: Found a bug or have a suggestion? Open an issue in the [GitHub repository](https://github.com/CIROH-UA/ciroh_hub) to help improve CIROH Hub.

## Setup for running CIROH Hub locally

To set up the project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/CIROH-UA/ciroh_hub.git
   cd ciroh_hub
   ```

2. **Install Node.js**: 
   Download and install the LTS version from [nodejs.org](https://nodejs.org/en) if you don't have it already.

3. **Install Dependencies**:
   ```bash
   npm install
   ```
   or 
   npm install --legacy-peer-deps

4. **Build for Production** (optional):
   ```bash
   npm run build
   ```
   This creates static files in the `build` directory that can be deployed to a web server.

5. **Run Development Server**:
   ```bash
   npm run start
   ```
   This will start a local development server at http://localhost:3000 
   
6. **View the Site**:
   Open your browser and navigate to http://localhost:3000 to see the local version of CIROH Hub.

   > **Note:** Some features (for example, Zotero integrations and other third-party services) require API keys provided via a local `.env` file. If you want to view and test those integrations locally, create an `.env` file with the required keys/secrets before running the site. Without these values, the site will still run, but the affected integrations may be unavailable or show limited functionality.

## How to validate PR locally

Go to GitHub Actions and Download the build folder from PR validate Action. Unzip the folder and run below command.
$ npx http-server
