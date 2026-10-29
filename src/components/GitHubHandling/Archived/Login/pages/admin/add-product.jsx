import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import DotGrid from './components/DotGrid';
import './styles.css';
import { apiFetch, buildApiUrl } from '@site/src/utils/apiClient';
import { consumeJwtFromUrl, getStoredJwt, setLoginReturnTo } from '@site/src/utils/authToken';
import { useApiBaseUrl } from '@site/src/utils/useApiBaseUrl';

const CATEGORIES = [
  'Modeling Framework',
  'Water Modeling',
  'Geospatial Tools',
  'Data Management',
  'Analysis Tools',
  'Snow Science',
  'AI/ML',
  'Visualization',
  'Flood Management',
  'Data Resources',
  'Other',
];

const AddProductInner = () => {
  const [form, setForm] = useState({
    productName: '',
    shortDescription: '',
    category: '',
    otherCategory: '',
    tags: '',
    iconUrl: '',
    githubUrl: '',
    docsUrl: '',
    hydroshareUrl: '',
    zoteroUrl: '',
    primaryContact: '',
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
      setLoginReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
      window.location.href = buildApiUrl(apiBaseUrl, 'github-login');
    }
  }, [apiBaseUrl]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setCategoryExclusive = (value, checked) => {
    if (!checked) {
      setForm((prev) => ({ ...prev, category: '', otherCategory: '' }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      category: value,
      ...(value === 'Other' ? {} : { otherCategory: '' }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    const hasRequiredBasics = Boolean(form.productName && form.shortDescription && form.category);
    const hasAtLeastOneLink = Boolean((form.githubUrl || '').trim() || (form.docsUrl || '').trim());
    const otherOk = form.category !== 'Other' || Boolean((form.otherCategory || '').trim());

    if (!hasRequiredBasics || !otherOk) {
      setError('Please fill in all required fields (and specify “Other” if selected).');
      return;
    }

    if (!hasAtLeastOneLink) {
      setError('Please provide at least one link (GitHub Repository URL or Documentation URL).');
      return;
    }

    setLoading(true);

    const title = `Software Request: ${form.productName}`;
    const body = buildBody(form);

    try {
      const token = getStoredJwt();
      const res = await apiFetch(apiBaseUrl, 'create-product-issue', {
        method: 'POST',
        token,
        body: { title, body },
      });

      if (res.status === 401) {
        setLoginReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
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
        const message =
          data?.details?.message ||
          data?.message ||
          data?.error ||
          'Failed to submit product request.';
        setError(message);
      }
    } catch (err) {
      setError('An error occurred while submitting.');
    }

    setLoading(false);
  };

  const buildBody = (f) => {
    const selectedCategory = f.category === 'Other' ? `Other: ${f.otherCategory}` : f.category;
    const checkboxLine = (label) => {
      if (label === 'Other') {
        const checked = f.category === 'Other';
        const otherText = f.otherCategory ? f.otherCategory : '_______________';
        return `- [${checked ? 'x' : ' '}] Other (please specify): ${otherText}`;
      }
      const checked = f.category === label;
      return `- [${checked ? 'x' : ' '}] ${label}`;
    };

    const categoryBlock = CATEGORIES.map(checkboxLine).join('\n');

    const tags = (f.tags || '').trim() || 'N/A';
    const iconUrl = (f.iconUrl || '').trim() || 'N/A';
    const githubUrl = (f.githubUrl || '').trim() || 'N/A';
    const docsUrl = (f.docsUrl || '').trim() || 'N/A';
    const hydroshareUrl = (f.hydroshareUrl || '').trim() || 'N/A';
    const zoteroUrl = (f.zoteroUrl || '').trim() || 'N/A';
    const primaryContact = (f.primaryContact || '').trim() || 'N/A';

    return `## Software Information 

**Software Name:** ${f.productName}

**Short Description:** ${f.shortDescription}

**Select Category:** ${selectedCategory}

${categoryBlock}

**Software Tags:** ${tags}

**Icon URL:** ${iconUrl}

---

### Links 
\`Required: at least one\`

  **GitHub Repository URL:**
${githubUrl}

  **Documentation URL:**
${docsUrl}

  **HydroShare Resource URL:**
${hydroshareUrl}

  **Zotero Collection URL:**
${zoteroUrl}

---

### Additional Information

**Primary Contact:** 
${primaryContact}

---

**Thank you for contributing to the CIROH Software catalog!** 🌊
`;
  };

  if (submitted) {
    const computedIssueUrl =
      issueUrl ||
      (issueRepo && issueNumber ? `https://github.com/${issueRepo}/issues/${issueNumber}` : '');

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
            <h1 className="admin-page-title">Add Software Request</h1>
            <p className="admin-page-subtitle">Your request has been submitted as a GitHub issue.</p>
          </div>

          <div className="admin-form-card">
            <div className="admin-success">
              <h2>Thank you!</h2>
              <p>Thank you for contributing to the CIROH Software catalog! 🌊</p>

              <div className="admin-success-actions">
                <a
                  className="admin-github-btn"
                  href={githubHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>

              {!computedIssueUrl ? (
                <p className="admin-success-hint">
                  Issue link wasn’t returned by the API. Opening the repo issues list instead.
                </p>
              ) : null}

              {!labelsApplied ? (
                <p className="admin-success-hint">
                  Note: the “enhancement” label could not be applied (likely repo permissions or missing label).
                </p>
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
          <h1 className="admin-page-title">Add Software Request</h1>
          <p className="admin-page-subtitle">This will create a GitHub issue in the CIROH catalog repo.</p>
        </div>

        <div className="admin-form-card">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-field">
              <label className="admin-label" htmlFor="productName">Software Name <span className="admin-required">Required</span></label>
              <input
                id="productName"
                className="admin-input"
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                required
                placeholder="Enter the name of your software/tool/resource"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="shortDescription">Short Description <span className="admin-required">Required</span></label>
              <textarea
                id="shortDescription"
                className="admin-textarea"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                required
                placeholder="Provide a brief description (1-2 sentences) of what this product does"
              />
            </div>

            <div className="admin-field">
              <div className="admin-label-row">
                <label className="admin-label">Select Category <span className="admin-required">Required</span></label>
                <span className="admin-hint">Choose one</span>
              </div>

              <div className="admin-checkbox-grid" role="group" aria-label="Select Category">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={form.category === cat}
                      onChange={(e) => setCategoryExclusive(cat, e.target.checked)}
                    />
                    <span>{cat === 'Other' ? 'Other (please specify)' : cat}</span>
                  </label>
                ))}
              </div>

              {form.category === 'Other' ? (
                <input
                  className="admin-input admin-input-other"
                  type="text"
                  name="otherCategory"
                  value={form.otherCategory}
                  onChange={handleChange}
                  placeholder="Specify other category"
                  required
                />
              ) : null}
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="tags">Software Tags <span className="admin-optional">Optional</span></label>
              <input
                id="tags"
                className="admin-input"
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="Docker, NextGen, Containerization"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="iconUrl">Icon URL <span className="admin-optional">Optional</span></label>
              <input
                id="iconUrl"
                className="admin-input"
                type="url"
                name="iconUrl"
                value={form.iconUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="admin-divider" />

            <div className="admin-field">
              <div className="admin-label-row">
                <label className="admin-label">Links</label>
                <span className="admin-hint">Required: at least one</span>
              </div>

              <div className="admin-two-col">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="githubUrl">GitHub Repository URL</label>
                  <input
                    id="githubUrl"
                    className="admin-input"
                    type="url"
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/org/repo"
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="docsUrl">Documentation URL</label>
                  <input
                    id="docsUrl"
                    className="admin-input"
                    type="url"
                    name="docsUrl"
                    value={form.docsUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="admin-two-col">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="hydroshareUrl">HydroShare Resource URL <span className="admin-optional">Optional</span></label>
                  <input
                    id="hydroshareUrl"
                    className="admin-input"
                    type="url"
                    name="hydroshareUrl"
                    value={form.hydroshareUrl}
                    onChange={handleChange}
                    placeholder="https://www.hydroshare.org/..."
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="zoteroUrl">Zotero Collection URL <span className="admin-optional">Optional</span></label>
                  <input
                    id="zoteroUrl"
                    className="admin-input"
                    type="url"
                    name="zoteroUrl"
                    value={form.zoteroUrl}
                    onChange={handleChange}
                    placeholder="https://www.zotero.org/..."
                  />
                </div>
              </div>
            </div>

            <div className="admin-divider" />

            <div className="admin-field">
              <label className="admin-label" htmlFor="primaryContact">Primary Contact <span className="admin-optional">Optional</span></label>
              <input
                id="primaryContact"
                className="admin-input"
                type="text"
                name="primaryContact"
                value={form.primaryContact}
                onChange={handleChange}
                placeholder="Name and/or email of the primary maintainer/contact person"
              />
            </div>

            {error ? <div className="admin-form-error">{error}</div> : null}

            <div className="admin-form-actions">
              <button className="admin-primary-btn" type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Software Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddProduct = () => (
  <BrowserOnly fallback={<div>Loading...</div>}>
    {() => <AddProductInner />}
  </BrowserOnly>
);

export default AddProduct;