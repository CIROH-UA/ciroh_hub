import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import DotGrid from './components/DotGrid';
import './styles.css';

const BLOG_ISSUE_URL = 'https://github.com/CIROH-UA/ciroh-ua_website/issues/new?template=docuhub-blog-post.md';

const AddBlogInner = () => {
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
              <h1>Add Blog</h1>
              <p>This now opens a GitHub issue template.</p>
            </div>
          </div>
          <div className="admin-header-line" />
        </header>

        <section className="admin-section">
          <div className="admin-grid">
            <a
              href={BLOG_ISSUE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-card admin-card-purple"
            >
              <div className="admin-card-inner">
                <h3 className="admin-card-title">Open Blog Post Request</h3>
                <p className="admin-card-desc">Create an issue using the blog post template</p>
                <span className="admin-card-btn">Open GitHub</span>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default function AddBlog() {
  return <BrowserOnly fallback={<div />}>{() => <AddBlogInner />}</BrowserOnly>;
}
