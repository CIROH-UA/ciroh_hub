import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DotGrid from './components/DotGrid';
import './styles.css';

const DEFAULT_PRODUCT_ISSUE_URL =
  'https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=product-request.md';
const DEFAULT_BLOG_ISSUE_URL =
  'https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=docuhub-blog-post.md';

const AdminInner = () => {
  const { siteConfig } = useDocusaurusContext();

  const productIssueUrl = siteConfig?.customFields?.productIssueUrl || DEFAULT_PRODUCT_ISSUE_URL;
  const blogIssueUrl = siteConfig?.customFields?.blogIdeaUrl || DEFAULT_BLOG_ISSUE_URL;

  return (
    <div className="admin-container">
      <div className="admin-background">
        <DotGrid
          dotSize={3}
          gap={25}
          baseColor="#334155"
          activeColor="#22d3ee"
          proximity={150}
          shockRadius={300}
          shockStrength={8}
          resistance={800}
          returnDuration={1.5}
        />
      </div>

      <div className="admin-content">
        <header className="admin-header slide-in-right">
          <div className="admin-header-top">
            <div className="admin-header-text">
              <h1>Submit a Request</h1>
              <p>Requests are handled via GitHub issue templates.</p>
            </div>
          </div>
          <div className="admin-header-line" />
        </header>

        <section className="admin-section">
          <h2 className="admin-section-title">Quick Actions</h2>
          <div className="admin-grid">
            <a
              href={productIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-card admin-card-blue delay-100"
            >
              <div className="admin-card-inner">
                <div className="admin-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="admin-card-title">Add Software</h3>
                <p className="admin-card-desc">Open the software request template on GitHub</p>
                <span className="admin-card-btn">Open GitHub</span>
              </div>
            </a>

            <a
              href={blogIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-card admin-card-purple delay-200"
            >
              <div className="admin-card-inner">
                <div className="admin-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="admin-card-title">Add Blog</h3>
                <p className="admin-card-desc">Open the blog post request template on GitHub</p>
                <span className="admin-card-btn">Open GitHub</span>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default function Admin() {
  return <BrowserOnly fallback={<div />}>{() => <AdminInner />}</BrowserOnly>;
}