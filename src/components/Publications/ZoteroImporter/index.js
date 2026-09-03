import api from 'zotero-api-client';

/**
 * Create a configured Zotero API client.
 * @param {string} apiKey - The Zotero API key.
 * @param {number} libraryId - The ID of the Zotero library.
 * @param {'group'|'user'} libraryType - The type of the Zotero library ('group' or 'user').
 * @returns {object} - The configured Zotero API client.
 * @example
 * const zotero = zoteroApiCreate(process.env.ZOTERO_API_KEY, 1234567, 'group');
 */
function zoteroApiCreate(apiKey, libraryId, libraryType = 'group')
{
    // apiKey is required
    if (!apiKey)
    {
        throw new Error('Zotero API key is required');
    }

    // libraryId is required
    if (!libraryId)
    {
        throw new Error('Zotero library ID is required');
    }

    // Validate libraryId is a positive integer
    const numericLibraryId = Number(libraryId);

    if (!Number.isInteger(numericLibraryId) || numericLibraryId <= 0)
    {
        throw new Error('Zotero library ID must be a positive integer');
    }

    // Validate libraryType is either 'group' or 'user'
    if (libraryType !== 'group' && libraryType !== 'user')
    {
        throw new Error('Zotero library type must be either "group" or "user"');
    }

    // Create and return the Zotero API client instance
    return api(apiKey).library(libraryType, numericLibraryId);
}

/**
 * Fetch a page of collections from the library.
 * Zotero's default page size is 25 and the maximum per request is 100; pass `{ limit, start }`
 * in `query` to control paging. Loop until `hasMore` is false to retrieve every collection.
 * @param {object} zotero - A Zotero API client from zoteroApiCreate().
 * @param {object} [query] - Optional query parameters forwarded to the Zotero API (e.g. { limit: 100, start: 0 }).
 * @returns {Promise<{ data: Array<object>, total: number, hasMore: boolean }>}
 *          - `data`: collection data objects on this page (each has `key`, `name`, `parentCollection`, etc.).
 *          - `total`: total number of collections matching the query across all pages.
 *          - `hasMore`: true if more pages remain (i.e. another fetch with a larger `start` will return more rows).
 * @example
 * // Fetch a single page
 * const { data, total, hasMore } = await zoteroFetchCollections(zotero, { limit: 100 });
 *
 * // Fetch every collection in the library
 * const all = [];
 * let start = 0;
 * while (true)
 * {
 *     const page = await zoteroFetchCollections(zotero, { start, limit: 100 });
 *     all.push(...page.data);
 *     if (!page.hasMore) break;
 *     start += page.data.length;
 * }
 */
async function zoteroFetchCollections(zotero, query = {})
{
    // Ensure zotero client instance is provided
    if (!zotero)
    {
        throw new Error('Zotero API client is required');
    }

    // Fetch collections with the provided query parameters
    const response = await zotero.collections().get(query);
    const data = response.getData();
    const total = response.getTotalResults();
    const start = query.start || 0;
    const hasMore = start + data.length < total;

    // Return the collection data along with pagination info
    return { data, total, hasMore };
}

/**
 * Fetch a page of top-level items from the library — i.e. publications/papers/books, excluding
 * their child attachments and notes. Optionally scope to a single collection.
 * Zotero's default page size is 25 and the maximum per request is 100; pass `{ limit, start }`
 * in `query` to control paging. Loop until `hasMore` is false to retrieve every item.
 * @param {object} zotero - A Zotero API client from zoteroApiCreate().
 * @param {object} [query] - Optional query parameters forwarded to the Zotero API
 *                           (e.g. { start, limit, sort, direction, q, itemType }).
 * @param {string} [collectionKey] - If provided, only return top-level items within this collection.
 * @returns {Promise<{ data: Array<object>, total: number, hasMore: boolean }>}
 *          - `data`: top-level item data objects on this page.
 *          - `total`: total number of items matching the query across all pages.
 *          - `hasMore`: true if more pages remain.
 * @example
 * // First page of publications, newest first
 * const { data, total } = await zoteroFetchTopItems(zotero, {
 *     start: 0, limit: 50, sort: 'date', direction: 'desc',
 * });
 *
 * // Top-level items within a specific collection
 * const page = await zoteroFetchTopItems(zotero, { limit: 50 }, 'ABCD1234');
 */
async function zoteroFetchTopItems(zotero, query = {}, collectionKey = null)
{
    // Ensure zotero client instance is provided
    if (!zotero)
    {
        throw new Error('Zotero API client is required');
    }

    // Limit to items in the specified collection if collectionKey is provided, otherwise fetch from the whole library
    const scope = collectionKey ? zotero.collections(collectionKey).items() : zotero.items();

    // Fetch items with the provided query parameters
    const response = await scope.top().get(query);
    const data = response.getData();
    const total = response.getTotalResults();
    const start = query.start || 0;
    const hasMore = start + data.length < total;

    // Return the item data along with pagination info
    return { data, total, hasMore };
}

/**
 * Fetch a page of child items (attachments and notes) of a Zotero item.
 * Zotero's default page size is 25 and the maximum per request is 100; pass `{ limit, start }`
 * in `query` to control paging. Loop until `hasMore` is false to retrieve every child.
 * @param {object} zotero - A Zotero API client from zoteroApiCreate().
 * @param {string} itemKey - The Zotero key of the parent item.
 * @param {object} [query] - Optional query parameters forwarded to the Zotero API (e.g. { itemType: 'attachment' } or { limit: 100, start: 0 }).
 * @returns {Promise<{ data: Array<object>, total: number, hasMore: boolean }>}
 *          - `data`: child item data objects on this page.
 *          - `total`: total number of children matching the query across all pages.
 *          - `hasMore`: true if more pages remain.
 * @example
 * // All children (attachments + notes) of a publication
 * const { data } = await zoteroFetchChildren(zotero, 'WXYZ7890', { limit: 100 });
 *
 * // Only the notes
 * const { data: notes } = await zoteroFetchChildren(zotero, 'WXYZ7890', { itemType: 'note' });
 */
async function zoteroFetchChildren(zotero, itemKey, query = {})
{
    // Ensure zotero client instance is provided
    if (!zotero)
    {
        throw new Error('Zotero API client is required');
    }

    // Ensure itemKey is provided
    if (typeof itemKey !== 'string' || !itemKey)
    {
        throw new Error('Zotero item key is required');
    }

    // Fetch child items with the provided query parameters
    const response = await zotero.items(itemKey).children().get(query);
    const data = response.getData();
    const total = response.getTotalResults();
    const start = query.start || 0;
    const hasMore = start + data.length < total;

    // Return the child item data along with pagination info
    return { data, total, hasMore };
}

/**
 * Fetch a page of attachment children of a Zotero item (filters out notes).
 * Zotero's default page size is 25 and the maximum per request is 100; pass `{ limit, start }`
 * in `query` to control paging. Loop until `hasMore` is false to retrieve every attachment.
 * @param {object} zotero - A Zotero API client from zoteroApiCreate().
 * @param {string} itemKey - The Zotero key of the parent item.
 * @param {object} [query] - Optional query parameters forwarded to the Zotero API (e.g. { limit: 100, start: 0 }).
 *                           Any `itemType` passed here is overridden — this helper always filters to attachments.
 * @returns {Promise<{ data: Array<object>, total: number, hasMore: boolean }>}
 *          - `data`: attachment item data objects on this page. Each has a `linkMode` field of
 *                    'imported_file' | 'imported_url' | 'linked_file' | 'linked_url'.
 *          - `total`: total number of attachments across all pages.
 *          - `hasMore`: true if more pages remain.
 * @example
 * const { data: attachments } = await zoteroFetchAttachments(zotero, 'WXYZ7890');
 * const pdfs = attachments.filter(a => a.contentType === 'application/pdf');
 */
async function zoteroFetchAttachments(zotero, itemKey, query = {})
{
    // Fetch the item's attachments by reusing the zoteroFetchChildren function with an enforced itemType filter
    return zoteroFetchChildren(zotero, itemKey, { ...query, itemType: 'attachment' });
}

/**
 * Fetch every attachment of a Zotero item whose linkMode is 'linked_url' — i.e. attachments that
 * point at an external URL rather than at a file uploaded to Zotero. Pages through all attachments
 * internally so the client-side linkMode filter sees the complete set.
 * @param {object} zotero - A Zotero API client from zoteroApiCreate().
 * @param {string} itemKey - The Zotero key of the parent item.
 * @returns {Promise<Array<object>>} - Array of attachment data objects with linkMode === 'linked_url'. Each has a `url` field with the linked URL.
 * @example
 * const linkedUrls = await zoteroFetchLinkedUrls(zotero, 'WXYZ7890');
 * const urls = linkedUrls.map(a => a.url);
 */
async function zoteroFetchLinkedUrls(zotero, itemKey)
{
    // Variables to handle pagination and accumulate linked_url attachments
    const linkedUrls = [];
    const limit = 100;
    let start = 0;

    // Loop through attachment pages until all are fetched
    while (true)
    {
        // Fetch a page of attachments
        const { data, hasMore } = await zoteroFetchAttachments(zotero, itemKey, { start, limit });

        // Filter attachments with linkMode 'linked_url' and accumulate them
        for (const attachment of data)
        {
            if (attachment.linkMode === 'linked_url')
            {
                linkedUrls.push(attachment);
            }
        }

        // If no more pages remain, break the loop
        if (!hasMore)
        {
            break;
        }

        // Move the start index for the next page
        start += data.length;
    }

    // Return the accumulated linked_url attachments
    return linkedUrls;
}

/**
 * Get a temporary, signed file URL for an attachment stored in Zotero. Only meaningful for
 * attachments whose linkMode is 'imported_file' or 'imported_url' (i.e. the file lives in Zotero).
 * Useful for rendering an attachment in an <img src> or <a href>.
 * @param {object} zotero - A Zotero API client from zoteroApiCreate().
 * @param {string} attachmentKey - The Zotero key of the attachment item (not its parent).
 * @returns {Promise<string>} - A temporary URL pointing at the attachment file.
 * @example
 * const { data: attachments } = await zoteroFetchAttachments(zotero, publicationKey);
 * const cover = attachments.find(a => a.contentType?.startsWith('image/'));
 * if (cover)
 * {
 *     const thumbnailUrl = await zoteroFetchAttachmentFileUrl(zotero, cover.key);
 *     // <img src={thumbnailUrl} />
 * }
 */
async function zoteroFetchAttachmentFileUrl(zotero, attachmentKey)
{
    // Ensure zotero client instance is provided
    if (!zotero)
    {
        throw new Error('Zotero API client is required');
    }

    // Ensure attachmentKey is provided
    if (typeof attachmentKey !== 'string' || !attachmentKey)
    {
        throw new Error('Zotero attachment key is required');
    }

    // Fetch the attachment's file URL
    const response = await zotero.items(attachmentKey).attachmentUrl().get();

    // The response data is the URL string
    return response.getData();
}

export {
    zoteroApiCreate,
    zoteroFetchCollections,
    zoteroFetchTopItems,
    zoteroFetchChildren,
    zoteroFetchAttachments,
    zoteroFetchLinkedUrls,
    zoteroFetchAttachmentFileUrl,
};
