import React from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './contribute.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HydroShareCard from '@site/src/components/HydroShareCard';
import clsx from 'clsx';

export default function Contribute() {
  const { siteConfig } = useDocusaurusContext();
  const contactUrl = useBaseUrl('/contact');
  const portalUrl = useBaseUrl('/products/portal/');
  const docsContribUrl = useBaseUrl('/docs/contribute');
  const zoteroLogin = siteConfig?.customFields?.externalLinks?.zoteroLogin || 'https://www.zotero.org/user/login';
  const feedbackUrl = siteConfig?.customFields?.externalLinks?.feedbackForm || 'https://forms.office.com/r/5ww7qRWwwf';
  const addProductUrl = useBaseUrl('/admin/add-software');
  const blogIdeaUrl = siteConfig?.customFields?.blogIdeaUrl || 'https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=docuhub-blog-post.md';

  return (
    <Layout
      title="Contribute to CIROH"
      description="Learn how to contribute to CIROH's open science initiatives">
      <main>
        {/* Contribute Banner */}
        <div className={clsx(styles.contributeBanner, "tw-bg-cyan-500 tw-text-white")}>
          <div className={styles.bannerContainer}>
            <h1 className={clsx(styles.bannerTitle, "tw-text-slate-900 dark:tw-text-white")}>Contribute to CIROH</h1>
            <p className={clsx(styles.bannerSubtitle, "tw-text-slate-900 dark:tw-text-white")}>
              Join our community of researchers, developers, and water science enthusiasts.<br />
              Your contributions help advance hydrologic science and support NOAA's water prediction initiatives.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
          {/* Mission Statement Callout (flat) */}
          <div className={styles.flatMissionText}>
            <p>
              Share your work where the community can find it. Upload your courses, presentations,
              datasets, and apps to <a href={useBaseUrl('/resources')}>HydroShare</a> and they’ll be
              showcased right here in CIROH Hub for broader reach. Publish your papers to <a href={zoteroLogin} target="_blank" rel="noreferrer noopener">Zotero</a> and they'll appear here as part of CIROH's shared library.
            </p>
          </div>

          {/* Contribute to DocuHub */}
          <section className={styles.brandCard}>
            <div className={styles.brandHeader}>
              <img
                className={styles.brandLogo}
                src={useBaseUrl('/img/logos/docuhub.png')}
                alt="CIROH Hub"
              />
              <div className={styles.brandTitleWrap}>
                <h3 className={styles.brandTitle}>Contribute to CIROH Hub</h3>
                <p className={styles.brandSubtitle}>
                  Share your R2O products, submit blog posts about your research, document your GitHub projects, 
                  or add guides and tutorials. The CIROH Hub team is happy to feature your work and make it accessible 
                  to the hydrologic science community.
                </p>
              </div>
              <div className={styles.brandTopActions}>
                <a href={docsContribUrl} className={styles.cardButton}>Read contribution guide</a>
              </div>
            </div>
            <div className={styles.brandActions}>
              <a href={addProductUrl} className={styles.addProductButton}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img"><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Add Your Product
              </a>
              <a href={blogIdeaUrl} target="_blank" rel="noreferrer noopener" className={styles.blogIdeaButton}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img"><path d="M9 21h6a1 1 0 001-1v-1.2a4.8 4.8 0 002-3.8 6 6 0 10-12 0c0 1.5.74 2.9 2 3.8V20a1 1 0 001 1zm3-16a4 4 0 014 4c0 1.27-.63 2.47-1.7 3.2A1 1 0 0014 13v2h-4v-2a1 1 0 00-.3-.8A4 4 0 0112 5z" fill="currentColor"/></svg>
                Submit a blog idea
              </a>
            </div>
          </section>

          {/* Contribute to HydroShare */}
          <HydroShareCard />

          {/* Contribute to Zotero Publications */}
          <section className={styles.zoteroSection}>
            <div className={styles.zoteroHeader}>
              <h2 className={styles.zoteroTitle}>Contribute your publications to Zotero</h2>
              <p className={styles.zoteroSubtitle}>
                Help us keep CIROH’s publication library up to date. Sign in to Zotero, request access to the CIROH
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

          {/* Mission Statement (original) - flat page text style */}
          <div className={styles.flatMissionText}>
            <p>
              Amplify your hydrologic work through community collaboration. Whether you're sharing
              existing resources or building new solutions, your contribution accelerates water
              prediction innovation for flood resilience and drought management.
            </p>
          </div>

          {/* Learn More – Full width card */}
          <section className={styles.infoCardWide}>
            <div className={styles.infoCardContent}>
              <h2 className={styles.infoTitle}>Learn more about contributing</h2>
              <p className={styles.infoText}>
                Explore the CIROH Portal to see how products are curated and surfaced across
                CIROH Hub and HydroShare, and how your contributions reach the community.
              </p>
            </div>
            <div className={styles.infoActions}>
              <a href={portalUrl} className={styles.infoButton}>
                More about contributing →
              </a>
            </div>
          </section>

          {/* Call to Action */}
          <div className={styles.ctaSection}>
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
    </Layout>
  );
}
