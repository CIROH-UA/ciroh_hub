import {useEffect} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './contribute.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HydroShareCard from '@site/src/components/HydroShareCard';
import clsx from 'clsx';
import Header from '@site/src/components/Header';
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import { useColorMode } from '@docusaurus/theme-common';

export default function Contribute() {
  return (
    <Layout
      title="Contribute to CIROH"
      description="Learn how to contribute to CIROH's open science initiatives">
      <ContributeContent />
    </Layout>
  );
}

function ContributeContent() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  const contactUrl = useBaseUrl('/contact');
  const zoteroLogin = siteConfig?.customFields?.externalLinks?.zoteroLogin || 'https://www.zotero.org/user/login';
  const feedbackUrl = siteConfig?.customFields?.externalLinks?.feedbackForm || 'https://forms.cloud.microsoft/r/NzA2sLrzeJ';
  const addProductUrl = "https://github.com/CIROH-UA/ciroh_hub/issues/new?assignees=&labels=on-prem&projects=&template=product-request.md";
  const blogIdeaUrl = siteConfig?.customFields?.blogIdeaUrl || 'https://github.com/CIROH-UA/ciroh_hub/issues/new?template=docuhub-blog-post.md';
  const wgIntakeFormUrl = siteConfig?.customFields?.externalLinks?.wgIntakeForm || 'https://app.smartsheet.com/b/form/07569d6285f643c1a57fd18daab98f7e'; // TODO: Replace with actual WG intake form URL

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const yOffset = -100;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
        <div className="margin-top--lg">
          <Header
            title="Contribute to CIROH"
            tagline="Join our community of researchers, developers, and water science enthusiasts. Your contributions help advance hydrologic science and support NOAA's water prediction initiatives."
          />
        </div>
      </section>

        {/* Main Content */}
        <div className={styles.mainContainer}>
          {/* Mission Statement Callout (flat) */}
          <div className={styles.flatMissionText}>
            <p>
              Share your work where the community can find it. Upload your courses, presentations,
              datasets, and apps to <a href={useBaseUrl('/resources')}>HydroShare</a> and they'll be
              showcased right here in CIROH Hub for broader reach. Publish your papers to <a href={zoteroLogin} target="_blank" rel="noreferrer noopener">Zotero</a> and they'll appear here as part of CIROH's shared library.
            </p>
          </div>
          {/* Note: horizontal rules around Hydroshare have added margins for spacing */}
          <hr className="margin-vert--xl" />

          {/* Contribute to HydroShare */}
          <HydroShareCard />
          
          <hr className="margin-top--xl" />

          {/* Contribute to Resources Documentation */}
          <section id="resources-documentation" className={clsx(styles.zoteroSection, "margin-vert--xl")}>
            <div className={styles.zoteroHeader}>
              <h2 className={styles.zoteroTitle}>Contribute to Resources Documentation</h2>
              <p className={styles.zoteroSubtitle}>
                Document your software or research product in the Resources section. Create a landing page 
                where new users can discover your work, understand what it does, and find links to get started.
              </p>
            </div>

            {/* Content guidance */}
            <div className={styles.resourceGrid} style={{ justifyContent: 'center' }}>
              <div className={styles.zoteroCard}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
                <h4>What to include</h4>
                <p>
                  Create an overview of your product with a clear description, key features, and getting started 
                  instructions. Include links to your GitHub repository, external documentation, or other resources. 
                  You can also embed your GitHub README to display the markdown content directly.
                </p>
              </div>
              <div className={styles.zoteroCard}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📂</div>
                <h4>Where to add your product</h4>
                <p>
                  Resources are organized into categories: Evaluation Tools, Data Management and Access Tools, 
                  Machine Learning, AI, and Visualization Tools. Review existing categories to see where your 
                  product fits best.
                </p>
              </div>
              <div className={styles.zoteroCard}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
                <h4>Need a new category?</h4>
                <p>
                  If your product doesn't fit existing categories, reach out to us or join the Community Research 
                  Working Group call to discuss new categorization. We welcome suggestions to improve the structure.
                </p>
              </div>
            </div>

            <div className={styles.zoteroActions} style={{ marginTop: '2rem' }}>
              <a href={addProductUrl} target="_blank" rel="noreferrer noopener" className={clsx(styles.zoteroButton, styles.zoteroButtonPrimary)}>
                Submit Your Product Documentation
              </a>
              <a href={contactUrl} className={clsx(styles.zoteroButton, styles.zoteroButtonSecondary)}>
                Discuss Categories
              </a>
            </div>
          </section>

          <hr />

          {/* Contribute to Zotero Publications */}
          <section className={clsx(styles.zoteroSection, "margin-vert--xl")}>
            <div className={styles.zoteroHeader}>
              <h2 className={styles.zoteroTitle}>Contribute your publications to Zotero</h2>
              <p className={styles.zoteroSubtitle}>
                Help us keep CIROH's publication library up to date. Sign in to Zotero, request access to the CIROH
                group library, and add your papers, presentations, and reports.
              </p>
              <div className={styles.zoteroActions}>
                <a href={zoteroLogin} target="_blank" rel="noreferrer noopener" className={styles.zoteroButton}>
                  Sign in to Zotero
                </a>
              </div>
            </div>

            {/* Steps grid */}
            <div className={styles.zoteroGrid}>
              <div className={styles.zoteroCard}>
                <img src={useBaseUrl('/img/contribute/zotero/install-zotero.png')} alt="Install Zotero" />
                <h4>1. Install Zotero</h4>
                <p>Download the Zotero desktop app or use the web library to manage citations.</p>
              </div>
              <div className={styles.zoteroCard}>
                <img src={useBaseUrl('/img/contribute/zotero/register-zotero.png')} alt="Register with Zotero" />
                <h4>2. Register with Zotero</h4>
                <p>Create a free Zotero account so you can join the CIROH group library.</p>
              </div>
              <div className={styles.zoteroCard}>
                <img src={useBaseUrl('/img/contribute/zotero/join-zotero.png')} alt="Request group access" />
                <h4>3. Request CIROH group access</h4>
                <p>Ask to join the CIROH Zotero group to contribute citations to the shared library.</p>
              </div>
              <div className={styles.zoteroCard}>
                <img src={useBaseUrl('/img/contribute/zotero/sync-zotero.png')} alt="Sync your account" />
                <h4>4. Sync your account</h4>
                <p>Enable syncing so your additions appear in the group folder automatically.</p>
              </div>
              <div className={styles.zoteroCard}>
                <img src={useBaseUrl('/img/contribute/zotero/add-publications-zotero.png')} alt="Add your publications" />
                <h4>5. Add your publications</h4>
                <p>Drag-and-drop PDFs or add by DOI to share your work with the CIROH community.</p>
              </div>
            </div>
          </section>

          <hr />

          {/* Mission Statement (original) - flat page text style */}
          <div className={clsx(styles.flatMissionText, "margin-vert--xl")}>
            <p>
              Amplify your hydrologic work through community collaboration. Whether you're sharing
              existing resources or building new solutions, your contribution accelerates water
              prediction innovation for flood resilience and drought management.
            </p>
          </div>

          <hr />

          {/* Join the Community Section */}
          <section id="community-working-group" className={clsx(styles.brandCard, "margin-top--xl margin-bottom--lg")}>
            <div className={styles.brandHeader}>
              <div style={{ fontSize: '3rem', marginRight: '1.5rem' }}>👥</div>
              <div className={styles.brandTitleWrap}>
                <h3 className={styles.brandTitle}>Join the Community Resources Working Group</h3>
                <p className={styles.brandSubtitle}>
                  Have suggestions or questions about contributing to CIROH Hub? We're open to feedback and ready to help! 
                  Join the Community Resources Working Group to discuss documentation improvements, share ideas, and 
                  collaborate with fellow contributors. Fill out the intake form to join our working group and attend our calls.
                </p>
              </div>
            </div>
            <div className={styles.brandActions}>
              <a href={wgIntakeFormUrl} className={styles.addProductButton} target='_blank' rel="noreferrer noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                Join Working Group
              </a>
            </div>
          </section>
          
          {/* Call to Action */}
          <div className={clsx(styles.ctaSection, "margin-top--lg margin-bottom--xl")}>
            <h2 className={styles.ctaTitle}>Questions or Need Help?</h2>
            <p className={styles.ctaDescription}>
              Our team is here to help you get started with your contributions. 
              Reach out if you have questions or need guidance.
            </p>
            <div className={styles.ctaButtons}>
              <a href={contactUrl} className={styles.ctaButtonPrimary}>
                Contact Us
              </a>
              <a href={feedbackUrl} className={styles.ctaButtonSecondary}>
                Provide Feedback
              </a>
            </div>
          </div>
        </div>
    </main>
  );
}
