import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import styles from './PublicationsImporter.module.css';
import clsx from 'clsx';
import api from 'zotero-api-client';
import useRecaptcha from '@site/src/components/Captcha/useRecaptcha';
import ReCAPTCHA from "react-google-recaptcha";
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SelectCollection from './SelectCollection';
import {zoteroSelectStyles, zoteroSelectTheme} from './selectStyles';
import Select from 'react-select';

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


export default function PublicationsImporter({ groupId, zoteroApiKey  }) {
  const { capchaToken, recaptchaRef, handleRecaptcha } = useRecaptcha();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [citationUrl, setCitationUrl] = useState('');
  const [error, setError] = useState('');
  const { colorMode } = useColorMode();
  const {
      siteConfig: {customFields},
    } = useDocusaurusContext();
  const [acknowledgesCIROH, setAcknowledgesCIROH] = useState(false);
  const [codeLocation, setCodeLocation] = useState(codeLocationOptions[0]);
  const [dataLocation, setDataLocation] = useState(dataLocationOptions[0]);
  const [codeLocationUrl, setCodeLocationUrl] = useState('');
  const [dataLocationUrl, setDataLocationUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailWarning, setThumbnailWarning] = useState('');

  // Wikimedia REST API base (using the official REST endpoint)
  const wikimediaBaseUrl = 'https://en.wikipedia.org/api/rest_v1';

  const zoteroClient = React.useMemo(
    () => api(zoteroApiKey).library('group', groupId),
    [zoteroApiKey, groupId],
  );


  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setProgressMessage('');
    setCitationUrl('');
    setThumbnailWarning('');
    
    if (!query.trim()) {
      setError('Please enter an article identifier (URL, DOI, PMID, etc.).');
      handleRecaptcha('');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      return;
    }
    if (!validateDOI(query.trim())) {
      setError('Please enter a valid DOI.');
      handleRecaptcha('');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      return;
    }
    if (!capchaToken){
      setError('Please complete the reCAPTCHA to proceed.');
      handleRecaptcha('');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      return;
    }

    setLoading(true);
    try {
      setProgressMessage('Fetching citation data...');
      const encodedQuery = encodeURIComponent('https://doi.org/' + query.trim());
      const targetUrl = `${wikimediaBaseUrl}/data/citation/zotero/${encodedQuery}`;
      const resp = await fetch(targetUrl);
      if (!resp.ok) {
        const text = await resp.text();
        const status = resp.status;

        // Get a user friendly error message
        let userFriendlyMessage = 'Error fetching citation data: ';

        if (status === 404) {
          userFriendlyMessage += 'No citation data found for the provided identifier. Please check your input and try again.';
        } else if (status === 500) {
          userFriendlyMessage += 'The server encountered an error. Please try again later.';
        } else if (status >= 400 && status < 500) {
          userFriendlyMessage += 'There was an issue with your request. Please verify your input and try again.';
        } else if (status >= 500) {
          userFriendlyMessage += 'The server is currently unavailable. Please try again later.';
        }
        recaptchaRef.current?.reset();

        throw new Error(userFriendlyMessage || text || `Error fetching citation data: ${resp.status}`);
      }
      const citationData = await resp.json();

      setProgressMessage('Citation data fetched. Importing citation...');
      
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

      // Call the Zotero API client to import the citation.
      const importedUrl = await importCitation(
        citationData,
        selectedCollections.map(o => o.value),
        notes,
        thumbnailFile,
        thumbnailData
      );
      
      setCitationUrl(importedUrl);
      setProgressMessage('Citation imported successfully! Visit your citation ');
    } catch (err) {
      setError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  // Import the citation using the Zotero API client.
  async function importCitation(
    citationData,
    collectionKeys = [],
    notes = [],
    thumbnailFileObj = null,
    thumbnailArrayBuffer = null
  ) {
    try {
      // Initialize the client with your API key and configure for the group library.
      // const zotero = api(apiKey).library('group', groupId);
      const zotero = zoteroClient; 
      // Use the post() execution function to create the new item.
      // The API expects an array of entities.
      const newItem = { ...citationData[0], collections: collectionKeys };
      let response;

      try {
        response = await zotero.items().post([newItem]);
      }
      catch (err) {
        // Check for errors in the response
        if (err.response.status >= 400 && err.response.status < 600) {
          // Handle specific status codes with user-friendly messages
          if (err.response.status === 400) {
            throw new Error('The citation data is invalid. Please check the input and try again.');
          } else if (err.response.status === 401) {
            throw new Error('Your Zotero API key is invalid or expired. Please check your API key and try again.');
          } else if (err.response.status === 403) {
            throw new Error('You do not have permission to add items to this Zotero group library. Please check your permissions.');
          } else if (err.response.status === 404) {
            throw new Error('The Zotero group could not be found. Please check the group ID and try again.');
          } else if (err.response.status === 429) {
            throw new Error('You have exceeded the API rate limit. Please wait a moment and try again.');
          } else if (err.response.status === 500) {
            throw new Error('The Zotero server encountered an error. Please try again later.');
          } else if (err.response.status === 503) {
            throw new Error('The Zotero API is currently unavailable. Please try again later.');
          } else {
            throw new Error(`An unexpected error occurred: ${err.response.status}`);
          }
        }

        throw err;
      }

      const createdItems = response.getData(); // returns an array
      const itemKey = createdItems[0].key; // get the key of the first created item

      // Create and add notes to the created item
      if (notes.length > 0) {
        const noteObjects = notes.map(note => ({
          itemType: 'note',
          parentItem: itemKey,
          note: note,
        }));
      

        try {
          response = await zotero.items().post(noteObjects);
        } catch (err) {
          // Handle errors when adding notes
          if (err.response && err.response.status >= 400 && err.response.status < 600) {
            if (err.response.status === 400) {
              throw new Error('The note data is invalid. Please check the input and try again.');
            } else if (err.response.status === 401) {
              throw new Error('Your Zotero API key is invalid or expired. Please check your API key and try again.');
            } else if (err.response.status === 403) {
              throw new Error('You do not have permission to add notes to this Zotero group library. Please check your permissions.');
            } else if (err.response.status === 404) {
              throw new Error('The Zotero group could not be found. Please check the group ID and try again.');
            } else if (err.response.status === 429) {
              throw new Error('You have exceeded the API rate limit. Please wait a moment and try again.');
            } else if (err.response.status === 500) {
              throw new Error('The Zotero server encountered an error. Please try again later.');
            } else if (err.response.status === 503) {
              throw new Error('The Zotero API is currently unavailable. Please try again later.');
            } else {
              throw new Error(`An unexpected error occurred: ${err.response.status}`);
            }
          }

          throw err;
        }
      }

      // Upload thumbnail image as a child attachment if provided
      if (thumbnailFileObj && thumbnailArrayBuffer) {
        setProgressMessage('Uploading thumbnail image...');
        try {
          // Create the attachment item as a child of the main item
          const attachmentItem = {
            itemType: 'attachment',
            linkMode: 'imported_file',
            parentItem: itemKey,
            title: thumbnailFileObj.name,
            filename: thumbnailFileObj.name,
            contentType: thumbnailFileObj.type || 'image/png',
            charset: '',
            url: '',
            note: '',
            tags: [],
            relations: {},
          };

          const attachmentResponse = await zotero.items().post([attachmentItem]);
          const attachmentKey = attachmentResponse.getData()[0].key;

          // Upload the actual file data to the attachment
          await zotero.items(attachmentKey).attachment(thumbnailFileObj.name, thumbnailArrayBuffer).post();
        } catch (err) {
          console.error('Failed to upload thumbnail:', err);
          setThumbnailWarning('Citation was imported, but the thumbnail upload failed. You can add it manually in Zotero.');
        }
      }

      return `https://www.zotero.org/groups/${groupId}/items/${itemKey}`;
    } catch (err) {
      throw err;
    }
  }

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
            if (file && file.size > 10 * 1024 * 1024) {
              setError('Thumbnail image must be smaller than 10 MB.');
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
            sitekey={customFields.captcha_key}
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
        <div className={styles.progressMessage}>
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
    </div>
  );
}
