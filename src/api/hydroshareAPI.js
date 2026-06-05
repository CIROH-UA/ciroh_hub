    /**
 * Sample endpoint: 
 *   GET https://www.hydroshare.org/hsapi/resources/?subject=YOUR_KEYWORD
 * 
 * Resource metadata endpoint:
 *   GET https://www.hydroshare.org/resource/{resource_id}/scimeta/elements/
 * 
 * Adjust or add query parameters (e.g., page, count) as needed.
 */

const HS_SEARCH_ENDPOINT = "https://www.hydroshare.org/hsapi/discovery-atlas/search"
const HS_SEARCH_PAGE_SIZE = 40;
const HS_SORT_MAP = {
  "modified": "lastModified",
  "created": "dateCreated",
  "title": "name",
  "author": "creatorName",
};

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

function buildSearchUrl(keyword, searchText, ascending, sortBy, author, paginationToken, pageSize = HS_SEARCH_PAGE_SIZE) {
  const paramsObj = {
    pageSize: pageSize.toString(),
    term: searchText ? searchText.trim() : undefined,
    keyword: keyword ? keyword : undefined,
    order: ascending ? "asc" : "desc",
    sortBy: sortBy ? HS_SORT_MAP[sortBy.toLowerCase()] : undefined,
    creatorName: author ? convertAuthorToLastFirst(author) : undefined,
    paginationToken: paginationToken ? paginationToken : undefined,
  };
  const params = new URLSearchParams(Object.fromEntries(Object.entries(paramsObj).filter(([, v]) => v !== undefined)));
  return `${HS_SEARCH_ENDPOINT}?${params.toString()}`;
}

function mapSearchResource(item) {
  const doc = item.document?.[0] ?? {};
  return {
    resource_id: doc.url?.split('/').pop() ?? item._id,
    resource_title: item.name ?? null,
    authors: (item.creator ?? []).map(c => c.name),
    resource_type: doc.additionalType ?? null,
    resource_url: doc.url ?? null,
    abstract: item.description ?? null,
    date_created: doc.dateCreated ?? null,
    date_last_updated: doc.dateModified ?? null,
  };
}

async function fetchSearchResourcesCore({ keyword, searchText, ascending = false, sortBy, author, paginationToken, pageSize = HS_SEARCH_PAGE_SIZE }) {
  const url = buildSearchUrl(keyword, searchText, ascending, sortBy, author, paginationToken, pageSize);
  const items = await fetchJson(url, "resources");
  if (!Array.isArray(items) || items.length === 0) {
    return { resources: [], nextToken: null };
  }
  const resources = items.map(mapSearchResource);
  const nextToken = resources.length === pageSize ? (items[items.length - 1].paginationToken ?? null) : null;
  return { resources, nextToken };
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
 * @param {string} paginationToken - Token from previous response for next page, or undefined for first page
 * @returns {Promise<{resources: Array, nextToken: string|null}>}
 */
async function fetchResourcesBySearch(keyword, searchText, ascending=false, sortBy=undefined, author=undefined, paginationToken=undefined) {
  return fetchSearchResourcesCore({ keyword, searchText, ascending, sortBy, author, paginationToken });
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
  fetchResourcesBySearch,
  fetchSearchResourcesCore,
  HS_SEARCH_PAGE_SIZE,
  getCommunityResources, 
  fetchResourceCustomMetadata, 
  joinExtraResources, 
  fetchRawCuratedResources,
  convertAuthorToLastFirst
};