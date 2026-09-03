import React, { useEffect, useState } from 'react';

/**
 * JSX Markdown components are imported through the following method:
 * (Where:
 * - `[componentName]` is the name of the component you want to import
 * - `[componentFileName]` is the name of the file where the component is defined WITHOUT the `.js` extension
 * - `[kwargs]` is replaced by the keyword arguments of the component in the form `key1="value1" key2="value2" ...`
 * )
 * ```javascript
 * import { [componentName] } from `@site/src/components/[componentFileName]`;
 * 
 * <[componentName] [kwargs] />
 * ```
 * 
 * The only thing to do on this end is to ensure that the component is exported at the end with:
 * ```javascript
 * export default [componentName];
 * ```
 */
const help = null; // help keyword in the code can be moused over to see the above explanation

import { tryGetOrganization, tryListRepositories, tryGetRepositoryWorkflows, tryGetRepository, getRateLimitStatus, tryGetCachedRepository, tryCacheOrgRepos } from './AccessUtils';
import { AccessConfig } from './AccessConfig';
import Link from '@docusaurus/Link';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Details from '@theme/Details';
import { use } from 'react';
// making a test component to check if the import and github API both work

function IntroDiv() {
    // Short introduction to the page.
    // Show the list of relevant repositories' names.
    // Further details will be given in further sections.
    var repo_names = AccessConfig.target_repo_names;
    var org_names = AccessConfig.target_org_names;
    var intro_paragraph = "This page contains the list of Community NextGen related repositories that CIROH is maintaining."
    // var org_desc = "All repositories originate from the NOAA-OWP organization, but the ones CIROH has taken ownership of can be found as forks in the CIROH-UA organization."
    var org_desc = "Some repositories originate from the NOAA-OWP organization, but are now forks and maintained by CIROH."
    // var repo_desc = "The repositories are as follows:"
    // var repo_list = repo_names.map((repo) => {
    //     return <li key={repo}>{repo}</li>;
    // });
    var repo_desc = null;
    var repo_list = null;
    return (
        <div style={{ border: '1px solid black', padding: '10px', margin: '10px' }}>
            <h2>Introduction</h2>
            <p>{intro_paragraph}</p>
            <p>{org_desc}</p>
            <p>{repo_desc}</p>
            <ul>
                {repo_list}
            </ul>
        </div>
    );
}

/**
 * @param {Organization} organization
 * @param {Repository[]} repositories
 * @description
 * This function takes an organization and a list of repositories
 * and returns a list of repositories that are relevant to CIROH.
 * The list is displayed in a vertical manner.
 * Each repository is displayed in a div with a visible border.
 * The divs are arranged vertically.
 * @returns {JSX.Element}
 * @throws {Error} If the organization is not found or if there is an error in the request.
 */
function RepoListSection(organization, repositories) {
    // List of repositories in the organization
    // that are relevant to CIROH
    const repo_names = AccessConfig.target_repo_names;
    const org_name = organization.login;
    const org_desc = organization.description;
    const org_url = organization.html_url;
    const org_avatar = organization.avatar_url;
    const filter_repos = (repositories) => {
        // console.log("Repositories: ", repositories);
        // console.log("Type of repositories: ", typeof repositories);
        var filtered_repos = [];
        repositories.forEach((repo) => {
            if (repo_names.includes(repo.name)) {
                filtered_repos.push(repo);
            }
        });
        return filtered_repos;
    }
    const total_repos = repositories.length;
    // const org_repos = repositories.filter(repo => repo_names.includes(repo.name));
    const org_repos = filter_repos(repositories);

    const repo_div = (repo) => {
        return (
            <div key={repo.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                <h3>{repo.name}</h3>
                <p>{repo.description}</p>
                <Link href={repo.html_url} target="_blank" rel="noopener noreferrer">View Repository</Link>
            </div>
        );
    }
    const repo_list = org_repos.map((repo) => {
        return repo_div(repo);
    });
    const number_of_repos = org_repos.length;
    const repo_list_header = number_of_repos > 0 ? <h3>Repositories from this organization:</h3> : <h3>No repositories found in this organization.</h3>;
    const repo_list_div = <div>{repo_list_header}{repo_list}</div>;
    var repo_list_section_key = `repo_list_section_${org_name}`;
    for (var i = 0; i < repo_names.length; i++) {
        repo_list_section_key += `_${repo_names[i]}`;
    }
    return (
        <div style={{ border: '2px solid black', padding: '20px' }} key={repo_list_section_key}>
            <h2>{org_name}</h2>
            <p>{org_desc}</p>
            <p><img src={org_avatar} alt="Organization Avatar" style={{ width: '100px', height: '100px' }} /></p>
            <Link href={org_url} target="_blank" rel="noopener noreferrer">View Organization</Link>
            {/* <p>Repositories from this organization:</p> */}
            {repo_list_div}
        </div>
    );
}

/**
 * @name OrgInfoDiv
 * @param {Organization} organization
 * @param {string} [padding] - optional, default null
 * @description
 * This function takes an organization and returns a HTML element
 * that displays the organization information.
 * @returns {JSX.Element}
 */
function OrgInfoDiv(organization, padding = null) {
    // Organization information
    const org_name = organization.login;
    const org_desc = organization.description;
    const org_url = organization.html_url;
    const org_avatar = organization.avatar_url;
    var outer_style = {
        border: '1px solid black',
    }
    outer_style.padding = (padding) ? padding : '3px';
    return (
        <div style={outer_style}>
            <h2>{org_name}</h2>
            <p>{org_desc}</p>
            <p><img src={org_avatar} alt="Organization Avatar" style={{ width: '100px', height: '100px' }} /></p>
            <Link href={org_url} target="_blank" rel="noopener noreferrer">View Organization</Link>
        </div>
    );
}

/**
 * @name RepoInfoDiv
 * @param {Repository} repository
 * @param {string} [padding] - optional, default null
 * @description
 * This function takes a repository and returns a HTML element
 * that displays the repository information.
 * @returns {JSX.Element}
 */
function RepoInfoDiv(repository, padding = null) {
    // Repository information
    const repo_name = repository.name;
    const repo_desc = repository.description;
    const repo_url = repository.html_url;
    var outer_style = {
        border: '1px solid black',
    }
    outer_style.padding = (padding) ? padding : '3px';
    return (
        <div style={outer_style} key={repo_name}>
            <h2>{repo_name}</h2>
            <p>{repo_desc}</p>
            <Link href={repo_url} target="_blank" rel="noopener noreferrer">View Repository</Link>
        </div>
    );
}

/**
 * @name RepoDiv
 * @description
 * This function takes a repository's name and org and returns a HTML element
 * that displays the repository information.
 * @param {Object} props
 * @param {string} props.org_name - The name of the organization.
 * @param {string} props.repo_name - The name of the repository.
 * @param {string} [padding] - The padding of the element. Default is null.
 * @returns {JSX.Element}
 */
function RepoDiv({ org_name, repo_name, padding = null }) {
    // Repository information
    const [loading, setLoading] = useState(true);
    const [repoData, setRepoData] = useState(null);
    useEffect(() => {
        async function fetchData() {
            try {
                const data = await tryGetCachedRepository(org_name, repo_name);
                setRepoData(data);
            } catch (error) {
                console.error('Error fetching repository data:', error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [org_name, repo_name]);
    if (loading) {
        return <div>Loading...</div>;
    }
    else {
        return RepoInfoDiv(repoData, padding);
    }
}

function getChildren(elem) {
    if (!elem.props) {
        throw new Error("Element has no props");
    }
    if (!elem.props.children) {
        return [];
    }
    if (Array.isArray(elem.props.children)) {
        return elem.props.children;
    }
    if (typeof elem.props.children === 'object') {
        return [elem.props.children];
    }
    return [];
}

/**
 * @name RepoListSectionElement
 * @description
 * This function is intended to be imported and used as an HTML element.
 * As such, the arguments are strings rather than objects.
 * @param {Object} props
 * @param {string} props.org_name - The name of the organization.
 * @param {string} props.repo_list - The list of repositories in the organization.
 * @param {string} [props.padding] - The padding of the element. Default is null.
 * @param {string} [props.innerPadding] - The inner padding of the element. Default is null.
 * @returns {JSX.Element}
 */
export function RepoListSectionElement({ org_name, repo_list, padding = null, innerPadding = null }) {
    if (!org_name) {
        throw new Error('Organization name is required' + ` Provided props were: ${JSON.stringify({ org_name, repo_list })}`);
    }
    if (!repo_list) {
        throw new Error('Repository list is required' + ` Provided props were: ${JSON.stringify({ org_name, repo_list })}`);
    }
    // Display the provided list of repositories in a vertical manner.
    // Need states for:
    // - loading
    // - organization data (organization name, description, avatar, url)
    // - repositories (repository name, description, avatar, url)
    const [loading, setLoading] = useState(true);
    const [orgData, setOrgData] = useState(null);
    const [orgRepositories, setRepositories] = useState([]);
    const [repoData, setRepoData] = useState(null);
    // repo_list is a string that contains the list of repositories.
    // we should use regex to parse possible list formats.
    const list_delimiter = /[\s,]+/;
    const repo_list_array = repo_list.split(list_delimiter);
    const repo_list_set = new Set(repo_list_array);

    var inner_style = {
        border: '1px solid var(--ifm-color-emphasis-500)',
        borderRadius: '25px',
        padding: '22px',
        marginBottom: '20px',
        backgroundColor: 'var(--ifm-background-color)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
    }
    // inner_style.padding = (innerPadding) ? innerPadding : '3px';
    // var outer_style = {
    //     border: '1px solid black',
    // }
    // outer_style.padding = (padding) ? padding : '3px';
    // useEffect(() => {
    //     async function fetchData() {
    //         try {
    //             const data = await tryGetOrganization(org_name);
    //             setOrgData(data);
    //         } catch (error) {
    //             console.error('Error fetching organization data:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    //     fetchData();
    // }, [org_name]);
    inner_style.padding = (innerPadding) ? innerPadding : '22px';

    useEffect(() => {
        async function getRepositories() {
            try {
                const repos = await tryListRepositories(org_name);
                setRepositories(repos);
            } catch (error) {
                console.error('Error fetching repositories:', error);
            } finally {
                setLoading(false);
            }
        }
        getRepositories();
    }, [org_name]);
    useEffect(() => {
        async function filterRepositories() {
            if (!orgRepositories || !Array.isArray(orgRepositories)) {
                // orgRepositories not ready yet
                return;
            }
            try {
                const repos = orgRepositories;
                var repo_data_obj = {};
                for (const repo of repos) {
                    if (repo_list_set.has(repo.name)) {
                        repo_data_obj[repo.name] = repo;
                    }
                }
                // console.log("Filtered repositories: ", repo_obj)
                setRepoData(repo_data_obj);

            } catch (error) {
                console.error('Error filtering repositories:', error);
            } finally {
                setLoading(false);
            }
        }
        filterRepositories();
    }, [orgRepositories, repo_list]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!repoData) {
        return <div>Error loading repositories</div>;
    }

    const repositories = Object.values(repoData);
    const repo_li_s = repositories.map(repo => (
        <li key={repo.name} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <div style={inner_style}>
                <h2 style={{ marginTop: 0, color: 'var(--ifm-color-primary)', fontSize: '1.5rem' }}>{repo.name}</h2>
                <p style={{ color: 'var(--ifm-color-emphasis-900)', marginBottom: '15px' }}>{repo.description}</p>
                <Link 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-block',
                        padding: '6px 18px',
                        backgroundColor: '#19A7CE',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '11px',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#217a96'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#19A7CE'}
                >
                    View Repository
                </Link>
            </div>
        </li>
    ));

    return (
        <div key={`${org_name}_${repo_list}`}>
            <ul style={{ margin: 0, padding: 0 }}>
                {repo_li_s}
            </ul>
        </div>
    );
}

/**
 * @name RepoWorkflowsSection
 * @param {Repository} repository
 * @param {Workflow[]} workflows
 * @description
 * This function takes a repository and a list of workflows
 * and returns a HTML element that displays the workflows
 * of the repository.
 * The workflows are displayed in a vertical manner.
 * @returns {JSX.Element}
 */
function RepoWorkflowsSection(repository, workflows_0) {
    var workflows = workflows_0;
    if (!Array.isArray(workflows)) {
        workflows = Array.of(...workflows_0);
    }
    // List of workflows in the repository
    // console.log("Repository: ", repository);
    const repo_name = repository.name;
    const repo_desc = repository.description;
    const repo_url = repository.html_url;
    const repo_avatar = repository.owner.avatar_url;
    const repo_workflow_contents = (workflow) => {
        var result = [];
        result.push(<h3>{workflow.name}</h3>);
        result.push(<p>{workflow.description}</p>);
        result.push(<Link to={workflow.html_url} target="_blank" rel="noopener noreferrer">
            <img src={workflow.badge_url} alt="Workflow Badge" />
        </Link>);
        if (workflow.state === "active") {
            result.push(<p style={{ color: 'green' }}>Active</p>);
        }
        else {
            result.push(<p style={{ color: 'red' }}>Inactive</p>);
        }
        result.push(<p>Created at: {new Date(workflow.created_at).toLocaleString()}</p>);
        result.push(<p>Updated at: {new Date(workflow.updated_at).toLocaleString()}</p>);
        result.push(<Link href={workflow.html_url} target="_blank" rel="noopener noreferrer">View Workflow</Link>);
        return result;
    }

    const repo_workflow_listitem = (workflow) => {
        return (
            <li key={workflow.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                {repo_workflow_contents(workflow)}
            </li>
        );
    }
    const repo_workflow_divitem = (workflow) => {
        return (
            <div key={workflow.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                {repo_workflow_contents(workflow)}
            </div>
        );
    }

    // const workflow_list = workflows.map((workflow) => {
    //     return (
    //         <div key={workflow.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
    //             <h3>{workflow.name}</h3>
    //             <p>{workflow.description}</p>
    //             <Link href={workflow.html_url} target="_blank" rel="noopener noreferrer">View Workflow</Link>
    //         </div>
    //     );
    // });
    const workflow_list = workflows.map(repo_workflow_listitem);
    var workflows_div_interior = (<div>No workflows found for this repository.</div>);
    if (workflow_list.length > 0) {
        workflows_div_interior = (
            <div>
                <h3>Workflows:</h3>
                <ul>
                    {workflow_list}
                </ul>
            </div>
        )
        // workflows_div_interior = (
        //     <Details summary="Workflows" open>
        //         <h3>Workflows:</h3>
        //         {workflow_list}
        //     </Details>
        // );
    }
    const workflows_div = <Details summary="Workflows">{workflows_div_interior}</Details>;
    return (
        <div style={{ border: '2px solid black', padding: '20px' }}>
            <h2>{repo_name}</h2>
            <p>{repo_desc}</p>
            <p><img src={repo_avatar} alt="Repository Avatar" style={{ width: '100px', height: '100px' }} /></p>
            <Link href={repo_url} target="_blank" rel="noopener noreferrer">View Repository</Link>

            {workflows_div}
        </div>
    );
}

/**
 * @name RateLimitStatusMessage
 * @param {string} message 
 * @param {number} rate_limit_max 
 * @param {number} rate_limit_remaining 
 * @param {number} rate_limit_spent 
 * @param {number} rate_limit_reset 
 * @description
 * This function takes a message and the rate limit status
 * and returns a HTML element that displays the rate limit status.
 * @returns {JSX.Element}
 */
function RateLimitStatusMessage(message, rate_limit_max, rate_limit_remaining, rate_limit_spent, rate_limit_reset) {
    // Rate limit status message
    var status_parts = [];
    if (rate_limit_max > 0) {
        status_parts.push(<div>Rate limit max: {rate_limit_max}</div>);
    }
    if (rate_limit_remaining > 0) {
        status_parts.push(<div>Rate limit remaining: {rate_limit_remaining}</div>);
    }
    if (rate_limit_spent > 0) {
        status_parts.push(<div>Rate limit spent: {rate_limit_spent}</div>);
    }
    if (rate_limit_reset > 0) {
        status_parts.push(<div>Rate limit reset: {new Date(rate_limit_reset * 1000).toLocaleString()}</div>);
    }
    return (
        <div style={{ border: '2px solid black', padding: '20px' }}>
            <h2>{message}</h2>
            {status_parts}
        </div>
    );

}

/**
 * @name AdjustSemaphore
 * @param {number} semaphore
 * @param {function} setter
 * @param {number} value - optional, default is 1
 * @description
 * This function takes a semaphore and a setter function
 * and sets the semaphore to an adjusted value.
 */
function AdjustSemaphore(semaphore, setter, value = null) {
    if (value === null) {
        value = 1;
    }
    if (semaphore === undefined || semaphore === null) {
        console.error("Semaphore is undefined or null");
        return;
    }
    if (value === undefined || value === null) {
        console.error("Value is undefined or null");
        return;
    }
    setter(semaphore + value);
}

export function GitHubDashboard() {

    // const [loading, setLoading] = useState(true);
    // Emulate a semaphore with the loading state to ensure all requests are finished before displaying the data
    const [doneLoading, setDoneLoading] = useState(0);
    const [startedLoading, setStartedLoading] = useState(0);
    const [loading, setLoading] = useState(0);
    const [errors, setErrors] = useState(0);

    const [orgData, setOrgData] = useState(null);
    const [repositories, setRepositories] = useState([]);

    const [noaa_org_data, setNOAAOrgData] = useState(null);
    const [noaa_org_repos, setNOAAOrgRepos] = useState([]);
    const [ciroh_org_data, setCIROHOrgData] = useState(null);
    const [ciroh_org_repos, setCIROHOrgRepos] = useState([]);
    const [awi_org_data, setAWIOrgData] = useState(null);
    const [awi_org_repos, setAWIOrgRepos] = useState([]);

    const [actions_repos_list, setActionsReposList] = useState([]);
    const [actions_workflows_map, setActionsWorkflowsMap] = useState({});

    const [rate_limit_max, setRateLimitMax] = useState(-1);
    const [rate_limit_remaining, setRateLimitRemaining] = useState(-1);
    const [rate_limit_spent, setRateLimitSpent] = useState(-1);
    const [rate_limit_reset, setRateLimitReset] = useState(-1);


    useEffect(() => {
        async function fetchData(org_name, setter) {
            // console.log('Fetching organization data...');
            AdjustSemaphore(startedLoading, setStartedLoading);
            AdjustSemaphore(loading, setLoading);
            try {
                const data = await tryGetOrganization(org_name);
                // setOrgData(data);
                setter(data);
            } catch (error) {
                AdjustSemaphore(errors, setErrors);
                console.error('Error fetching organization data:', error);
            } finally {
                // setLoading(false);
                AdjustSemaphore(loading, setLoading, -1);
                AdjustSemaphore(doneLoading, setDoneLoading);
            }
        }
        async function getRepositories(org_name, setter) {
            // console.log('Fetching repositories...');
            AdjustSemaphore(startedLoading, setStartedLoading);
            AdjustSemaphore(loading, setLoading);
            try {
                // const repos = await tryListRepositories(org_name);
                const repos = await tryListRepositories(org_name, -1);

                // setRepositories(repos);
                setter(repos);
            } catch (error) {
                AdjustSemaphore(errors, setErrors);
                console.error('Error fetching repositories:', error);
            } finally {
                // setLoading(false);
                AdjustSemaphore(loading, setLoading, -1);
                AdjustSemaphore(doneLoading, setDoneLoading);
            }
        }

        fetchData(AccessConfig.NOAA_OWP, setNOAAOrgData);
        getRepositories(AccessConfig.NOAA_OWP, setNOAAOrgRepos);
        fetchData(AccessConfig.CIROH, setCIROHOrgData);
        getRepositories(AccessConfig.CIROH, setCIROHOrgRepos);


    }, []);

    useEffect(() => {
        async function getActionsWorkflows() {
            AdjustSemaphore(startedLoading, setStartedLoading);
            AdjustSemaphore(loading, setLoading);
            try {
                var actions_repos = actions_repos_list;
                var actions_workflows = actions_workflows_map;
                console.log("Found " + ciroh_org_repos.length + " repositories in CIROH");
                for (var i = 0; i < ciroh_org_repos.length; i++) {
                    for (var j = 0; j < AccessConfig.actions_repo_targets.length; j++) {
                        let repo_org = AccessConfig.actions_repo_targets[j][0];
                        let repo_name = AccessConfig.actions_repo_targets[j][1];
                        if (repo_org !== AccessConfig.CIROH) {
                            continue;
                        }
                        let repo = ciroh_org_repos[i];
                        if (repo.name === repo_name) {
                            var workflows = await tryGetRepositoryWorkflows(repo);
                            actions_repos.push(repo);
                            actions_workflows[repo.name] = workflows;
                        }
                    }
                }
                setActionsReposList(actions_repos);
                setActionsWorkflowsMap(actions_workflows);
                console.log("Found " + actions_repos.length + " actions repositories");
                console.log("Found " + Object.keys(actions_workflows).length + " actions workflows");
            } catch (error) {
                AdjustSemaphore(errors, setErrors);
                console.error('Error fetching actions workflows:', error);
            }
            finally {
                AdjustSemaphore(loading, setLoading, -1);
                AdjustSemaphore(doneLoading, setDoneLoading);
            }
        }
        if (ciroh_org_repos.length > 0) {
            // console.log("Found " + ciroh_org_repos.length + " repositories in CIROH");
            getActionsWorkflows();
        }
        // getActionsWorkflows();
    }, [ciroh_org_repos]);

    useEffect(() => {
        async function getRateLimit() {
            AdjustSemaphore(startedLoading, setStartedLoading);
            AdjustSemaphore(loading, setLoading);
            try {
                const rateLimit = await getRateLimitStatus();
                setRateLimitMax(rateLimit.rate.limit);
                setRateLimitRemaining(rateLimit.rate.remaining);
                setRateLimitSpent(rateLimit.rate.used);
                setRateLimitReset(rateLimit.rate.reset);
            } catch (error) {
                AdjustSemaphore(errors, setErrors);
                console.error('Error fetching rate limit status:', error);
            } finally {
                AdjustSemaphore(loading, setLoading, -1);
                AdjustSemaphore(doneLoading, setDoneLoading);
            }
        }
        getRateLimit();
    }, []);

    if (loading > 0) {
        return <div>
            Loading...
            <br />
            In progress: {loading}
            <br />
            Completion: {doneLoading}/{startedLoading}
            <br />
            Errors: {errors}
        </div>;
    }

    // if (!orgData) {
    //     return <div>Error loading data</div>;
    // }

    var ciroh_repo_list = <div>Error loading data</div>;
    if (ciroh_org_data && ciroh_org_repos) {
        ciroh_repo_list = RepoListSection(ciroh_org_data, ciroh_org_repos);
    }
    else {
        ciroh_repo_list = RateLimitStatusMessage(ciroh_repo_list, rate_limit_max, rate_limit_remaining, rate_limit_spent, rate_limit_reset);
    }
    // var noaa_repo_list = RepoListSection(noaa_org_data, noaa_org_repos);
    var noaa_repo_list = <div>Error loading data</div>;
    if (noaa_org_data && noaa_org_repos) {
        noaa_repo_list = RepoListSection(noaa_org_data, noaa_org_repos);
    }
    else {
        noaa_repo_list = RateLimitStatusMessage(noaa_repo_list, rate_limit_max, rate_limit_remaining, rate_limit_spent, rate_limit_reset);
    }
    // var awi_repo_list = <div>Error loading data</div>;
    // if (awi_org_data && awi_org_repos) {
    //     awi_repo_list = RepoListSection(awi_org_data, awi_org_repos);
    // }

    var actions_workflows_list = <div>Error loading data</div>;
    // if (actions_repo !== undefined && actions_repo && actions_workflows) {
    //     actions_workflows_list = RepoWorkflowsSection(actions_repo, actions_workflows);
    // }
    if (actions_repos_list.length > 0 && actions_workflows_map) {
        var actions_repos_array = Array.of(...actions_repos_list);
        console.log("Actions repos array type: ", typeof actions_repos_array);
        actions_workflows_list = actions_repos_array.map((repo) => {
            var workflows = actions_workflows_map[repo.name];
            if (Object.hasOwn(workflows, 'workflows')) {
                workflows = workflows.workflows;
            }
            return RepoWorkflowsSection(repo, workflows);
        });
        console.log("Finished actions_workflows_list. Length: ", actions_workflows_list.length);
    }
    else {
        actions_workflows_list = RateLimitStatusMessage(actions_workflows_list, rate_limit_max, rate_limit_remaining, rate_limit_spent, rate_limit_reset);
        console.log("Forced to skip actions_workflows_list. Length: ", actions_workflows_list.length);
    }

    return (
        <div>
            <IntroDiv />
            {actions_workflows_list}
            {/* {ciroh_repo_list}
            {awi_repo_list}
            {noaa_repo_list} */}
            <Tabs defaultValue="ciroh" values={[
                { label: 'CIROH-UA', value: 'ciroh' },
                { label: 'NOAA-OWP', value: 'noaa' },
                // { label: 'Alabama Water Institute', value: 'awi' },
            ]}>
                <TabItem value="ciroh" label="CIROH-UA" default>
                    {ciroh_repo_list}
                </TabItem>
                <TabItem value="noaa" label="NOAA-OWP">
                    {noaa_repo_list}
                </TabItem>
                {/* <TabItem value="awi" label="Alabama Water Institute">
                    {awi_repo_list}
                </TabItem> */}
            </Tabs>
            <p>Note: The list of repositories is not exhaustive. It is filtered by name, and currently can miss repositories that have had their names changed after being forked.</p>
        </div>
    );
}
