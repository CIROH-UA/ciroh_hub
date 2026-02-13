import { themes as prismThemes } from "prism-react-renderer";
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = "/local/";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "CIROH Hub",
  tagline: "Hydrologic Science Research Data and Products",
  staticDirectories: ["static", "img"],
  url: "http://ciroh.org",
  baseUrl: baseUrl,
  onBrokenLinks: "ignore",
  favicon: "img/logos/CIROH_Hub_logo.png",

  customFields: {
    apiBaseUrl:
      process.env.REACT_APP_API_BASE_URL ||
      process.env.VITE_API_BASE_URL ||
      'https://67h5z9ih7j.execute-api.us-east-1.amazonaws.com/default',
    onBrokenMarkdownLinks: "warn",
    onBrokenMarkdownImages: "warn",
    githubProjectToken: process.env.GITHUB_PROJECT_TOKEN,

    // Workaround to fix page highlighting in the
    // product/documentation section.
    // If a docs subfolder is listed here, its navbar entries
    // will only be highlighted if the page is an exact match.
    navbarReduceSubpageHighlights: [
      "products",
    ],

    // Workaround to add descriptive text to blog sidebars.
    // Supports any number of blogs.
    // 
    // For each blog, the injector matches against the
    // sidebar title. If it matches, the html segment
    // will be inserted below the sidebar title.
    // 
    // This approach is somewhat hacky, but the blog
    // plug-in locks down access to custom fields,
    // so it's the best option available for now.
    blogSidebarInjection: [
      {
        sidebarTitle: "CIROH Hub Blog",
        html: `
          <div style="font-size: 0.9rem; margin-bottom: 0.6rem; margin-right:1rem">
            Exclusive content for researchers utilizing CIROH Cyberinfrastructure resources.
            Share your insights, discoveries, and experiences with the hydrologic science community.
          </div>
          <div style="font-size: 0.9rem; margin-bottom: 1rem; margin-right:1rem">
            This blog platform is dedicated to highlighting the innovative work of researchers who
            have leveraged CIROH's computational tools and resources to advance water science.
            Your stories help demonstrate the value of our shared infrastructure and inspire new
            applications across the field.
          </div>
          <a 
            href="https://github.com/CIROH-UA/ciroh_hub/issues/new?template=docuhub-blog-post.md" 
            target="_blank" 
            rel="noopener noreferrer"
            style="
              display: inline-block;
              padding: 0.5rem 1rem;
              margin-bottom: 1rem;
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-size: 0.9rem;
              font-weight: 500;
              transition: all 0.2s ease;
              box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2);
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(34, 197, 94, 0.3)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(34, 197, 94, 0.2)';"
          >
            Submit Your Blog
          </a>
        `
      },

    ],
    zotero_api_key: process.env.ZOTERO_API_KEY || "dummy",
    zotero_group_id: process.env.ZOTERO_CIROH_GROUP_ID,
    captcha_key: process.env.CAPTCHA_KEY || "dummy",
    s3_bucket: process.env.S3_BUCKET_NAME,
    s3_access_key: process.env.S3_ACCESS_KEY,
    s3_secret_key: process.env.S3_SECRET_KEY,
    s3_region: process.env.S3_REGION,
    hs_client_id: process.env.HS_CLIENT_ID || "dummy",
    hs_scopes: ['read', 'write'],
    hs_authorize_url: "https://www.hydroshare.org/o/authorize/",
    hs_token_url: "https://www.hydroshare.org/o/token/",
    hs_redirect_uri: "https://portal.ciroh.org/contribute",
    hs_logout_endpoint: "https://www.hydroshare.org/accounts/logout/",
    hs_logout_redirect: "https://portal.ciroh.org/contribute",
    // URL for submitting a new product request (used in ProductCards component)
    productIssueUrl: "https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=product-request.md",

    // Centralized external links used across pages/components
    externalLinks: {
      zoteroLogin: "https://www.zotero.org/user/login",
      feedbackForm: "https://forms.cloud.microsoft/r/NzA2sLrzeJ",
    },

    // Optional links for contribution CTAs
    blogIdeaUrl: "https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=docuhub-blog-post.md",
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "CIROH-UA", // Usually your GitHub org/user name.
  projectName: "CIROH-UA", // Usually your repo name.

  // Future flags. (In preparation for Docusaurus v4.)
  future: {
    v4: true,
    experimental_faster: true,
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({

        gtag: process.env.NODE_ENV === 'production'
          ? { trackingID: 'G-WLZBZD1ST7', anonymizeIP: true }
          : undefined,
        blog: false, // Blogs and its settings are now in the custom blog plugin below. Its because we have tags based filters in community impact page. Those filters are coming from Blog posts.
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/CIROH-UA/ciroh-ua_website/edit/main/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  plugins: [
    // Lunr Search Plugin for search functionality
    [
      require.resolve('docusaurus-lunr-search'),
      {
        languages: ['en'], // language codes for search
      }
    ],

    // Draw.io Plugin for embedding diagrams
    ['drawio', {}],

    // Custom Blog Plugin
    [
      './plugins/plugin-content-blog.js',
      {
        id: "blog",
        blogTitle: "CIROH Hub blog!",
        blogDescription: "A CIROH Hub powered blog!",
        postsPerPage: "ALL", // Display all posts on a single page
        path: "blog", // Path to the blog posts
        authorsMapPath: "authors.yaml", // Path to the authors' mapping file
        blogSidebarCount: "ALL",
        blogSidebarTitle: "CIROH Hub Blog",
      }
    ],

    // Release notes (also based on the custom blog plugin)
    [
      './plugins/plugin-content-blog.js',
      {
        id: "release-notes",
        blogTitle: "CIROH Hub release notes!",
        blogDescription: "A quick glance at what's new in CIROH Hub.",
        postsPerPage: "ALL", // Display all posts on a single page
        path: "release-notes", // Path to the blog posts
        routeBasePath: 'release-notes', // Slug for the blog
        //authorsMapPath: "authors.yaml", // Path to the authors' mapping file (unneeded in this case)
      }
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    (
      {
        /*announcementBar: {
          id: 'scimeet25_survey_notice',
          content:
            '🔧 Do you have any thoughts on CIROH Hub or Portal? We\'d love to hear from you! <a target="_blank" rel="noopener noreferrer" href="'+baseUrl+'scimeet25survey">Take the CIROH Hub/Portal User Survey here</a>.',
          backgroundColor: '#0081d2ff',
          textColor: '#fff',
          isCloseable: true,
        },*/
        colorMode: {
          defaultMode: 'dark',
          disableSwitch: false,
          respectPrefersColorScheme: false,
        },
        docs: {
          sidebar: {
            autoCollapseCategories: false,
            hideable: true,
          },
        },
        stylesheets: [
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
          // ... other stylesheets
        ],
        navbar: {
          title: "CIROH Hub",
          logo: {
            alt: "CIROH Logo",
            src: "img/logos/ciroh-bgsafe.png",
          },
          items: [
            {
              label: "Research Portal",
              position: "left",
              items: [
                {
                  href: "/apps",
                  label: "Apps",
                },
                {
                  href: "/datasets",
                  label: "Datasets",
                },
                {
                  href: "/courses",
                  label: "Courses",
                },
                {
                  href: "/presentations",
                  label: "Presentations",
                },
                {
                  href: "/publications",
                  label: "Publications",
                },
                {
                  href: "/notebooks",
                  label: "Notebooks",
                },
              ],
            },
            {
              label: "Documentation",
              position: "left",
              items: [
                // The sidebar loader is weirdly brittle. If a page is instantiated in "index.js", that must be specified explicitly.
                {
                  type: "doc",
                  docId: "products/ngiab/index",
                  label: "NGIAB",
                },
                {
                  type: "doc",
                  docId: "products/research-datastream/index",
                  label: "NRDS",
                },
                {
                  type: "doc",
                  docId: "products/evaluation/rtiteehr/index",
                  label: "TEEHR",
                },
                {
                  type: "doc",
                  docId: "products/community-fim/fimserv/index",
                  label: "FIM as a Service",
                },
                {
                  type: "doc",
                  docId: "products/data-management/bigquery-api/index",
                  label: "NWM BigQuery API",
                },
                {
                  type: "doc",
                  docId: "products/intro",
                  label: "Browse all documentation...",
                },
              ],
            },
            {
              label: "Operations",
              position: "left",
              items: [
                {
                  type: "doc",
                  docId: "services/intro",
                  label: "IT Services",
                },
                {
                  type: "doc",
                  docId: "policies/intro",
                  label: "Policies",
                },
                {
                  href: "/working-groups",
                  label: "Working Groups",
                },
              ],
            },
            {
              label: "Community",
              position: "left",
              items: [
                {
                  href: "/impact",
                  label: "Community Impact",
                },
                {
                  href: "/contribute",
                  label: "Contribute",
                },
              ],
            },
            {
            label: "Updates",
            position: "left",
            items: [
              {
                href: "/blog",
                label: "Blog",
              },
              {
                href: "/news",
                label: "News",
              },
              {
                href: "/release-notes",
                label: "Release Notes",
              }
            ]
          },
          ],
        },
        footer: {
          style: "dark",
          links: [
            {
              title: 'Quick Links',
              items: [
                {
                  label: 'Contact Us',
                  href: '/contact'
                },
                {
                  label: 'Contribute',
                  href: '/contribute'
                },
                /*{
                  label: 'Feedback',
                  href: 'https://forms.office.com/r/5ww7qRWwwf'
                },*/
                {
                  label: 'Release Notes',
                  href: '/release-notes'
                },
              ]
            },
            {
              title: 'About CIROH',
              items: [
                {
                  label: 'About Us',
                  href: 'https://ciroh.ua.edu/about/'
                },
                {
                  label: 'Members & Partners',
                  href: 'https://ciroh.ua.edu/about/ciroh-partners/'
                },
                {
                  label: 'Contact CIROH',
                  href: 'https://ciroh.ua.edu/contact-us/'
                },
                {
                  label: 'CIROH Hub Repository',
                  href: 'https://github.com/CIROH-UA/ciroh_hub'
                },
              ]
            },
            {
              title: "Follow us on",
              items: [
                {
                  html: `
                  <div class="footer-social-links">
                    <a href="https://github.com/CIROH-UA" target="_blank" rel="noreferrer noopener" aria-label="Visit CIROH">
                      <img src="${baseUrl}img/socials/github_light.svg" alt="CIROH on GitHub" width="40" height="40" />
                    </a>
                    <a href="https://www.linkedin.com/company/uaciroh/" target="_blank" rel="noreferrer noopener" aria-label="CIROH on LinkedIn">
                      <img src="${baseUrl}img/socials/linkedin_light.svg" alt="CIROH on LinkedIn" width="40" height="40" />
                    </a>
                    <a href="https://www.youtube.com/@UA_CIROH" target="_blank" rel="noreferrer noopener" aria-label="CIROH on YouTube">
                      <img src="${baseUrl}img/socials/youtube_light.svg" alt="CIROH on YouTube" width="40" height="40" />
                    </a>
                  </div>
                `,
                },
                {
                  html: `
                <div class="footer-social-links"> 
                  <a href="https://www.instagram.com/ua_ciroh/" target="_blank" rel="noreferrer noopener" aria-label="CIROH on Instagram">
                    <img src="${baseUrl}img/socials/instagram_light.svg" alt="CIROH on Instagram" width="40" height="40" />
                  </a>       
                  <a href="https://www.facebook.com/UACIROH/" target="_blank" rel="noreferrer noopener" aria-label="CIROH on Facebook">
                    <img src="${baseUrl}img/socials/facebook_light.svg" alt="CIROH on Facebook" width="40" height="40" />
                  </a>              
                  <a href="https://twitter.com/UA_CIROH" target="_blank" rel="noreferrer noopener" aria-label="CIROH on X (Twitter)">
                    <img src="${baseUrl}img/socials/x_light.svg" alt="CIROH on X (Twitter)" width="40" height="40" />
                  </a>
                </div>
                `,
                },
              ],
            },
          ],
          copyright: `
          <div class="footer__attrib">
            Developed with ❤️ by the CIROH Hub Team
          </div>
          <div class="footer__funding">
            This research was supported by the Cooperative Institute for Research to Operations in Hydrology
            (CIROH) with funding under award NA22NWS4320003 from the NOAA Cooperative Institute Program.
            The statements, findings, conclusions, and recommendations are those of the author(s) and do not
            necessarily reflect the opinions of NOAA.
          </div>
          <div class="footer__bottom">
            Copyright © ${new Date().getFullYear()} CIROH - The University of Alabama
          </div>
          `,
        },
        prism: {
          theme: prismThemes.github,
          darkTheme: prismThemes.dracula,
        },
      }),

};

module.exports = config;


