import { themes as prismThemes } from "prism-react-renderer";

const baseUrl = "/";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "CIROH Hub",
  tagline: "Documenting Water Research in the Digital Age",
  staticDirectories: ["static", "img"],
  url: "http://ciroh.org",
  baseUrl: baseUrl,
  onBrokenLinks: "ignore",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/logos/docuhub.png",

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
        
        // gtag: process.env.NODE_ENV === 'production'
        //   ? { trackingID: 'G-7KD31X6H62', anonymizeIP: true }
        //   : undefined,
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

    // Redirects (handler for dead links)
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // Resources page redirect
          {
            to: '/community_products',
            from: '/resources',
          },
          // Feedback page: grandfather in old Science Meeting survey links
          {
            to: '/feedback',
            from: '/scimeet25survey',
          },
          // NGIAB: manual redirects to reflect heavy folder refactoring
          {
            to: '/docs/products/ngiab',
            from: '/docs/products/Community Hydrologic Modeling Framework',
          },
          {
            to: '/docs/products/ngiab/components/ngiab-preprocessor',
            from: '/docs/products/Community Hydrologic Modeling Framework/ngiabpreprocessor',
          },
          {
            to: '/docs/products/ngiab/components/ngiab-teehr',
            from: '/docs/products/Community Hydrologic Modeling Framework/nextgeninaboxTeehr',
          },
          {
            to: '/docs/products/ngiab/components/ngiab-visualizer',
            from: '/docs/products/Community Hydrologic Modeling Framework/nextgeninaboxVisualizer',
          },
          {
            to: '/docs/products/ngiab/components/ngiab-calibration',
            from: '/docs/products/Community Hydrologic Modeling Framework/nextgeninaboxCalibration',
          },
          {
            to: '/docs/products/ngiab/distributions/ngiab-docker',
            from: '/docs/products/Community Hydrologic Modeling Framework/nextgeninaboxDocker',
          },
          {
            to: '/docs/products/ngiab/distributions/ngiab-singularity',
            from: '/docs/products/Community Hydrologic Modeling Framework/nextgeninaboxSingularity',
          },
          {
            to: '/docs/products/ngiab/distributions/nextgen-2i2c',
            from: '/docs/products/Community Hydrologic Modeling Framework/nextgenon2i2c',
          },
          {
            to: '/docs/products/research-datastream/',
            from: [
              '/docs/products/Community Hydrologic Modeling Framework/nextgenDatastream/nextgenDatastream',
              '/docs/products/Community Hydrologic Modeling Framework/nextgenDatastream',
            ],
          },
          {
            to: '/docs/products/research-datastream/forcingprocessor/',
            from: [
              '/docs/products/Community Hydrologic Modeling Framework/nextgenDatastream/forcingprocessor/',
              '/docs/products/research-datastream/components/forcingprocessor/'
            ]
          },
          {
            to: '/docs/products/research-datastream/datastreamcli/python_tools/',
            from: [
              '/docs/products/research-datastream/components/python_tools/'
            ]
          },
          {
            to: '/docs/products/research-datastream/nrds-aws/',
            from: [
              '/docs/products/research-datastream/components/research_datastream/'
            ]
          },
          {
            to: '/docs/products/ngiab/components/community-hydrofabric',
            from: '/docs/products/Community Hydrologic Modeling Framework/communityHydrofabric',
          },
          {
            to: '/docs/products/ngiab/dashboard',
            from: '/docs/products/Community Hydrologic Modeling Framework/repositorydashboard',
          },
          {
            to: '/docs/products/ngiab/office-hours',
            from: '/docs/products/Community Hydrologic Modeling Framework/ngiabOfficeHours',
          },
          // Snow sensing: manual redirects to normalize URL style
          {
            to: '/docs/products/snow-tools',
            from: '/docs/products/Snow Sensing and Modeling Tools',
          },
          {
            to: '/docs/products/snow-tools/snow-intro',
            from: '/docs/products/Snow Sensing and Modeling Tools/Intro-to-Snow-Observations-Modeling-Analysis',
          },
          {
            to: '/docs/products/snow-tools/optimize-sensors',
            from: '/docs/products/Snow Sensing and Modeling Tools/Optimized_Snow_Sensor_Location',
          },
          {
            to: '/docs/products/snow-tools/snow-sensing',
            from: '/docs/products/Snow Sensing and Modeling Tools/snow_sensing',
          },
          {
            to: '/docs/products/snow-tools/sweml-v2-0',
            from: '/docs/products/Snow Sensing and Modeling Tools/SWEMLv2.0',
          },
          // Community FIM: manual redirects to normalize URL style
          {
            to: '/docs/products/community-fim',
            from: '/docs/products/Community Flood Inundation Mapping',
          },
          {
            to: '/docs/products/community-fim/fimserv',
            from: '/docs/products/Community Flood Inundation Mapping/FIM as a Service',
          },
          {
            to: '/docs/products/community-fim/fimeval',
            from: '/docs/products/Community Flood Inundation Mapping/FIM Evaluation Framework',
          },
          {
            to: '/docs/products/community-fim/fim-database',
            from: '/docs/products/Community Flood Inundation Mapping/FIM Database',
          },
          // Google Cloud: standalone fix
          {
            to: '/docs/services/cloudservices/google-cloud',
            from: '/docs/products/cloudservices/google cloud',
          },

        ],
        createRedirects(existingPath) {
          // JupyterHub redirects
          if (existingPath.includes('/docs/services/cloudservices/2i2c/')) {
            return [
              existingPath.replace('/docs/services/cloudservices/2i2c/', '/docs/services/cloudservices/2i2c/documentation/'),
              existingPath.replace('/docs/services/cloudservices/2i2c/', '/docs/services/cloudservices/ciroh jupyterhub/'),
              existingPath.replace('/docs/services/cloudservices/2i2c/', '/docs/services/cloudservices/ciroh jupyterhub/documentation'),
            ];
          }
          // Otherwise, paths have only been changed en masse for the products section, so return early if not in there
          if (!existingPath.includes('/docs/products/')) {
            return undefined; // Return a falsy value: no redirect created
          }
          // Products redirects
          if (existingPath.includes('/docs/products/ngiab/research-datastream/datastreamcli')) {
            return [
              existingPath.replace('/docs/products/ngiab/research-datastream/datastreamcli', '/docs/products/research-datastream/cli'),
            ];
          }
          if (existingPath.includes('/docs/products/ngiab/ngiab-intro')) {
            return [
              existingPath.replace('/docs/products/ngiab/ngiab-intro', '/docs/products/Community Hydrologic Modeling Framework/ngiabintro'),
            ];
          }
          if (existingPath.includes('/docs/products/ml-ai')) {
            return [
              existingPath.replace('/docs/products/ml-ai', '/docs/products/Machine Learning and AI Tools'),
            ];
          }
          if (existingPath.includes('/docs/products/evaluation')) {
            return [
              existingPath.replace('/docs/products/evaluation', '/docs/products/Evaluation Tools'),
            ];
          }
          if (existingPath.includes('/docs/products/visualization')) {
            return [
              existingPath.replace('/docs/products/visualization', '/docs/products/Visualization and Analysis Tools'),
            ];
          }
          if (existingPath.includes('/docs/products/mobile-apps')) {
            return [
              existingPath.replace('/docs/products/mobile-apps', '/docs/products/Mobile Apps'),
            ];
          }
          if (existingPath.includes('/docs/products/data-management')) {
            return [
              existingPath.replace('/docs/products/data-management', '/docs/products/Data Management and Access Tools'),
            ];
          }
          return undefined; // Return a falsy value: no redirect created
        },
      },
    ],
  ],

  customFields: {
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
            href="https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=docuhub-blog-post.md" 
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

    // URL for submitting a new product request (used in ProductCards component)
    productIssueUrl: "https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=product-request.md",

    // Centralized external links used across pages/components
    externalLinks: {
      zoteroLogin: "https://www.zotero.org/user/login",
      feedbackForm: "https://forms.office.com/r/5ww7qRWwwf",
    },

    // Optional links for contribution CTAs
  blogIdeaUrl: "https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=docuhub-blog-post.md",

  },

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
          src: "img/logos/docuhub.png",
        },
        items: [
          {
            label: "About CIROH",
            position: "left",
            items: [
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
            label: "Research & Innovation",
            position: "left",
            items: [
              {
                href: "/publications",
                label: "Publications",
              },
              {
                type: "doc",
                docId: "products/intro",
                label: "Softwares",
              },
              {
                type: "doc",
                docId: "services/intro",
                label: "Services",
              },
              {
                href: "/community_products",
                label: "Community Products",
              },
            ],
          },
          {
            label: "Community & Collaboration",
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
            href: "/blog",
            label: "Blog",
            position: "right",
          },
          {
            href: "/news",
            label: "News",
            position: "right",
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
                label: 'Community Products',
                href: '/community_products'
              },
              {
                label: 'Contact Us',
                href: '/contact'
              },
              {
                label: 'Contribute',
                href: '/contribute'
              },
              {
                label: 'Feedback',
                href: 'https://forms.office.com/r/5ww7qRWwwf'
              },
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
                href: 'https://github.com/CIROH-UA/ciroh-ua_website'
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
            Developed with ❤️ by DocuHub Team at CIROH
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
