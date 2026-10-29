/**
 * @module GitHubTypes
 * @description
 * This module contains the types used in the GitHub handling code.
 * 
 * The contents will be almost entirely TypeDoc comments, as the code is
 * mostly type definitions.
 */

/**
 * @typedef {Object} Organization
 * @property {string} login - The login name of the organization.
 * @property {number} id - The unique identifier of the organization.
 * @property {string} url - The URL of the organization.
 * @property {string} repos_url - The URL of the organization's repositories.
 * @property {string} name - The name of the organization.
 * @property {string} description - The description of the organization.
 * @property {string|null} company - The company of the organization, if any.
 * @property {string|null} blog - The blog of the organization, if any.
 * @property {string|null} location - The location of the organization, if any.
 * @property {string|null} twitter_username - The Twitter username of the organization, if any.
 * @property {string} email - The email of the organization.
 * @property {string} created_at - The date and time when the organization was created.
 * @property {string} updated_at - The date and time when the organization was last updated.
 * @property {number} public_repos - The number of public repositories owned by the organization.
 * @property {number} public_gists - The number of public gists owned by the organization.
 * @property {number} followers - The number of followers of the organization.
 * @property {number} following - The number of users followed by the organization.
 * @property {string} html_url - The URL of the organization's GitHub page.
 * @property {string} avatar_url - The URL of the organization's avatar image.
 */

/**
 * @typedef {Object} Repository
 * @property {string} name - The name of the repository.
 * @property {string} full_name - The full name of the repository.
 * @property {Organization} owner - The owner of the repository.
 * @property {Organization} organization - The organization of the repository.
 * @property {string} html_url - The URL of the repository.
 * @property {string} description - The description of the repository.
 * @property {boolean} fork - Whether the repository is a fork.
 * @property {string} url - The URL of the repository.
 * @property {string} forks_url - The URL of the repository's forks.
 * @property {string} branches_url - The URL of the repository's branches.
 * @property {string} tags_url - The URL of the repository's tags.
 * @property {string} commits_url - The URL of the repository's commits.
 * @property {string} issues_url - The URL of the repository's issues.
 * @property {string} pulls_url - The URL of the repository's pull requests.
 * @property {string} releases_url - The URL of the repository's releases.
 * @property {string} deployments_url - The URL of the repository's deployments.
 * @property {string} created_at - The date and time when the repository was created.
 * @property {string} updated_at - The date and time when the repository was last updated.
 * @property {string} pushed_at - The date and time when the repository was last pushed to.
 * @property {number} size - The size of the repository.
 * @property {number} forks - The number of forks of the repository.
 * @property {number} open_issues - The number of open issues in the repository.
 * @property {string} default_branch - The default branch of the repository.
 */


/**
 * @typedef {string} Sha
 * @description
 * A SHA256 hash. Primarily used to identify commits.
 */

/**
 * @typedef {Object} CommitId
 * @property {Sha} sha - The SHA of the commit.
 * @property {string} url - The URL of the commit.
 * @property {string|null} html_url - The HTML URL of the commit, if any.
 */

/**
 * @typedef {Object} CommitInfo
 * @property {Object} author - The author of the commit.
 * @property {string} author.name - The name of the author.
 * @property {string} author.email - The email of the author.
 * @property {string} author.date - The date of the commit.
 * @property {Object} committer - The committer of the commit.
 * @property {string} committer.name - The name of the committer.
 * @property {string} committer.email - The email of the committer.
 * @property {string} committer.date - The date of the commit.
 * @property {string} message - The commit message.
 * @property {CommitId} tree - The tree object of the commit. (sha, url)
 * @property {string} url - The URL of the commit.
 * @property {number} comment_count - The number of comments on the commit.
 * @property {Object} verification - The verification status of the commit.
 * @property {boolean} verification.verified - Whether the commit is verified.
 * @property {string} verification.reason - The reason for the verification status.
 * /

/**
 * @typedef {Object} Branch
 * @property {string} name - The name of the branch.
 * @property {CommitId} commit - The commit object of the branch. (sha, url, html_url)
 * @property {boolean} protected - Whether the branch is protected.
 */

/**
 * @typedef {Object} Commit
 * @property {Sha} sha - The SHA of the commit.
 * @property {string} node_id - The node ID of the commit.
 * @property {CommitInfo} commit - The metadata of the commit.
 * @property {string} url - The URL of the commit.
 * @property {string} html_url - The HTML URL of the commit.
 * @property {User} author - The author of the commit.
 * @property {User} committer - The committer of the commit.
 * @property {CommitId[]} parents - The parent commits of the commit.
 */
