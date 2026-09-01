import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import styles from './PublicationsSubmissionForm.module.css';
import clsx from 'clsx';
import api from 'zotero-api-client';
import useRecaptcha from '@site/src/components/Captcha/useRecaptcha';
import ReCAPTCHA from "react-google-recaptcha";
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SelectCollection from './SelectCollection';
import {zoteroSelectStyles, zoteroSelectTheme} from './selectStyles';
import Select from 'react-select';
import useBaseUrl from '@docusaurus/useBaseUrl';

const codeLocationOptions = [
  { value: 'N/A', label: 'N/A' },
  { value: 'GitHub', label: 'GitHub' },
  { value: 'HydroShare', label: 'HydroShare' },
  { value: 'Other', label: 'Other' },
];

const dataLocationOptions = [
  { value: 'N/A', label: 'N/A' },
  { value: 'HydroShare', label: 'HydroShare' },
  { value: 'Figshare', label: 'Figshare' },
  { value: 'Other', label: 'Other' },
];


export default function PublicationsSubmissionForm({ groupId, zoteroApiKey }) {
  const { capchaToken, recaptchaRef, handleRecaptcha } = useRecaptcha();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [citationUrl, setCitationUrl] = useState('');
  const [error, setError] = useState('');
  const { colorMode } = useColorMode();
  const { siteConfig: {customFields}, } = useDocusaurusContext();
  const [acknowledgesCIROH, setAcknowledgesCIROH] = useState(false);
  const [codeLocation, setCodeLocation] = useState(codeLocationOptions[0]);
  const [dataLocation, setDataLocation] = useState(dataLocationOptions[0]);
  const [codeLocationUrl, setCodeLocationUrl] = useState('');
  const [dataLocationUrl, setDataLocationUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailWarning, setThumbnailWarning] = useState('');

  const zoteroClient = React.useMemo(
    () => api(zoteroApiKey).library('group', groupId),
    [zoteroApiKey, groupId],
  );

  /**
   * Convert an ArrayBuffer to a Base64 encoded string
   * @param {ArrayBuffer} buffer The ArrayBuffer to convert
   * @returns {string} Base64 encoded string
   */
  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setProgressMessage('');
    setCitationUrl('');
    setThumbnailWarning('');
    
    // Validate DOI input
    if (!query.trim()) {
      setError('Please enter an article identifier (URL, DOI, PMID, etc.).');
      setProgressMessage('Please enter an article identifier (URL, DOI, PMID, etc.).');
      handleRecaptcha('');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      return;
    }
    if (!validateDOI(query.trim())) {
      setError('Please enter a valid DOI.');
      setProgressMessage('Please enter a valid DOI.');
      handleRecaptcha('');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      return;
    }

    // Validate reCAPTCHA
    if (!capchaToken){
      setError('Please complete the reCAPTCHA to proceed.');
      setProgressMessage('Please complete the reCAPTCHA to proceed.');
      handleRecaptcha('');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      return;
    }

    setLoading(true);
    try {
      // Holds any notes we want to add to the Zotero item based on user input
      const notes = [];

      // Add selected collections as a note
      if (selectedCollections.length > 0)
      {
        notes.push(`Selected collections: ${selectedCollections.map(o => o.label).join(', ')}`);
      }
      else
      {
        notes.push('Selected collections: None');
      }

      // Add shared code location as note
      if (codeLocation)
      {
        notes.push(`Shared code location: ${codeLocation.value}`);
      }

      if (codeLocationUrl.trim())
      {
        notes.push(`Shared code URL: ${codeLocationUrl.trim()}`);
      }

      // Add shared data location as note
      if (dataLocation)
      {
        notes.push(`Shared data location: ${dataLocation.value}`);
      }

      if (dataLocationUrl.trim())
      {
        notes.push(`Shared data URL: ${dataLocationUrl.trim()}`);
      }

      // Add CIROH acknowledgment as note
      if (acknowledgesCIROH)
      {
        notes.push('Acknowledges CIROH: Yes');
      }
      else
      {
        notes.push('Acknowledges CIROH: No');
      }

      // Read thumbnail file as ArrayBuffer if one was selected
      let thumbnailData = null;
      if (thumbnailFile)
      {
        setProgressMessage('Reading thumbnail image...');
        thumbnailData = await thumbnailFile.arrayBuffer();
      }

      // Build request headers for the backend API call
      const requestHeaders = {
        'Content-Type': 'application/json',
      }

      // Build request body for the backend API call
      const requestBody = JSON.stringify({
        recaptchaToken: capchaToken,
        doi: query.trim(),
        notes: notes,
        collections: selectedCollections.map(o => o.value),
        thumbnail: thumbnailFile ? {
          name: thumbnailFile.name,
          type: thumbnailFile.type,
          size: thumbnailFile.size,
          data: arrayBufferToBase64(thumbnailData),
        } : null,
      });

      // Give feedback if thumbnail was not selected
      if (!thumbnailFile || !thumbnailData)
      {
        setProgressMessage('Importing Citation...');
      }

      // Check for unavailable API url
      if (customFields.zotero_import_request_api_url == "http://127.0.0.1:3000/zotero-import-request" && !(useBaseUrl('/') === '/local')) {
        let errorMessage = 'Site administrator: Please configure the import request URL in this website\'s environment file.';
        throw new Error(errorMessage);
      }
      else if (customFields.zotero_import_request_url == "forbidden") {
        let errorMessage = 'Access forbidden by CI/CD. (This may be built from a remote branch that cannot access secrets.)';
        throw new Error(errorMessage);
      }

      // Make request to the backend API to verify reCAPTCHA and import the citation data into Zotero
      const response = await fetch(customFields.zotero_import_request_api_url, {method: 'POST', headers: requestHeaders, body: requestBody});

      // Check for failure
      if (!response.ok) {
        let errorMessage = `Error importing citation: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Body wasn't valid JSON — fall back to the default message above 
        }
        throw new Error(errorMessage);
      }

      // Reset reCAPTCHA after submission
      recaptchaRef.current.reset();

      // Extract the imported citation URL from the response
      const responseData = await response.json();
      const importedUrl = responseData.importedUrl;

      // Update state. Do not show citation URL at this time, as the library is private
      // setCitationUrl(importedUrl);
      setProgressMessage('Citation imported successfully! Your submission will be reviewed soon.');
    } catch (err) {
      setError(err.message);
      setProgressMessage(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Checks if a given DOI is valid based on the standard DOI format (10.1234/abcd.efgh).
   * This is a basic validation and may not cover all edge cases, but it ensures that the input follows the general structure of a DOI.
   * @param {String} doi The DOI to validate, which should follow the format 10.1234/abcd.efgh
   * @returns {Boolean} True if the DOI is valid, false otherwise
   */
  function validateDOI(doi) {
    const doiRegex = /^(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)$/i;
    return doiRegex.test(doi);
  }

  return (
    <div className={styles.container}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Article Identifier */}
        <label className={styles.label}>
          Article Identifier
        </label>
          <input
            type="text"
            className={styles.input}
            value={query}
            onChange={(e) => {
              // Get the current value from the input field
              const value = e.target.value;
              setQuery(value);
          
              // Validate the DOI and set an error if it fails
              if (value.trim().length > 0 && !validateDOI(value.trim())) 
              {
                // Invalid DOI format
                setError('Invalid DOI format. Please enter a valid DOI.');
              } 
              else
              {
                // Clear the error if the DOI is valid
                setError('');
              }
            }}
            placeholder="Enter DOI following the format 10.1234/abcd.efgh"
          />
          <p><strong>* Do not use</strong><span>{" "}a <strong>url</strong> but the format </span> <strong>10.1234/abcd.efgh </strong></p>

        {/* Select Collection */}
        <label className={styles.label}>Select Collection</label>
        <SelectCollection
            zotero={zoteroClient}
           onChange={(opts) => setSelectedCollections(opts || [])}
        />

        {/* Shared Code Location Selector */}
        <label className={styles.label}>Location of Shared Code</label>
        <Select
          options={codeLocationOptions}
          value={codeLocation}
          onChange={(opt) => setCodeLocation(opt)}
          theme={zoteroSelectTheme}
          styles={zoteroSelectStyles}
        />

        {/* Shared Code URL Input */}
        <input
          type="text"
          className={styles.input}
          value={codeLocationUrl}
          onChange={(e) => {
            // Get the current value from the input field
            const value = e.target.value;
            setCodeLocationUrl(value);
          }}
          placeholder="Enter URL to shared code"
        />

        {/* Shared Data Location Selector */}
        <label className={styles.label}>Location of Shared Data</label>
        <Select
          options={dataLocationOptions}
          value={dataLocation}
          onChange={(opt) => setDataLocation(opt)}
          theme={zoteroSelectTheme}
          styles={zoteroSelectStyles}
        />

        {/* Shared Data URL Input */}
        <input
          type="text"
          className={styles.input}
          value={dataLocationUrl}
          onChange={(e) => {
            // Get the current value from the input field
            const value = e.target.value;
            setDataLocationUrl(value);
          }}
          placeholder="Enter URL to shared data"
        />

        {/* Does the Paper Acknowledge CIROH? Checkbox */}
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={acknowledgesCIROH}
            onChange={(e) => setAcknowledgesCIROH(e.target.checked)}
          />
          <label className={styles.label}>Does the Paper Acknowledge CIROH?</label>
        </div>

        {/* Thumbnail Image Upload */}
        <label className={styles.label}>Thumbnail Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={(e) => {
            const file = e.target.files[0] || null;
            if (file && file.size > 4 * 1024 * 1024) {
              setError('Thumbnail image must be smaller than 4 MB.');
              setThumbnailFile(null);
              e.target.value = '';
              return;
            }
            setThumbnailFile(file);
            setError('');
          }}
        />

        {/* ReCAPTCHA */}
        <div className={styles.captchaContainer}>
          <ReCAPTCHA
            key={colorMode}
            ref={recaptchaRef}
            sitekey={customFields.recaptcha_site_key}
            onChange={handleRecaptcha}
            theme={colorMode === 'dark' ? 'dark' : 'light'}
          />
        </div>
        
        <button 
          type="submit" 
          className={clsx(
            'button',
            styles.button,
            styles.buttonPrimary
          )}
          disabled={loading}
          // disabled={!capchaToken}
        >
          {loading ? 'Processing...' : 'Import Citation'}
        </button>
      </form>
      {thumbnailWarning && (
        <div className={styles.warningMessage}>
          {thumbnailWarning}
        </div>
      )}
      {progressMessage && (
        <div className={clsx(styles.progressMessage, error && styles.errorMessage)}>
          {loading && <FaSpinner className={styles.spinner} />}
          <span>
            {progressMessage}
            {!loading && citationUrl && (
              <a href={citationUrl} target="_blank" rel="noopener noreferrer">
                here
              </a>
            )}
          </span>
        </div>
      )}
      {/* Wikimedia Privacy and Terms of Use Notice */}
      <br />
      <div className={styles.wikimediaPrivacyNotice}>
        This form uses <a href='https://www.mediawiki.org/wiki/Citoid'>Wikimedia's Citoid service</a> to identify your paper. <b>By using this form, you acknowledge and agree to Wikimedia's <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use#12._API_Terms" target="_blank" rel="noopener noreferrer">Terms of Use</a>.</b>
      </div>
    </div>
  );
}
