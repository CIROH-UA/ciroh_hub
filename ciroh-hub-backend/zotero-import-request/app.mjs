/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

import { verifyRecaptcha } from '/opt/nodejs/index.mjs';
import apiPkg from 'zotero-api-client';
const api = apiPkg.default ?? apiPkg;   // Handle both CommonJS and ES module exports

/**
 * Attempts to import a citation into Zotero using the provided data, and returns the URL of the created item if successful.
 * @param {*} citationData The citation data to import, expected to be in the format returned by the Wikimedia REST API for Zotero citation data
 * @param {Array<string>} collectionKeys An array of collection keys to associate with the new item
 * @param {Array<string>} notes An array of notes to add to the new item
 * @param {*} thumbnailFileObj The thumbnail file object to upload
 * @param {*} thumbnailArrayBuffer The thumbnail file data as an ArrayBuffer
 * @returns {string} The URL of the created Zotero item
 * @throws Will throw an error if the import fails, with a user-friendly message based on the type of error encountered
 */
async function importCitationIntoZotero(
  citationData,
  collectionKeys = [],
  notes = [],
  thumbnailFileObj = null,
  thumbnailArrayBuffer = null
) {
  try {
    // Initialize the client with your API key and configure for the group library.
    const apiKey = process.env.ZOTERO_API_KEY;
    const groupId = process.env.ZOTERO_STAGING_GROUP_ID;
    const zotero = api(apiKey).library('group', groupId);

    // Use the post() execution function to create the new item.
    // The API expects an array of entities.
    const newItem = { ...citationData[0], collections: collectionKeys };
    let response;

    try {
      response = await zotero.items().post([newItem]);
    }
    catch (err) {
      // Check for errors in the response
      if (err.response && err.response.status >= 400 && err.response.status < 600) {
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
      }
    }

    return `https://www.zotero.org/groups/${groupId}/items/${itemKey}`;
  } catch (err) {
    throw err;
  }
}

/**
 * The main Lambda handler function that processes incoming API Gateway requests to import citation data into Zotero.
 * It verifies the reCAPTCHA token, fetches citation data from the Wikimedia REST API, and attempts to import it into Zotero,
 * returning appropriate responses based on the outcome of each step.
 * @param {*} event 
 * @param {*} context 
 * @returns 
 */
export const lambdaHandler = async (event, context) => {
  // Define CORS headers to allow requests from the frontend application
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'http://localhost:3001',
  };

  // Wikimedia REST API base (using the official REST endpoint)
  const wikimediaBaseUrl = 'https://en.wikipedia.org/api/rest_v1';
  const wikimediaUserAgent = 'CirohHub/1.0 (https://hub.ciroh.org; ciroh_it_support@ua.edu)';

  // Get the request body and parse it as JSON
  let body;
  try {
    body = JSON.parse(event.body);
  }
  catch (error) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid JSON body' }), headers: corsHeaders };
  }

  // Extract arguments from the request body, with default values if they are not provided
  const recaptchaToken = body?.recaptchaToken || '';
  const doi = body?.doi || '';
  const notes = body?.notes || [];
  const collections = body?.collections || [];
  const thumbnail = body?.thumbnail || null;

  // Validate doi
  const doiRegex = /^(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)$/i;
  if (!doiRegex.test(doi))
  {
    // Return http 400 to signal that the request was malformed, the DOI was invalid
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Invalid DOI format. Please provide a valid DOI.',
      }),
    };
  }

  // Verify the reCAPTCHA token
  const recaptchaResult = await verifyRecaptcha(recaptchaToken);

  if (!recaptchaResult.ok) {
    // reCAPTCHA verification failed
    return {
      statusCode: recaptchaResult.statusCode,
      headers: corsHeaders,
      body: JSON.stringify({
        message: recaptchaResult.message,
      }),
    };
  }

  // Fetch citation data from Wikimedia REST API
  const doiEncoded = encodeURIComponent('https://doi.org/' + doi.trim());
  const wikimediaUrl = `${wikimediaBaseUrl}/data/citation/zotero/${doiEncoded}`;
  const wikimediaResponse = await fetch(wikimediaUrl, {
    headers: { 'User-Agent': wikimediaUserAgent }
  });

  if (!wikimediaResponse.ok) {
    const upstreamStatus = wikimediaResponse.status;
    console.warn('Wikimedia citation lookup failed:', upstreamStatus, await wikimediaResponse.text());

    // Map upstream status to a safe, semantically appropriate client status
    let clientStatus;
    let clientMessage;

    if (upstreamStatus === 404) {
      // Genuine "not found" — pass through, user's input wasn't recognized
      clientStatus = 404;
      clientMessage = 'No citation data found for the provided DOI. Please check the DOI and try again.';
    }
    else
    if (upstreamStatus === 429) {
      // Wikimedia rate-limited us — our service is temporarily unable to fulfill
      clientStatus = 503;
      clientMessage = 'The citation service is temporarily unavailable. Please try again in a few minutes.';
    }
    else {
      // Anything else (400, 5xx, weird codes) — upstream gateway issue
      clientStatus = 502;
      clientMessage = 'Could not retrieve citation data at this time. Please try again later.';
    }

    return {
      statusCode: clientStatus,
      headers: corsHeaders,
      body: JSON.stringify({ message: clientMessage }),
    };
  }

  const citationData = await wikimediaResponse.json();

  // Convert thumbnail data to ArrayBuffer
  let thumbnailBuffer = null;
  let thumbnailData = null;
  if (thumbnail && typeof thumbnail.data === 'string' && thumbnail.data.length > 0) {
    thumbnailBuffer = Buffer.from(thumbnail.data, 'base64');
    thumbnailData = thumbnailBuffer.buffer.slice(thumbnailBuffer.byteOffset, thumbnailBuffer.byteOffset + thumbnailBuffer.byteLength);
  }

  // Import citation data into Zotero
  let itemUrl;
  try {
    itemUrl = await importCitationIntoZotero(citationData, collections, notes, thumbnail, thumbnailData);
  } catch (err) {
    // Return http 500 to signal that there was an error on the server while processing the request, with a user-friendly error message
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: err.message || 'An unexpected error occurred while importing the citation. Please try again later.',
      }),
    };
  }

  // Successful import, return the URL of the created Zotero item
  const response = {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      importedUrl: itemUrl,
    })
  };

  return response;
};
  