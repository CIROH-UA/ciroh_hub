
/**
 * @typedef {Object} LinkHeaderData
 * @property {string} base_link - The base link URL.
 * @property {number} per_page - The number of items per page.
 * @property {Object<string, number>} pages - An object containing the page numbers for each rel type.
 * @description
 * Represents the parsed data from the Link header.
 */

/**
 * @name getLinkHeaderPairs
 * @param {string} linkHeader - The Link header string from the response.
 * @returns {Object<string, string>} - An object containing the key-value pairs of the Link header.
 * @description
 * Parses the Link header string to extract pagination URLs and metadata.
 * @throws {Error} If the Link header is not found or if there is an error in parsing.
 */
function getLinkHeaderPairs(linkHeader) {
    if (!linkHeader) {
        throw new Error(`Link header not found: ${linkHeader}`);
    }

    var link_obj = {};
    const regex = /<([^>]+)>;\s*rel="([^"]+)"/g;
    var matches = linkHeader.matchAll(regex);
    for (const match of matches) {
        const url = match[1];
        const rel = match[2];
        link_obj[rel] = url;
    }
    return link_obj;
}

/**
 * @name getLinkHeaderBaseLink
 * @param {string[]} link_array - The links from the Link header.
 * @returns {[string, string]} - The base link and the per_page value.
 * @description
 * Extracts the base link URL from the links.
 * @throws {Error} If the base link is not found, the links are inconsistent, or if there is an error in parsing.
 */
function getLinkHeaderBaseLink(link_array) {
    const get_base = (url) => {
        const [base, options] = url.split("?");
        const params = new URLSearchParams(options);
        const per_page = params.get("per_page");
        return [base, per_page];
    }
    var [base, per_page] = get_base(link_array[0]);

    for (let i = 1; i < link_array.length; i++) {
        const [baseurl, per_page2] = get_base(link_array[i]);
        if (baseurl !== base) {
            throw new Error(`Base links inconsistent: ${base} and ${baseurl}`);
        }
        if (per_page2 !== per_page) {
            throw new Error(`Per page inconsistent: ${per_page} and ${per_page2}`);
        }
    }
    return [base, per_page];
}

/**
 * @name buildLinkData
 * @param {Object<string, string>} link_object
 * @returns {LinkHeaderData}
 * @description
 * Builds the LinkHeaderData object from the links.
 */
function buildLinkData(link_object) {
    const link_array = Object.values(link_object);
    const [base, per_page] = getLinkHeaderBaseLink(link_array);
    const pages = {};
    for (const [rel, url] of Object.entries(link_object)) {
        const page = new URL(url).searchParams.get("page");
        if (page) {
            pages[rel] = parseInt(page, 10);
        }
        else {
            pages[rel] = null;
            console.warn(`Page not found in URL: ${url}`);
        }
    }
    return {
        base_link: base,
        per_page: per_page ? parseInt(per_page, 10) : null,
        pages: pages,
    };
}

/**
 * @name getLinkHeaderData
 * @param {Response|string} input - A `Response` object or a `Link` header string.
 * @returns {LinkHeaderData} - An object containing the base link, per_page value, and structured pagination data.
 * @description
 * Parses the `Link` header from a `Response` object or a string to extract pagination URLs and metadata.
 */
function getLinkHeaderData(input) {
    let linkHeader;

    // Determine if the input is a Response object or a string
    if (input instanceof Response) {
        linkHeader = input.headers.get("Link");
        if (!linkHeader) {
            throw new Error("Link header not found in the Response object.");
        }
    } else if (typeof input === "string") {
        linkHeader = input;
    } else {
        throw new Error("Invalid input: Expected a Response object or a Link header string.");
    }

    const links = getLinkHeaderPairs(linkHeader);
    return buildLinkData(links);
}

export { getLinkHeaderData };
export default getLinkHeaderData;

