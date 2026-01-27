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

// Helper function to fetch detailed metadata for a specific resource
async function fetchResourceMetadata(resourceId="302dcbef13614ac486fb260eaa1ca87c") {
  const url = `https://www.hydroshare.org/hsapi/resource/${resourceId}/scimeta/elements/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Error fetching metadata for resource ${resourceId} (status: ${response.status})`
    );
  }
  const metadata = await response.json();
  return metadata;
}

async function fetchResource(id) {
  const url = `https://www.hydroshare.org/hsapi/resource/${encodeURIComponent(id)}/sysmeta`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching resources (status: ${response.status})`);
  }
  const data = await response.json();
  return data;
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

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching resources (status: ${response.status})`);
  }

  // data.results is typically where the list of resources is stored.
  const data = await response.json();

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

async function getCommunityResources(keyword="ciroh_portal_data", communityId="4", fullTextSearch=undefined, ascending=false, sortBy=undefined, author=undefined, pageNumber=undefined, pageSize=undefined) {
  try {
    // Fetch resources
    const groupIds = await getGroupIds(communityId);
    const [groupResourcesResponse, extraResourcesResponse] = await Promise.all([
      joinGroupResources(groupIds, fullTextSearch, pageNumber, pageSize),
      fetchResourcesWithPaginationData(keyword, fullTextSearch, ascending, sortBy, author, pageNumber)
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
    }

    // return await joinGroupResources(groupIds);
  } catch (error) {
    console.error('Community resource fetch failed:', error);
    return {};
  }
}

async function fetchResourcesByKeyword(keyword, fullTextSearch=undefined) {
  let url = `https://www.hydroshare.org/hsapi/resource/?subject=${encodeURIComponent(
    keyword
  )}`;

  if (fullTextSearch !== undefined) {
    url += `&full_text_search=${encodeURIComponent(fullTextSearch)}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching resources (status: ${response.status})`);
  }
  const data = await response.json();
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
 * @returns {Promise<Array>} Array of resource objects
 */
async function fetchResourcesBySearch(keyword, searchText, ascending=false, sortBy=undefined, author=undefined, pageNumber=1) {
  // Use hsapi/resource API (same as fetchResourcesByKeyword)
  let url = `https://www.hydroshare.org/hsapi/resource/?subject=${encodeURIComponent(keyword)}&page=${pageNumber}&count=40`;

  // Add search text if provided
  if (searchText && searchText.trim()) {
    url += `&full_text_search=${encodeURIComponent(searchText)}`;
  }

  console.log(`[fetchResourcesBySearch] URL: ${url}`);
  console.log(`[fetchResourcesBySearch] KEYWORD: ${keyword}, PAGE: ${pageNumber}, SEARCH: "${searchText}"`);

  // Fetch data from the API
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`[fetchResourcesBySearch] HTTP Error: ${response.status} ${response.statusText} for URL: ${url}`);
    throw new Error(`Error fetching resources (status: ${response.status})`);
  }
  const data = await response.json();

  console.log(`[fetchResourcesBySearch] Response received: count=${data.count}, results=${data.results?.length || 0}, for keyword="${keyword}"`);

  // The API returns results directly as an array in data.results
  const resources = data.results || [];

  let resourcesCorrected = [];

  for (let i = 0; i < resources.length; i++) {
    let resource = resources[i];
    let resourceCorrected = {
      resource_id: resource.resource_id,
      resource_title: resource.resource_title,
      authors: resource.authors,
      resource_type: resource.resource_type,
      resource_url: resource.resource_url,
      abstract: resource.abstract,
      date_created: resource.date_created,
      date_last_updated: resource.date_last_updated,
    };

    resourcesCorrected.push(resourceCorrected);
  }

  console.log(`[fetchResourcesBySearch] Returned ${resourcesCorrected.length} corrected resources for keyword="${keyword}"`);

  // Return the corrected resources
  return resourcesCorrected;
}

/**
 * Fetch resources from HydroShare based on search criteria and include pagination data in the returned object.
 * @param {string} keyword  - The keyword (subject) to use for the api request
 * @param {string} searchText - The text to look for in all the resource fields
 * @param {boolean} ascending - Whether to sort results in ascending order (true) or descending order (false)
 * @param {string} sortBy - The field to sort by. One of 'title', 'author', 'created', 'modified'
 * @param {string} author - The author to filter by
 * @param {number} pageNumber - The page number to fetch (1-based indexing)
 * @returns {Promise<Object>} Object containing resources array and pagination metadata
 */
async function fetchResourcesWithPaginationData(keyword, searchText, ascending=false, sortBy=undefined, author=undefined, pageNumber=1) {
  // API Url with query parameters
  let url = `https://www.hydroshare.org/discoverapi/?q=${searchText ? encodeURIComponent(searchText) : ''}&subjects=${encodeURIComponent(keyword)}`;

  // Add sort order parameter
  if (ascending) {
    url += `&asc=1`;
  } else {
    url += `&asc=-1`;
  }

  // Add sort parameter if provided
  if (sortBy !== undefined) {
    url += `&sort=${encodeURIComponent(sortBy)}`;
  }

  // Add page number parameter (1-based indexing)
  url += `&pnum=${pageNumber}`;

  console.log(`[fetchResourcesWithPaginationData] Fetching page ${pageNumber} with URL: ${url}`, {searchText: searchText || '(empty)'});

  // Fetch data from the API
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`[fetchResourcesWithPaginationData] HTTP Error: ${response.status} ${response.statusText} for URL: ${url}`);
    throw new Error(`Error fetching resources (status: ${response.status})`);
  }
  const data = await response.json();

  // Put resources into a corrected format
  let resources;

  if (pageNumber > data.pagecount) {
    resources = [];
  } else {
    if (typeof data.resources === "string") {
        try {
          resources = JSON.parse(data.resources);
        } catch (e) {
          console.error("Failed to parse data.resources as JSON string:", e);
        resources = [];
      }
    } else if (Array.isArray(data.resources)) {
      resources = data.resources;
    } else {
      console.warn("Unexpected format for data.resources:", data.resources);
      resources = [];
    }
  }

  let resourcesCorrected = [];

  for (let i = 0; i < resources.length; i++) {
    let resource = resources[i];
    let resourceCorrected = {
      resource_id: resource.short_id,
      resource_title: resource.title,
      authors: resource.authors,
      resource_type: resource.type,
      resource_url: 'https://www.hydroshare.org' + resource.link,
      abstract: resource.abstract,
      date_created: resource.created,
      date_last_updated: resource.modified,
    };

    resourcesCorrected.push(resourceCorrected);
  }

  console.log(`[fetchResourcesWithPaginationData] Fetched ${resourcesCorrected.length} of ${data.rescount} total resources`);

  // Return the corrected resources with pagination data
  return {
    resources: resourcesCorrected,
    resourcesLength: resourcesCorrected.length,
    resourceCountTotal: data.rescount,
    pageCount: data.pagecount,
    pageSize: data.perpage,
    pageNumber: pageNumber,
    pageLast: data.pagecount,
    hasMorePages: pageNumber < data.pagecount,
  };
}

/**
 * Fetch the pagination data for a given keyword and search criteria.
 * Uses the discoverapi endpoint to get resource count, page count, and resources per page.
 * @param {String} keyword The keyword/subject of the desired resources
 * @param {String} searchText The text to search for within the resources
 * @param {Boolean} ascending Whether to sort the results in ascending order
 * @param {String} sortBy The field to sort by. One of 'title', 'author', 'created', 'modified'
 * @param {String} author The author to filter the results by
 * @returns {Promise<Object>} An object containing pagination data
 */
async function fetchKeywordPageData(keyword, searchText, ascending=false, sortBy=undefined, author=undefined) {
  // API Url with query parameters
  let url = `https://www.hydroshare.org/discoverapi/?q=${encodeURIComponent(searchText)}&subject=${encodeURIComponent(keyword)}`;

  // Add sort order parameter
  if (ascending) {
    url += `&asc=1`;
  } else {
    url += `&asc=-1`;
  }

  // Add sort parameter if provided
  if (sortBy !== undefined) {
    url += `&sort=${encodeURIComponent(sortBy)}`;
  }

  // Add page number parameter (1-based indexing)
  url += `&pnum=${1}`;

  console.log(`[fetchKeywordPageData] Fetching page data with URL: ${url}`, {searchText: searchText || '(empty)'});

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`[fetchKeywordPageData] HTTP Error: ${response.status} ${response.statusText} for URL: ${url}`);
    throw new Error(`Error fetching resources (status: ${response.status})`);
  }
  const data = await response.json();

  console.log(`[fetchKeywordPageData] Total resources for keyword '${keyword}': ${data.rescount}, pages: ${data.pagecount}`);

  return {
    resourceCount: data.rescount,
    pageCount: data.pagecount,
    resourcesPerPage: data.perpage
  };
}

async function fetchResourceCustomMetadata(resourceId) {
  const url = `https://www.hydroshare.org/hsapi/resource/${resourceId}/scimeta/custom/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Error fetching metadata for resource ${resourceId} (status: ${response.status})`
    );
  }
  const data = await response.json();
  return data;
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

export {
  getCuratedIds, 
  fetchResource, 
  fetchResourcesByGroup, 
  fetchResourcesByKeyword, 
  fetchResourcesBySearch, fetchResourcesWithPaginationData, fetchKeywordPageData, getCommunityResources, 
  fetchResourceCustomMetadata, 
  joinExtraResources, 
  fetchRawCuratedResources,
  convertAuthorToLastFirst
};