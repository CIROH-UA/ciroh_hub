const { XMLParser } = require("fast-xml-parser");

/**
 * Sample endpoint: 
 *   GET https://www.hydroshare.org/hsapi/resources/?subject=YOUR_KEYWORD
 * 
 * Resource metadata endpoint:
 *   GET https://www.hydroshare.org/resource/{resource_id}/scimeta/elements/
 * 
 * Adjust or add query parameters (e.g., page, count) as needed.
 */

/**
 * Convert author name from "First Middle Last" to "Last, First Middle"
 * @param {string} author - The author name in "First Middle Last" format
 * @returns {string} The author name in "Last, First Middle" format
 */
function convertAuthorToLastFirst(author) {
  if (!author || typeof author !== 'string') {
    return author;
  }
  
  const nameParts = author.split(' ');

  if (nameParts.length === 1) {
    // Single-word name, leave as-is
    author = nameParts[0];
  } else {
    const lastName = nameParts.pop();
    const firstName = nameParts.join(' ');
    author = `${lastName}, ${firstName}`;
  }

  return author;
}

async function fetchJson(url, errorContext = "resources") {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching ${errorContext} (status: ${response.status})`);
  }
  return response.json();
}

/**
 * Builds the URL for the HydroShare Discovery Atlas API based on the provided search criteria.
 *
 * @param {string} keyword The keyword(s) (subject) to use for the api request
 * @param {string} searchText The text to search for in the resources
 * @param {boolean} ascending Whether to sort the results in ascending order
 * @param {string} sortBy The field to sort the results by. One of "viewCount", "name", "dateCreated", "lastModified", "creatorName"
 * @param {string} author The author name to filter the results by
 * @param {string|undefined} paginationToken Token that identifies the next page. Omit on the first request.
 * @param {number} pageSize The number of resources to request per page
 * @returns {string} The constructed URL for the HydroShare Discovery Atlas API
 */
function buildDiscoveryAtlasApiUrl(
  keyword,
  searchText,
  ascending = false,
  sortBy = undefined,
  author = undefined,
  paginationToken = undefined,
  pageSize = 50,
) {
  // Add required arguments
  const params = new URLSearchParams({
    keyword: keyword,
    order: ascending ? "asc" : "desc",
    pageSize: pageSize.toString(),
  });

  // Add search terms if provided
  if (searchText !== undefined && searchText.trim() !== "") {
    params.set("term", searchText);
  }

  // Add author filter if provided
  if (author !== undefined) {
    params.set("creatorName", author);
  }

  // Add sortBy if provided
  if (sortBy !== undefined) {
    params.set("sortBy", sortBy);
  }

  // Add pagination token for subsequent pages
  if (paginationToken !== undefined && paginationToken !== null) {
    params.set("paginationToken", paginationToken);
  }

  return `https://www.hydroshare.org/hsapi/discovery-atlas/search?${params.toString()}`;
}

function mapDiscoveryResource(resource) {
  return {
    resource_id: resource.document[0].url.match(/resource\/([^/]+)/)[1],
    resource_title: resource.name,
    authors: resource.creator.map(c => c.name),
    resource_type: resource.document[0].additionalType ?? resource.document[0].content_types?.[0],
    resource_url: resource.document[0].url.replace(/^http:/, 'https:'),
    abstract: resource.description,
    date_created: resource.document[0].dateCreated,
    date_last_updated: resource.document[0].dateModified,
  };
}

/**
 * Normalize a discovery-atlas response body to a raw array of resource objects.
 * Tolerates both an already-decoded array and a JSON-encoded string.
 * 
 * @param {Array|String} data The raw response body from the discovery-atlas API, either as an array or a JSON string
 * @returns {Array} An array of resource objects
 */
function getRawDiscoveryResources(data) {
  // Data given is an array
  if (Array.isArray(data)) {
    return data;
  }

  // Data given is a JSON string
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to parse data as JSON string:", error);
      return [];
    }
  }
  console.warn("Unexpected format for data:", data);
  return [];
}

// Helper function to fetch detailed metadata for a specific resource
// async function fetchResourceMetadata(resourceId="302dcbef13614ac486fb260eaa1ca87c") {
//   const url = `https://www.hydroshare.org/hsapi/resource/${resourceId}/scimeta/elements/`;
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error(
//       `Error fetching metadata for resource ${resourceId} (status: ${response.status})`
//     );
//   }
//   const metadata = await response.json();
//   return metadata;
// }

async function fetchResource(id) {
  const url = `https://www.hydroshare.org/hsapi/resource/${encodeURIComponent(id)}/sysmeta`;
  return fetchJson(url, "resources");
}

// Helper function to fetch list of resources by group
async function fetchResourcesByGroup(groupid, fullTextSearch=undefined, pageNumber=undefined, pageSize=undefined) {
  let url = `https://www.hydroshare.org/hsapi/resource/?group=${encodeURIComponent(
    groupid
  )}`;

  if (fullTextSearch !== undefined) {
    url += `&full_text_search=${encodeURIComponent(fullTextSearch)}`;
  }

  if (pageNumber !== undefined) {
    url += `&page=${encodeURIComponent(pageNumber)}`;
  }

  if (pageSize !== undefined) {
    url += `&count=${encodeURIComponent(pageSize)}`;
  }

  // data.results is typically where the list of resources is stored.
  const data = await fetchJson(url, "resources");

  // Get resources and pagination info
  const returnData = {
    resources: data.results,
    resourcesLength: data.results.length,
    resourceCountTotal: data.count,
    pageSize: pageSize,
    pageNumber: pageNumber,
    pageLast: pageSize ? Math.ceil(data.count / pageSize) : 1,
    hasMorePages: data.next !== null,
    pageNextUrl: data.next,
    pagePreviousUrl: data.previous,
  };

  // Return the resources along with pagination info
  return returnData;
}
  
function extractRelatedResourceIds(metadata) {
  return metadata.relations
    .filter(item => item.type === 'hasPart')
    .map(item => {
      const match = item.value.match(/http:\/\/www\.hydroshare\.org\/resource\/([a-f0-9]{32})/);
      return match ? match[1] : null;
    })
    .filter(id => id !== null); // Remove non-matching entries
}

async function getCuratedIds(resourceId) {
  try {
    const metadata = await fetchResourceMetadata(resourceId);
    return extractRelatedResourceIds(metadata);
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

async function getGroupIds(communityId="4") {
  const url = `https://www.hydroshare.org/community/${communityId}/`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Find the JSON script tag
    const scriptTag = doc.querySelector('script#community-app-data[type="application/json"]');
    if (!scriptTag?.textContent) {
      console.log("No script tag with id 'community-app-data' found or it contains no data.");
      return [];
    }

    // Parse JSON and extract group IDs
    const data = JSON.parse(scriptTag.textContent);
    return data.members?.map(member => member.id.toString()).filter(Boolean) || [];

  } catch (error) {
    console.error(`Error processing community ${communityId}:`, error);
    return [];
  }
}


async function joinGroupResources(groupIds, fullTextSearch=undefined, pageNumber=undefined, pageSize=undefined) {
  const seenResourceIds = new Set();
  const uniqueResources = [];
  let hasMorePages = false;

  // Process groups sequentially to maintain order
  for (const groupId of groupIds) {
    try {
      const apiResponse = await fetchResourcesByGroup(groupId, fullTextSearch, pageNumber, pageSize);
      
      if (apiResponse.hasMorePages) {
        hasMorePages = true;
      }

      // Filter and collect unique resources
      for (const resource of apiResponse.resources) {
        const resourceId = resource.resource_id;
        if (!seenResourceIds.has(resourceId)) {
          seenResourceIds.add(resourceId);
          uniqueResources.push(resource);
        }
      }
    } catch (error) {
      console.error(`Error processing group ${groupId}:`, error);
      // Continue processing other groups even if one fails
    }
  }

  return {
    resources: uniqueResources,
    resourcesLength: uniqueResources.length,
    pageSize: pageSize,
    pageNumber: pageNumber,
    hasMorePages: hasMorePages,
  };
}

function joinExtraResources(groupResources, extraResources) {
  const seenResourceIds = new Set();
  const allResources = groupResources.concat(extraResources);
  const uniqueResources = [];
  
  // Filter and collect unique resources
  allResources.forEach( (resource) => {
    const resourceId = resource.resource_id;
    if (!seenResourceIds.has(resourceId)) {
      seenResourceIds.add(resourceId);
      uniqueResources.push(resource);
    }
  });

  return uniqueResources;

}

/**
 * Fetch community resources by combining hsapi group results with
 * discovery-atlas keyword search results.
 *
 * Pagination is heterogeneous: `groupPageNumber` advances the hsapi group call
 * (1-based page numbers) while `paginationToken` advances the discovery-atlas
 * call (cursor). For the first request, omit both. For subsequent requests,
 * read the next values off the previous response:
 *   - groupPageNumber: previousResponse.groupResourcesPageData.pageNumber + 1
 *   - paginationToken: previousResponse.extraResourcesPageData.nextPaginationToken
 *
 * `hasMorePages` is the union of both internal sources' hasMorePages.
 *
 * @param {string} keyword The keyword(s) to search for in the discovery-atlas API
 * @param {string} communityId The ID of the HydroShare community to fetch group resources from
 * @param {string} fullTextSearch Optional full text search string to filter results
 * @param {boolean} ascending Whether to sort discovery-atlas results in ascending order
 * @param {string} sortBy The field to sort discovery-atlas results by. One of "viewCount", "name", "dateCreated", "lastModified", "creatorName"
 * @param {string} author The author name to filter discovery-atlas results by
 * @param {number|undefined} groupPageNumber Page number for the hsapi group call. Omit on the first request.
 * @param {string|undefined} paginationToken Cursor for the discovery-atlas call. Omit on the first request.
 * @param {number} pageSize The number of resources to request per page for both sources
 * @returns {Promise<Object>} An object containing combined resources and pagination data from both sources
 */
async function getCommunityResources(
  keyword="ciroh_portal_data,ciroh_hub_data",
  communityId="4",
  fullTextSearch=undefined,
  ascending=false,
  sortBy=undefined,
  author=undefined,
  groupPageNumber=undefined,
  paginationToken=undefined,
  pageSize=undefined,
) {
  try {
    // Fetch resources
    const groupIds = await getGroupIds(communityId);
    const [groupResourcesResponse, extraResourcesResponse] = await Promise.all([
      joinGroupResources(groupIds, fullTextSearch, groupPageNumber, pageSize),
      fetchResourcesBySearch(keyword, fullTextSearch, ascending, sortBy, author, paginationToken, pageSize),
    ]);

    // Extract resources
    let groupResources = groupResourcesResponse.resources;
    let extraResources = extraResourcesResponse.resources;

    const joinedResources = joinExtraResources(groupResources, extraResources);

    // Return combined data
    return {
      groupResourcesPageData: groupResourcesResponse,
      extraResourcesPageData: extraResourcesResponse,
      resources: joinedResources,
      hasMorePages: Boolean(groupResourcesResponse.hasMorePages || extraResourcesResponse.hasMorePages),
    };
  } catch (error) {
    console.error('Community resource fetch failed:', error);
    return {};
  }
}

async function fetchResourcesByKeyword(keyword, { page = 1, count = 15, fullTextSearch } = {}) {
  const params = new URLSearchParams({
    subject: keyword,
    page: page.toString(),
    count: count.toString(),
  });
  if (fullTextSearch) {
    params.set('full_text_search', fullTextSearch);
  }
  const url = `https://www.hydroshare.org/hsapi/resource/?${params.toString()}`;
  const data = await fetchJson(url, "resources");
  // data.results is typically where the list of resources is stored.
  // If your actual structure differs, adjust accordingly.
  return data.results;
}

/**
 * Internal helper that performs a single discovery-atlas request and returns
 * mapped resources together with the cursor for the next page. Callers should
 * use `fetchResourcesBySearch` instead, which wraps this core function.
 *
 * @param {Object} params
 * @param {string} params.keyword The keyword (subject) to use for the api request
 * @param {string} params.searchText The text to look for in all the resource fields
 * @param {boolean} params.ascending Whether to sort results in ascending order
 * @param {string} params.sortBy The field to sort by. One of 'viewCount', 'name', 'dateCreated', 'lastModified', 'creatorName'
 * @param {string} params.author The author to filter by
 * @param {string|undefined} params.paginationToken Cursor returned from the previous call. Omit on the first request.
 * @param {number} params.pageSize The number of resources to request per page
 * @returns {Promise<{resources: Array, nextPaginationToken: string|undefined, hasMorePages: boolean}>}
 */
async function fetchDiscoveryResourcesCore({
  keyword,
  searchText,
  ascending = false,
  sortBy = undefined,
  author = undefined,
  paginationToken = undefined,
  pageSize = 50,
}) {
  const url = buildDiscoveryAtlasApiUrl(keyword, searchText, ascending, sortBy, author, paginationToken, pageSize);
  const data = await fetchJson(url, "resources");
  const rawResources = getRawDiscoveryResources(data);
  const nextPaginationToken = rawResources.length === pageSize ? (rawResources[rawResources.length - 1].paginationToken ?? null) : null;
  const resources = rawResources.map(mapDiscoveryResource);
  return {
    resources,
    nextPaginationToken,
    hasMorePages: nextPaginationToken !== undefined && nextPaginationToken !== null,
  };
}

/**
 * Fetch a page of resources from HydroShare's discovery-atlas search.
 *
 * Returns an object so callers can drive cursor-based pagination — the previous
 * response's `nextPaginationToken` must be passed back as `paginationToken` to
 * fetch the next page. On the first call, pass `undefined`.
 *
 * @param {string} keyword The keyword (subject) to use for the api request
 * @param {string} searchText The text to look for in all the resource fields
 * @param {boolean} ascending Whether to sort results in ascending order
 * @param {string} sortBy The field to sort by. One of 'viewCount', 'name', 'dateCreated', 'lastModified', 'creatorName'
 * @param {string} author The author to filter by
 * @param {string|undefined} paginationToken Cursor returned from the previous call. Omit on the first request.
 * @param {number} pageSize The number of resources to request per page
 * @returns {Promise<{resources: Array, nextPaginationToken: string|undefined, hasMorePages: boolean}>}
 */
async function fetchResourcesBySearch(keyword, searchText, ascending=false, sortBy=undefined, author=undefined, paginationToken=undefined, pageSize=undefined) {
  return fetchDiscoveryResourcesCore({
    keyword,
    searchText,
    ascending,
    sortBy,
    author,
    paginationToken,
    pageSize,
  });
}

function normalizeKeywordList(keywords = []) {
  if (!Array.isArray(keywords)) {
    return [];
  }
  return keywords
    .map(keyword => (typeof keyword === 'string' ? keyword.trim() : ''))
    .filter(Boolean);
}

async function fetchResourcesByKeywordsIntersection(keywords = [], options = {}) {
  const {
    page = 1,
    count = 15,
    fullTextSearch,
  } = options;
  const normalizedKeywords = normalizeKeywordList(keywords);

  if (normalizedKeywords.length === 0) {
    return [];
  }

  let encounteredError = null;
  const keywordResults = await Promise.all(
    normalizedKeywords.map(async keyword => {
      try {
        return await fetchResourcesByKeyword(keyword, { page, count, fullTextSearch });
      } catch (error) {
        console.error(`Error fetching resources for keyword "${keyword}":`, error);
        if (!encounteredError) {
          encounteredError = error;
        }
        return [];
      }
    }),
  );

  if (encounteredError) {
    throw encounteredError;
  }

  // Early exit if any keyword returned no matches to avoid unnecessary processing.
  if (keywordResults.some(result => result.length === 0)) {
    return [];
  }

  const intersectionMap = new Map();
  const occurrenceMap = new Map();

  keywordResults.forEach(resultList => {
    resultList.forEach(resource => {
      const resourceId = resource?.resource_id;
      if (!resourceId) {
        return;
      }

      if (!intersectionMap.has(resourceId)) {
        intersectionMap.set(resourceId, resource);
      }
      occurrenceMap.set(resourceId, (occurrenceMap.get(resourceId) || 0) + 1);
    });
  });

  const fullMatchResources = [];
  const requiredMatches = normalizedKeywords.length;

  occurrenceMap.forEach((count, resourceId) => {
    if (count === requiredMatches) {
      const resource = intersectionMap.get(resourceId);
      if (resource) {
        fullMatchResources.push(resource);
      }
    }
  });
  return fullMatchResources;
}

async function fetchResourceCustomMetadata(resourceId) {
  const url = `https://www.hydroshare.org/hsapi/resource/${resourceId}/scimeta/custom/`;
  return fetchJson(url, `metadata for resource ${resourceId}`);
}

async function fetchResourceMetadata(resourceId) {
  const url = `https://www.hydroshare.org/hsapi/resource/${resourceId}/scimeta/elements/`;
  return fetchJson(url, `scimeta elements for resource ${resourceId}`);
}

// Fetch the curated resources first (from the "parent" resource).
async function fetchRawCuratedResources(curated_parent_id) {
  try {
    const curatedIds = await getCuratedIds(curated_parent_id);

    const curatedList = await Promise.all(curatedIds.map(async (id) => {
      const resource = await fetchResource(id);
      return resource;
    }));

    return curatedList;
  } catch (err) {
    console.error("Error fetching curated resources:", err);
    return [];
  }
};

/**
 * Fetch the HydroShare resources that have been added to the specified collection resource.
 * @param {string} collectionId - The ID of the HydroShare collection resource to fetch contained resources from.
 * @returns {Promise<Array>} An array of HydroShare resources.
 */
async function fetchResourcesFromCollection(collectionId) {
  // Fetch the collection metadata to extract its contained resource ids
  const collectionMetadataUrl = `https://www.hydroshare.org/hsapi/resource/${collectionId}/scimeta/`;
  const collectionMetadataResponse = await fetch(collectionMetadataUrl);

  // Error occurred
  if (!collectionMetadataResponse.ok) {
    throw new Error(`Error fetching collection metadata for ${collectionId} (status: ${collectionMetadataResponse.status})`);
  }

  // Parse the XML metadata to extract resource ids
  const collectionMetadataText = await collectionMetadataResponse.text();
  const xmlParser = new XMLParser();
  const collectionMetadata = xmlParser.parse(collectionMetadataText);

  // Get the relations as an array (handle both single relation and multiple relations cases)
  const relations = collectionMetadata['rdf:RDF']['hsterms:CollectionResource']['dc:relation'];
  const relationsList = Array.isArray(relations) ? relations : [relations];

  // Extract each resource id from the collection relations
  const resourceIds = [];
  for (const relation of relationsList)
  {
    // Extract resource id
    const hasPartText = relation['rdf:Description']['dcterms:hasPart']
    const url = hasPartText.split(' ').pop();
    const resourceId = url.split('/').pop();
    
    // Add resource id to list
    resourceIds.push(resourceId);
  }

  // Fetch all resources in parallel
  const resourcePromises = resourceIds.map(resourceId =>
    fetchResource(resourceId).catch(err => {
      console.error(`Error fetching resource ${resourceId} from collection ${collectionId}:`, err);
      return null;
    })
  );

  const resources = (await Promise.all(resourcePromises)).filter(Boolean);

  // Return the list of resources
  return resources;
}

/**
 * Fetch the URLs of image files for a given HydroShare resource.
 * @param {string} resourceId - The ID of the HydroShare resource.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of image URLs.
 */
async function fetchResourceImageUrls(resourceId) {
  // Fetch the list of files for the resource to find image files
  const filesUrl = `https://www.hydroshare.org/hsapi/resource/${resourceId}/file_list/`;
  const filesResponse = await fetch(filesUrl);

  if (!filesResponse.ok) {
    throw new Error(`Error fetching file list for resource ${resourceId} (status: ${filesResponse.status})`);
  }

  // Get the response data as JSON
  const filesData = await filesResponse.json();

  // Get the URLs of files that are images based on their content type
  const imageUrls = [];
  for (const result of filesData.results)
  {
    // Check if the content type indicates an image
    if (result.content_type && result.content_type.startsWith('image/'))
    {
      // Add image URL to list
      imageUrls.push(result.url);
    }
  }

  // Return the list of image URLs
  return imageUrls;
}

export {
  getCuratedIds, 
  fetchResource, 
  fetchResourcesByGroup, 
  fetchResourcesByKeyword, 
  fetchResourcesByKeywordsIntersection,
  fetchResourcesBySearch,
  getCommunityResources,
  fetchResourceCustomMetadata, 
  fetchResourceMetadata,
  joinExtraResources, 
  fetchRawCuratedResources,
  convertAuthorToLastFirst,
  fetchResourcesFromCollection,
  fetchResourceImageUrls
};
