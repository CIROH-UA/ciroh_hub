// Repository API 
// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28

// import the types from GitHubTypes.js

/**
 * @import * from './GitHubTypes.js';
 * @description
 * Importing the types from GitHubTypes.js to use in this file.
 */

/**
 * @import { RateLimitData } from '../Archived/Login/RateLimitError.js';
 */

import { RateLimitError } from '../Archived/Login/RateLimitError.js';
import { getLinkHeaderData } from '../Archived/Login/LinkHeaders.js';
import { useState } from 'react';

const base_url = "https://api.github.com";
const org_url = base_url + "/orgs/";
const repo_url = base_url + "/repos/";
const user_url = base_url + "/users/";

// /**
//  * @name getRateLimitStatus
//  * @description
//  * Fetches the rate limit status from GitHub API. 
//  * Uses time based caching to avoid hitting the API too often.
//  * @returns {RateLimitStatus}
//  * @throws {Error} If the rate limit status is not found or if there is an error in the request.
//  */
// async function getRateLimitStatus() {
//     const now = new Date();
//     var response = null;
//     if (Object.hasOwn(getRateLimitStatus, "last_call")) {
//         const diff = now - getRateLimitStatus.last_call;
//         if (diff < 10 * 1000) { // 10 seconds
//             response = getRateLimitStatus.last_response;
//         }
//     }
//     if (!response) {
//         const url = base_url + "/rate_limit";
//         response = await fetch(url);
//         getRateLimitStatus.last_call = now;
//         getRateLimitStatus.last_response = response;
//     }
//     if (!response.ok) {
//         throw new Error(`Rate limit status not found: ${response.statusText}`);
//     }
//     const data = await response.json();
//     return data;
// }
/**
 * @name getRateLimitStatus
 * @description
 * Fetches the rate limit without spending requests.
 * Querying the rate limit does not count against the rate limit.
 * @returns {RateLimitError}
 * @throws {Error} If the rate limit status is not found or if there is an error in the request.
 * @throws {RateLimitError} If the rate limit is exhausted.
 */
async function getRateLimitStatus() {
    const url = base_url + "/rate_limit";
    const conf = {
        method: "GET",
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
            "accept": "application/vnd.github.v3+json",
        },
    };
    const response = await fetch(url, conf);
    if (!response.ok) {
        throw new Error(`Rate limit status not found: ${response.statusText}`);
    }
    const data = RateLimitError.getRateLimitDataFromRateLimitResponseData(await response.json());
    return new RateLimitError(data, "Rate limit status");
}

let lastRateLimitData = null;

/**
 * @name safeGitHubFetch
 * @param {string} resource - The resource to fetch.
 * @param {Object} [options={}] - The options for the fetch request.
 * @returns {Promise<Response>} - The response object.
 * @description
 * Fetches the URL with the given configuration.
 * Prevents querying the API when the rate limit is exhausted.
 * Uses the RateLimitError class to get rate limit data and update the lastRateLimitData state.
 * Then uses the lastRateLimitData to determine if the rate limit is exhausted or not without querying the API.
 * @throws {RateLimitError} If the rate limit is exhausted.
 */
async function safeGitHubFetch(resource, options = {}) {
    if (!lastRateLimitData) {
        lastRateLimitData = await getRateLimitStatus();
    }
    // If the last rate limit data is not null, check if we are rate limited
    if (lastRateLimitData) {
        const limit_data = lastRateLimitData.limit_data;
        if (limit_data.exhausted) {
            console.log("Rate limit exists and is exhausted.")
            const timeLeft = lastRateLimitData.timeLeft();
            console.log("Time left: " + timeLeft);
            if (timeLeft > 0) {
                // throw new RateLimitError(limit_data);
                // Why make new object if we can use the old one?
                throw lastRateLimitData;
            }
        }
    }
    const response = await fetch(resource, options);
    if (RateLimitError.responseHasRateLimitData(response)) {
        const limit_error = new RateLimitError(response, `Targeted resource: ${resource}`);
        // setLastRateLimitData(limit_error);
        lastRateLimitData = limit_error;
        if (limit_error.isError()) {
            throw limit_error;
        }
    }
    return response;
}


/**
 * @name getPaginatedRequest
 * @param {string} url - The base URL to fetch.
 * @param {number} [page=1] - The page number to fetch.
 * @param {number} [per_page=100] - The number of items per page.
 * @param {Object} [params={}] - Additional query parameters to include in the request.
 * @returns {[string, Object]} - The full URL and the request configuration.
 * @description
 * Generates a paginated request for the GitHub API using URLSearchParams for query parameter handling.
 */
function getPaginatedRequest(url, page = 1, per_page = 100, params = {}) {
    const headers = {
        "X-GitHub-Api-Version": "2022-11-28",
        "accept": "application/vnd.github.v3+json",
    };
    const conf = {
        method: "GET",
        headers: headers,
    };

    // Use URLSearchParams to construct the query string
    const queryParams = new URLSearchParams({
        ...params,
        per_page: per_page,
        page: page,
    });

    // Append the query string to the base URL
    const fullUrl = `${url}?${queryParams.toString()}`;

    return [fullUrl, conf];
}

/**
 * @name tryGetItemCount
 * @param {string} baseUrl - The base URL to fetch.
 * @param {Object} [queryParams={}] - Additional query parameters to include in the request.
 * @returns {number} - The total number of items.
 */
async function tryGetItemCount(baseUrl, queryParams = {}) {
    // Use the getPaginatedRequest function to construct the URL and configuration
    const [url, conf] = getPaginatedRequest(baseUrl, 1, 1, queryParams);
    // Fetch the first page of results
    const response = await safeGitHubFetch(url, conf);
    if (!response.ok) {
        if (RateLimitError.isRateLimitError(response)) {
            throw new RateLimitError(response);
        }
        throw new Error(`Item count not found: ${response.statusText}`);
    }
    const linkData = getLinkHeaderData(response);
    if (linkData.per_page === null) {
        throw new Error(`Per page not found: ${linkData.per_page}`);
    }
    else if (linkData.per_page !== 1) {
        throw new Error(`Per page not 1: ${linkData.per_page}`);
    }
    // linkData.pages.last is the number of the last page
    const lastPage = linkData.pages.last;
    if (lastPage === null) {
        throw new Error(`Last page not found: ${linkData.pages}`);
    }
    return lastPage;
}

/**
 * @name tryGetOrganization
 * @param {string} organization_name
 * @returns {Organization}
 * @description
 * Fetches the organization data from GitHub API. Blocks until the data is received.
 * @throws {Error} If the organization is not found or if there is an error in the request.
 */
async function tryGetOrganization(organization_name) {
    const url = org_url + organization_name;
    const response = await safeGitHubFetch(url);
    if (!response.ok) {
        if (RateLimitError.isRateLimitError(response)) {
            throw new RateLimitError(response);
        }
        throw new Error(`Organization not found: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}


/**
 * @name tryGetRepository
 * @param {string} organization_name
 * @param {string} repo_name
 * @returns {Repository}
 * @description
 * Fetches the repository data from GitHub API. Blocks until the data is received.
 */
async function tryGetRepository(organization_name, repo_name) {
    const url = repo_url + organization_name + "/" + repo_name;
    const response = await safeGitHubFetch(url);
    const data = await response.json();
    if (!response.ok) {
        if (RateLimitError.isRateLimitError(response)) {
            throw new RateLimitError(response);
        }
        return null;
    }
    // const data = await response.json();
    return data;
}

/**
 * @name tryGetRepositoryNumber
 * @param {string} organization_name
 * @returns {number}
 * @description
 * Fetches the number of repositories of the organization from GitHub API. Blocks until the data is received.
 * @throws {Error} If the organization is not found or if there is an error in the request.
 */
async function tryGetRepositoryNumber(organization_name) {
    // Create the base URL
    var url = org_url + organization_name + "/repos";
    // Use the getItemCount function to get the total number of repositories
    const count = await tryGetItemCount(url);
    return count;
}


/**
 * @param {string} organization_name
 * @param {number} max_count - The maximum number of repositories to fetch.
 * @default 100
 * @returns {Repository[]}
 * @description
 * Fetches the repositories of the organization from GitHub API. Blocks until the data is received.
 * @throws {Error} If the organization is not found or if there is an error in the request.
 */
async function tryListRepositories(organization_name, max_count = 100) {
    // Have to use same method as tryGetCommits
    if (max_count == -1) {
        max_count = await tryGetRepositoryNumber(organization_name);
        // console.log("Max count: " + max_count);
    }
    var url = org_url + organization_name + "/repos";
    var req = getPaginatedRequest(url, 1, max_count);
    url = req[0];
    var conf = req[1];
    const response = await safeGitHubFetch(url, conf);
    if (!response.ok) {
        if (RateLimitError.isRateLimitError(response)) {
            throw new RateLimitError(response);
        }
        throw new Error(`Repositories not found: ${response.statusText}`);
    }
    const data = await response.json();
    // should be the desired array
    return data;
}


/**
 * @param {Repository} repo
 * @returns {Branch[]}
 * @description
 * Fetches the branches of the repository from GitHub API. Blocks until the data is received.
 * @throws {Error} If the repository is not found or if there is an error in the request.
 */
async function tryGetBranches(repo) {
    const url = repo["branches_url"].replace("{/branch}", "");
    const response = await safeGitHubFetch(url);
    if (!response.ok) {
        if (RateLimitError.isRateLimitError(response)) {
            throw new RateLimitError(response);
        }
        throw new Error(`Branches not found: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * @param {Branch} branch
 * @param {string|Sha|null} sha - Sha or branch name to start listing commits from.
 * @default Repository.default_branch
 * @param {number} per_page - The number of commits to fetch per page.
 * @default 100
 * @param {number} page - The page number to fetch.
 * @default 1
 * @returns {Commit[]}
 * @description
 * Fetches the commits of the branch from GitHub API. Blocks until the data is received.
 * @throws {Error} If the branch is not found or if there is an error in the request.
 */
async function tryGetCommits(branch, start = null, per_page = 100, page = 1) {
    var url = branch["commit"]["url"]; // repo/commits/sha
    url = url.replace(/\/commits\/.*/, "/commits");
    var insert = "sha=";
    if (start) {
        insert += start;
    }
    else {
        insert += branch["name"];
    }
    const req = getPaginatedRequest(url, page, per_page, insert);
    url = req[0];
    const conf = req[1];

    const response = await safeGitHubFetch(url, conf);
    if (!response.ok) {
        if (RateLimitError.isRateLimitError(response)) {
            throw new RateLimitError(response);
        }
        throw new Error(`Commits not found: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * @param {Branch} branch
 * @param {string|Sha|null} start - Sha or branch name to start listing commits from.
 * @returns {number}
 * @description
 * Fetches the number of commits in the branch from GitHub API. Blocks until the data is received.
 * @throws {Error} If the branch is not found or if there is an error in the request.
 */
async function tryGetCommitCount(branch, start = null) {
    var url = branch["commit"]["url"]; // repo/commits/sha
    url = url.replace(/\/commits\/.*/, "/commits");
    const sha = start ? start : branch["name"];
    const count = await tryGetItemCount(url, { sha: sha });
    return count;
}

/**
 * @name tryGetCommit
 * @param {Repository} repo
 * @param {string} branch - The name of the branch.
 * @param {string|Sha|null} sha - The SHA of the commit, if any.
 * @returns {Commit}
 * @description
 * Fetches the commit data from GitHub API. Blocks until the data is received.
 * @throws {Error} If the commit is not found or if there is an error in the request.
 */
async function tryGetCommit(repo, branch, sha = null) {
    var url = repo["commits_url"].replace("{/sha}", "");
    if (sha) {
        url += "/" + sha;
    }
    else {
        url += "/" + branch["commit"]["sha"];
    }
    const response = await safeGitHubFetch(url);
    if (!response.ok) {
        if (RateLimitError.isRateLimitError(response)) {
            throw new RateLimitError(response);
        }
        throw new Error(`Commit not found: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

/**
 * @name tryGetRepositoryWorkflows
 * @param {Repository} repo
 * @description
 * Fetches the workflows of the repository from GitHub API. Blocks until the data is received.
 * @throws {Error} If the workflows are not found or if there is an error in the request.
 * @returns {Workflow[]}
 */
async function tryGetRepositoryWorkflows(repo) {
    const url = repo["url"] + "/actions/workflows";
    const response = await safeGitHubFetch(url);
    if (!response.ok) {
        if (RateLimitError.isRateLimitError(response)) {
            throw new RateLimitError(response);
        }
        throw new Error(`Workflows not found: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

export var RepoCache = {}
/**
 * @name tryCacheOrgRepos
 * @param {string} organization_name
 * @param {number} max_count - The maximum number of repositories to fetch.
 * @default -1
 * @description
 * Fetches the repository data from GitHub API. Blocks until the data is received.
 * Uses a cache to avoid hitting the API too often.
 */
async function tryCacheOrgRepos(organization_name, max_count = 400) {
    if (typeof RepoCache[organization_name] === "object") {
        return RepoCache[organization_name];
    }
    const repos = await tryListRepositories(organization_name, max_count);
    RepoCache[organization_name] = {};
    for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        RepoCache[organization_name][repo["name"]] = repo;
    }
    return RepoCache[organization_name];
}

/**
 * @name tryGetCachedRepository
 * @param {string} organization_name
 * @param {string} repo_name
 * @description
 * Fetches the repository data from the cache. Blocks until the data is received.
 * Uses a cache to avoid hitting the API too often.
 */
async function tryGetCachedRepository(organization_name, repo_name) {
    if (RepoCache[organization_name]) {
        if (RepoCache[organization_name][repo_name]) {
            return RepoCache[organization_name][repo_name];
        }
        else {
            const old_repos = RepoCache[organization_name];
            RepoCache[organization_name] = null;
            await tryCacheOrgRepos(organization_name);
            for (let i = 0; i < old_repos.length; i++) {
                const repo = old_repos[i];
                if (RepoCache[organization_name][repo["name"]]) {
                    continue;
                }
                RepoCache[organization_name][repo["name"]] = repo;
            }
            return RepoCache[organization_name][repo_name];
        }
    }
    const repos = await tryCacheOrgRepos(organization_name);
    return repos[repo_name];
}

var OrgCache = {}
/**
 * @name tryGetCachedOrganization
 * @param {string} organization_name
 * @description
 * Fetches the organization data from the cache. Blocks until the data is received.
 * Uses a cache to avoid hitting the API too often.
 */
async function tryGetCachedOrganization(organization_name) {
    if (OrgCache[organization_name]) {
        return OrgCache[organization_name];
    }
    const org = await tryGetOrganization(organization_name);
    OrgCache[organization_name] = org;
    return org;
}

var RepoWorkflowCache = {}
/**
 * @name tryGetCachedRepositoryWorkflows
 * @param {string} organization_name
 * @param {string} repo_name
 * @description
 * Fetches the workflows of the repository from the cache. Blocks until the data is received.
 * Uses a cache to avoid hitting the API too often.
 */
async function tryGetCachedRepositoryWorkflows(organization_name, repo_name) {
    if (RepoWorkflowCache[organization_name] && RepoWorkflowCache[organization_name][repo_name]) {
        return RepoWorkflowCache[organization_name][repo_name];
    }
    const repo = await tryGetCachedRepository(organization_name, repo_name);
    if (!repo) {
        console.log("Repo not found: " + repo_name);
    }
    const workflows = await tryGetRepositoryWorkflows(repo);
    if (!RepoWorkflowCache[organization_name]) {
        RepoWorkflowCache[organization_name] = {};
    }
    RepoWorkflowCache[organization_name][repo_name] = workflows;
    return workflows;
}



export {
    getRateLimitStatus,
    tryGetOrganization,
    tryGetRepository,
    tryListRepositories,
    tryGetBranches,
    tryGetCommits,
    tryGetCommitCount,
    tryGetCommit,
    tryGetRepositoryWorkflows,
    tryGetCachedRepository,
    tryCacheOrgRepos,
    tryGetCachedOrganization,
    tryGetCachedRepositoryWorkflows
};