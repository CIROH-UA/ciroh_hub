import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import DotGrid from './components/DotGrid';
import './styles.css';
import { apiFetch, buildApiUrl } from '@site/src/utils/apiClient';
import { consumeJwtFromUrl, getStoredJwt } from '@site/src/utils/authToken';
import { useApiBaseUrl } from '@site/src/utils/useApiBaseUrl';

const toBullets = (text) => {
  const raw = (text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (raw.length === 0) return 'N/A';
  return raw
    .map((line) => {
      if (/^(-|\*|\d+\.)\s+/.test(line)) return line;
      return `- ${line}`;
    })
    .join('\n');
};

const AddBlogInner = () => {
  const [form, setForm] = useState({
    productName: '',
    institute: '',
    principalInvestigator: '',
    githubRepository: '',

    blogPostTitle: '',
    authors: '',
    authorProfileImages: '',

    usedCirohCyberinfra: 'No',
    componentsUsed: '',
    impactOnProject: '',

    blogContentMarkdown: '',
    whatHappened: '',
    whyExcited: '',
    learnMore: '',

    mediaAndImages: '',
    acknowledgements: '',
    additionalInformation: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [issueUrl, setIssueUrl] = useState('');
  const [issueNumber, setIssueNumber] = useState(null);
  const [issueRepo, setIssueRepo] = useState('');
  const [labelsApplied, setLabelsApplied] = useState(true);
  const [error, setError] = useState('');

  const apiBaseUrl = useApiBaseUrl();

  React.useEffect(() => {
    consumeJwtFromUrl();
    const token = getStoredJwt();
    if (!token) {
      window.location.href = buildApiUrl(apiBaseUrl, 'github-login');
    }
  }, [apiBaseUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildBody = (f) => {
    const productName = (f.productName || '').trim() || 'N/A';
    const institute = (f.institute || '').trim() || 'N/A';
    const principalInvestigator = (f.principalInvestigator || '').trim() || 'N/A';
    const githubRepository = (f.githubRepository || '').trim() || 'N/A';

    const blogPostTitle = (f.blogPostTitle || '').trim() || 'N/A';
    const authors = (f.authors || '').trim() || 'N/A';
    const authorProfileImages = (f.authorProfileImages || '').trim() || 'N/A';

    const used = (f.usedCirohCyberinfra || '').trim() || 'No';
    const componentsUsed = (f.componentsUsed || '').trim() || 'N/A';
    const impactOnProject = (f.impactOnProject || '').trim() || 'N/A';

    const blogContentMarkdown = (f.blogContentMarkdown || '').trim() || 'N/A';
    const whatHappened = toBullets(f.whatHappened);
    const whyExcited = toBullets(f.whyExcited);
    const learnMore = toBullets(f.learnMore);

    const mediaAndImages = (f.mediaAndImages || '').trim() || 'N/A';
    const acknowledgements = (f.acknowledgements || '').trim() || 'N/A';
    const additionalInformation = (f.additionalInformation || '').trim() || 'N/A';

    return `# Blog Post Request

## Post Information
- **Product Name**: ${productName}
- **Institute**: ${institute}
- **Principal Investigator**: ${principalInvestigator}
- **GitHub Repository**: ${githubRepository}

## Publication Details
- **Blog Post Title**: ${blogPostTitle}
- **Author(s)**: ${authors}
- **Author Profile Image(s)**: ${authorProfileImages}

## CIROH Cyberinfrastructure
- **Used CIROH Cyberinfrastructure**: ${used}
- **Which Components Used**: ${componentsUsed}
- **Impact on Project**: ${impactOnProject}

---

## Blog Content

${blogContentMarkdown}

### What happened?

${whatHappened}

### Why should we be excited about it?

${whyExcited}

### Where can we learn more?

${learnMore}

---

### Media and images
${mediaAndImages}

### Acknowledgements
${acknowledgements}

---

## Additional Information
${additionalInformation}
`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const requiredTitle = (form.blogPostTitle || '').trim();
    const hasSomeContent = Boolean((form.blogContentMarkdown || '').trim() || (form.whatHappened || '').trim());

    if (!requiredTitle) {
      setError('Please enter a Blog Post Title.');
      return;
    }

    if (!hasSomeContent) {
      setError('Please add some content (Blog Content or What happened?).');
      return;
    }

    setLoading(true);

    const title = `Blog post request: ${requiredTitle}`;
    const body = buildBody(form);

    try {
      const token = getStoredJwt();
      const res = await apiFetch(apiBaseUrl, 'create-blog-issue', {
        method: 'POST',
        token,
        body: { title, body },
      });

      if (res.status === 401) {
        window.location.href = buildApiUrl(apiBaseUrl, 'github-login');
        return;
      }

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const createdUrl = data?.issue?.url || '';
        const createdNumber = data?.issue?.number ?? null;
        const createdRepo = data?.issue?.repo || '';
        const createdLabelsApplied = typeof data?.labelsApplied === 'boolean' ? data.labelsApplied : true;

        if (createdUrl) setIssueUrl(createdUrl);
        if (createdNumber) setIssueNumber(createdNumber);
        if (createdRepo) setIssueRepo(createdRepo);
        setLabelsApplied(createdLabelsApplied);
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        const message = data?.details?.message || data?.message || data?.error || 'Failed to submit blog request.';
        setError(message);
      }
    } catch {
      setError('An error occurred while submitting.');
    }

    setLoading(false);
  };

  if (submitted) {
    const computedIssueUrl = issueUrl || (issueRepo && issueNumber ? `https://github.com/${issueRepo}/issues/${issueNumber}` : '');
    const githubHref = computedIssueUrl || 'https://github.com/CIROH-UA/ciroh-ua_website/issues';

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
          <div className="admin-page-header">
            <Link className="admin-back-link" to="/admin">← Back to Admin</Link>
            <h1 className="admin-page-title">Add Blog Request</h1>
            <p className="admin-page-subtitle">Your request has been submitted as a GitHub issue.</p>
          </div>

          <div className="admin-form-card">
            <div className="admin-success">
              <h2>Thank you!</h2>
              <p>Your blog post request has been submitted.</p>

              <div className="admin-success-actions">
                <a className="admin-github-btn" href={githubHref} target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  View on GitHub
                </a>
              </div>

              {!computedIssueUrl ? (
                <p className="admin-success-hint">Issue link wasn’t returned by the API. Opening the repo issues list instead.</p>
              ) : null}

              {!labelsApplied ? (
                <p className="admin-success-hint">Note: the label for this request could not be applied.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="admin-page-header">
          <Link className="admin-back-link" to="/admin">← Back to Admin</Link>
          <h1 className="admin-page-title">Add Blog Request</h1>
          <p className="admin-page-subtitle">Fill out the details below to create a GitHub issue for a blog post request.</p>
        </div>

        <div className="admin-form-card">
          <form className="admin-form" onSubmit={handleSubmit}>
            <h2 className="admin-form-section-title">Post Information</h2>

            <div className="admin-two-col">
              <div className="admin-field">
                <label className="admin-label" htmlFor="productName">Product Name</label>
                <input id="productName" className="admin-input" name="productName" value={form.productName} onChange={handleChange} />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="institute">Institute</label>
                <input id="institute" className="admin-input" name="institute" value={form.institute} onChange={handleChange} />
              </div>
            </div>

            <div className="admin-two-col">
              <div className="admin-field">
                <label className="admin-label" htmlFor="principalInvestigator">Principal Investigator</label>
                <input id="principalInvestigator" className="admin-input" name="principalInvestigator" value={form.principalInvestigator} onChange={handleChange} />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="githubRepository">GitHub Repository</label>
                <input id="githubRepository" className="admin-input" name="githubRepository" value={form.githubRepository} onChange={handleChange} placeholder="https://github.com/org/repo" />
              </div>
            </div>

            <div className="admin-divider" />

            <h2 className="admin-form-section-title">Publication Details</h2>

            <div className="admin-field">
              <label className="admin-label" htmlFor="blogPostTitle">Blog Post Title <span className="admin-required">Required</span></label>
              <input id="blogPostTitle" className="admin-input" name="blogPostTitle" value={form.blogPostTitle} onChange={handleChange} required />
            </div>

            <div className="admin-two-col">
              <div className="admin-field">
                <label className="admin-label" htmlFor="authors">Author(s)</label>
                <input id="authors" className="admin-input" name="authors" value={form.authors} onChange={handleChange} placeholder="Jane Doe, John Doe" />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="authorProfileImages">Author Profile Image(s)</label>
                <input id="authorProfileImages" className="admin-input" name="authorProfileImages" value={form.authorProfileImages} onChange={handleChange} placeholder="https://... (comma-separated)" />
              </div>
            </div>

            <div className="admin-divider" />

            <h2 className="admin-form-section-title">CIROH Cyberinfrastructure</h2>

            <div className="admin-two-col">
              <div className="admin-field">
                <label className="admin-label" htmlFor="usedCirohCyberinfra">Used CIROH Cyberinfrastructure</label>
                <select id="usedCirohCyberinfra" className="admin-input" name="usedCirohCyberinfra" value={form.usedCirohCyberinfra} onChange={handleChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="componentsUsed">Which Components Used</label>
                <input id="componentsUsed" className="admin-input" name="componentsUsed" value={form.componentsUsed} onChange={handleChange} />
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="impactOnProject">Impact on Project</label>
              <textarea id="impactOnProject" className="admin-textarea" name="impactOnProject" value={form.impactOnProject} onChange={handleChange} />
            </div>

            <div className="admin-divider" />

            <h2 className="admin-form-section-title">Blog Content</h2>

            <div className="admin-field">
              <label className="admin-label" htmlFor="blogContentMarkdown">Complete Blog Content (Markdown)</label>
              <textarea
                id="blogContentMarkdown"
                className="admin-textarea admin-textarea-large"
                name="blogContentMarkdown"
                value={form.blogContentMarkdown}
                onChange={handleChange}
                placeholder="Write your complete blog post content here (Markdown supported)."
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="whatHappened">What happened? (one per line)</label>
              <textarea id="whatHappened" className="admin-textarea" name="whatHappened" value={form.whatHappened} onChange={handleChange} placeholder="This happened\nThis happened" />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="whyExcited">Why should we be excited? (one per line)</label>
              <textarea id="whyExcited" className="admin-textarea" name="whyExcited" value={form.whyExcited} onChange={handleChange} placeholder="Because A\nBecause B" />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="learnMore">Where can we learn more? (one per line)</label>
              <textarea id="learnMore" className="admin-textarea" name="learnMore" value={form.learnMore} onChange={handleChange} placeholder="https://...\nhttps://..." />
            </div>

            <div className="admin-divider" />

            <h2 className="admin-form-section-title">Optional Extras</h2>

            <div className="admin-field">
              <label className="admin-label" htmlFor="mediaAndImages">Media and images</label>
              <textarea id="mediaAndImages" className="admin-textarea" name="mediaAndImages" value={form.mediaAndImages} onChange={handleChange} placeholder="Paste image URLs or notes" />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="acknowledgements">Acknowledgements</label>
              <textarea id="acknowledgements" className="admin-textarea" name="acknowledgements" value={form.acknowledgements} onChange={handleChange} />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="additionalInformation">Additional Information</label>
              <textarea id="additionalInformation" className="admin-textarea" name="additionalInformation" value={form.additionalInformation} onChange={handleChange} />
            </div>

            {error ? <div className="admin-form-error">{error}</div> : null}

            <div className="admin-form-actions">
              <button className="admin-primary-btn" type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Blog Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddBlog = () => (
  <BrowserOnly fallback={<div>Loading...</div>}>
    {() => <AddBlogInner />}
  </BrowserOnly>
);

export default AddBlog;
