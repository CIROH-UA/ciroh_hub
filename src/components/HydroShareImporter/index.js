import { fetchSearchResourcesCore, HS_SEARCH_PAGE_SIZE } from "@site/src/api/hydroshareAPI";
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

async function fetchJson(url, errorContext = "resources") {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching ${errorContext} (status: ${response.status})`);
  }
  return response.json();
}

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

async function getCommunityResources(keyword="ciroh_portal_data,ciroh_hub_data", communityId="4", fullTextSearch=undefined, ascending=false, sortBy=undefined, author=undefined, paginationToken=undefined, pageSize=HS_SEARCH_PAGE_SIZE, groupPage=1) {
  try {
    const groupIds = await getGroupIds(communityId);
    // paginationToken === null means search is exhausted; skip the search call.
    // paginationToken === undefined means first page; fetch normally.
    const searchExhausted = paginationToken === null;
    const [groupResourcesResponse, extraResourcesResponse] = await Promise.all([
      joinGroupResources(groupIds, fullTextSearch, groupPage, pageSize),
      searchExhausted
        ? Promise.resolve({ resources: [], resourcesLength: 0, nextToken: null })
        : fetchResourcesWithPaginationData(keyword, fullTextSearch, ascending, sortBy, author, paginationToken, pageSize)
    ]);

    // Extract resources
    let groupResources = groupResourcesResponse.resources;
    let extraResources = extraResourcesResponse.resources;

    const joinedResources = joinExtraResources(groupResources, extraResources);

    // Return combined data
    return {
      groupResourcesPageData: groupResourcesResponse,
      extraResourcesPageData: extraResourcesResponse,
      resources: joinedResources
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
 * Fetch resources from HydroShare based on search criteria.
 * @param {string} keyword  - The keyword (subject) to use for the api request
 * @param {string} searchText - The text to look for in all the resource fields
 * @param {boolean} ascending - Whether to sort results in ascending order (true) or descending order (false)
 * @param {string} sortBy - The field to sort by. One of 'title', 'author', 'created', 'modified'
 * @param {string} author - The author to filter by
 * @param {string} paginationToken - Token from previous response for next page, or undefined for first page
 * @param {number} pageSize - Number of results per page
 * @returns {Promise<{resources: Array, nextToken: string|null}>}
 */
async function fetchResourcesBySearch(keyword, searchText, ascending=false, sortBy=undefined, author=undefined, paginationToken=undefined, pageSize=HS_SEARCH_PAGE_SIZE) {
  return fetchSearchResourcesCore({ keyword, searchText, ascending, sortBy, author, paginationToken, pageSize });
}

/**
 * Fetch resources from HydroShare based on search criteria and include pagination data in the returned object.
 * @param {string} keyword  - The keyword (subject) to use for the api request
 * @param {string} searchText - The text to look for in all the resource fields
 * @param {boolean} ascending - Whether to sort results in ascending order (true) or descending order (false)
 * @param {string} sortBy - The field to sort by. One of 'title', 'author', 'created', 'modified'
 * @param {string} author - The author to filter by
 * @param {string} paginationToken - Token from previous response for next page, or undefined for first page
 * @param {number} pageSize - Number of results per page
 * @returns {Promise<{resources: Array, resourcesLength: number, nextToken: string|null}>}
 */
async function fetchResourcesWithPaginationData(keyword, searchText, ascending=false, sortBy=undefined, author=undefined, paginationToken=undefined, pageSize=HS_SEARCH_PAGE_SIZE) {
  const { resources, nextToken } = await fetchSearchResourcesCore({ keyword, searchText, ascending, sortBy, author, paginationToken, pageSize });
  return {
    resources,
    resourcesLength: resources.length,
    nextToken,
  };
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
  fetchResourcesWithPaginationData,
  getCommunityResources, 
  fetchResourceCustomMetadata, 
  fetchResourceMetadata,
  joinExtraResources, 
  fetchRawCuratedResources,
  fetchResourcesFromCollection,
  fetchResourceImageUrls
};
