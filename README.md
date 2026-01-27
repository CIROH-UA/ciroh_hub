# CIROH Hub

CIROH Hub is constructed using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Repository

The source code for CIROH Hub is available at:  
[https://github.com/CIROH-UA/ciroh-ua_website](https://github.com/CIROH-UA/ciroh-ua_website)

## Environments

### Production
The production environment is available at:  
[https://docs.ciroh.org/](https://docs.ciroh.org/)

### Staging
The staging environment is used for testing and validating changes before deploying to production. This allows contributors to preview their changes in a live environment without affecting the production site.
[https://docs.ciroh.org/docuhub-staging/](https://docs.ciroh.org/docuhub-staging/)

## How to Contribute

1. **Edit Content**: See something that needs to be updated? Click on the "Edit page" button at the bottom of the page to make direct changes to the documentation.

2. **Submit Changes**: Make your edits and create a Pull Request on GitHub. Your changes will be reviewed and merged by the admin team.

3. **Contribute to Products Tab**: For CIROH projects related to NextGen, please send your GitHub repository URL to the admin for inclusion.

4. **Contribute to Blog Section**: To add content to the blog, please follow the guidelines in [How to write a new Blog?](https://github.com/CIROH-UA/ciroh-ua_website/blob/main/blog/2023-10-29-intro-docuhub-blog.md)

5. **Report Issues**: Found a bug or have a suggestion? Open an issue in the [GitHub repository](https://github.com/CIROH-UA/ciroh-ua_website) to help improve CIROH Hub.

If you need help, please contact us at [ciroh-it-admin@ua.edu](mailto:ciroh-it-admin@ua.edu) or Arpita Patel at apatel54@ua.edu

## Setup for running CIROH Hub locally

To set up the project locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/CIROH-UA/ciroh-ua_website.git
   cd ciroh-ua_website
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

## How to validate PR locally

Go to GitHub Actions and Download the build folder from PR validate Action. Unzip the folder and run below command.
$ npx http-server
