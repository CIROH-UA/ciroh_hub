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

import { tryGetCachedRepository, tryGetCachedOrganization, tryGetCachedRepositoryWorkflows } from './AccessUtils';
import { RateLimitError } from './RateLimitError';
import { AccessConfig } from './AccessConfig';
import { useObserveFraction, visibleOnce } from './VisibilityUtil';
import Link from '@docusaurus/Link';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Details from '@theme/Details';

/**
 * @name BuildRepoDiv
 * @param {Repository} repository
 * @param {string} [padding] - optional, default null
 * @description
 * This function takes a repository and returns a HTML element
 * that displays the repository information.
 * @returns {JSX.Element}
 */
function BuildRepoDiv(repository, padding = null) {
    // Repository information
    const repo_name = repository.name;
    const repo_desc = repository.description;
    const repo_url = repository.html_url;
    var outer_style = {
        marginBottom: '0px',
        backgroundColor: 'var(--ifm-background-color)',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
    }
    return (
        <div style={outer_style}>
            <h2 style={{ marginTop: 0, color: 'var(--ifm-color-primary)', fontSize: '1.5rem' }}>{repo_name}</h2>
            <p style={{ color: 'var(--ifm-color-emphasis-900)', marginBottom: '15px' }}>{repo_desc}</p>
            <Link 
                href={repo_url} 
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
    const [rateError, setError] = useState(null);
    // Only fetch the data once the component is visible
    const ref = React.useRef(null);
    // const visibleFraction = useObserveFraction(ref, true);
    const seenOnce = visibleOnce(ref);
    useEffect(() => {
        if (seenOnce === false) {
            return;
        }
        async function fetchData() {
            try {
                const data = await tryGetCachedRepository(org_name, repo_name);
                setRepoData(data);
            } catch (error) {
                // console.error('Error fetching repository data:', error);
                if (error instanceof RateLimitError) {
                    setError(error);
                }
                else {
                    console.error('Error fetching repository data:', error);
                }
            }
            finally {
                setLoading(false);
                setError(null);
            }
        }
        fetchData();
    }, [org_name, repo_name, seenOnce]);
    let content;
    if (rateError && rateError instanceof RateLimitError) {
        content = rateError.asJSXElement();
    }
    else if (loading) {
        content = <div>Loading...</div>;
    }
    else {
        content = BuildRepoDiv(repoData, padding);
    }
    // Add the ref to the content before returning
    return <div ref={ref}>{content}</div>;
}

/**
 * @name BuildOrgDiv
 * @param {Organization} organization
 * @param {string} [padding] - optional, default null
 * @description
 * This function takes an organization and returns a HTML element
 * that displays the organization information.
 * @returns {JSX.Element}
 */
function BuildOrgDiv(organization, padding = null) {
    // Organization information
    const org_name = organization.login;
    const org_desc = organization.description;
    const org_url = organization.html_url;
    const org_avatar = organization.avatar_url;
    var outer_style = {
        border: '1px solid var(--ifm-color-emphasis-500)',
        borderRadius: '25px',
        padding: '22px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
    }
    return (
        <div style={outer_style}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <img 
                    className="image" 
                    crossOrigin="anonymous" 
                    src={org_avatar} 
                    alt="Organization Avatar" 
                    style={{ 
                        width: '80px', 
                        height: '80px', 
                        marginRight: '15px',
                        marginBottom: '10px',
                    }} 
                />
                <div>
                    <h2 style={{ margin: 0, color: 'var(--ifm-color-primary)', fontSize: '1.5rem' }}>{org_name}</h2>
                    <p style={{ color: 'grey', margin: '5px 0 0 0' }}>{org_desc}</p>
                </div>
            </div>
            <Link 
                href={org_url} 
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
                View Organization
            </Link>
        </div>
    );
}

/**
 * @name OrgDiv
 * @description
 * This function takes an organization's name and returns a HTML element
 * that displays the organization information.
 * @param {Object} props
 * @param {string} props.org_name - The name of the organization.
 * @param {string} [padding] - The padding of the element. Default is null.
 * @returns {JSX.Element}
 */
function OrgDiv({ org_name, padding = null }) {
    // Organization information
    const [loading, setLoading] = useState(true);
    const [orgData, setOrgData] = useState(null);
    const [rateError, setError] = useState(null);
    // Only fetch the data once the component is visible
    const ref = React.useRef(null);
    // const visibleFraction = useObserveFraction(ref, true);
    const seenOnce = visibleOnce(ref);
    useEffect(() => {
        if (seenOnce === false) {
            return;
        }
        async function fetchData() {
            try {
                const data = await tryGetCachedOrganization(org_name);
                setOrgData(data);
            } catch (error) {
                // console.error('Error fetching organization data:', error);
                if (error && error instanceof RateLimitError) {
                    setError(error);
                }
                else {
                    console.error('Error fetching organization data:', error);
                }
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [org_name, seenOnce]);
    // if (rateError && rateError instanceof RateLimitError) {
    //     return rateError.asJSXElement();
    // }
    // else if (loading) {
    //     return <div>Loading...</div>;
    // }
    // else {
    //     return BuildOrgDiv(orgData, padding);
    // }
    let content;
    if (rateError && rateError instanceof RateLimitError) {
        content = rateError.asJSXElement();
    }
    else if (loading) {
        content = <div>Loading...</div>;
    }
    else {
        content = BuildOrgDiv(orgData, padding);
    }
    // Add the ref to the content before returning
    return <div ref={ref}>{content}</div>;
}

/**
 * @name BuildRepoWorkflowsDiv
 * @param {Repository} repository
 * @param {Workflow[]} workflows
 * @description
 * This function takes a repository and a list of workflows
 * and returns a HTML element that displays the workflows
 * of the repository.
 * The workflows are displayed in a vertical manner.
 * @returns {JSX.Element}
 */
function BuildRepoWorkflowsDiv(repository, workflows_0, isExpanded, setIsExpanded) {
    var workflows = workflows_0;
    if (!Array.isArray(workflows)) {
        // if it's an iterable object, unpack it into an array
        // if it's some other type, attempt to convert it.
        if (Symbol.iterator in workflows) {
            workflows = [...workflows];
        }
        else if ("workflows" in workflows) {
            workflows = workflows.workflows;
        }
        else {
            console.log("Workflows is not an array or iterable object.");
        }
    }
    const repo_workflow_contents = (workflow) => {
        return [
            <h3 key={workflow.id} style={{ color: 'var(--ifm-color-primary)', fontSize: '1.2rem', marginBottom: '10px' }}>{workflow.name}</h3>,
            <p key={workflow.id + "_desc"} style={{ color: 'var(--ifm-color-emphasis-900)', marginBottom: '10px' }}>{workflow.description}</p>,
            <Link key={workflow.id + "_link"} to={workflow.html_url} target="_blank" rel="noopener noreferrer">
                <img className="image" src={workflow.badge_url} alt="Workflow Badge" style={{ marginBottom: '10px' }} />
            </Link>,
            <p key={workflow.id + "_state"} style={{ 
                color: workflow.state === "active" ? '#2ea44f' : '#cb2431',
                fontWeight: 'bold',
                marginBottom: '5px'
            }}>
                {workflow.state === "active" ? "Active" : "Inactive"}
            </p>,
            <p key={workflow.id + "_created"} style={{ color: 'var(--ifm-color-emphasis-900)', fontSize: '0.9rem', marginBottom: '5px' }}>
                Created at: {new Date(workflow.created_at).toLocaleString()}
            </p>,
            <p key={workflow.id + "_updated"} style={{ color: 'var(--ifm-color-emphasis-900)', fontSize: '0.9rem', marginBottom: '10px' }}>
                Updated at: {new Date(workflow.updated_at).toLocaleString()}
            </p>,
            <Link 
                key={workflow.id + "_view"} 
                href={workflow.html_url} 
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
                View Workflow
            </Link>
        ];
    }
    const repo_workflow_listitem = (workflow) => {
        const listitem = (
            <li key={workflow.id} style={{ 
                border: '1px solid var(--ifm-color-emphasis-500)',
                borderRadius: '25px',
                margin: '10px 0',
                padding: '15px',
                backgroundColor: 'var(--ifm-background-color)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
            }}>
                {repo_workflow_contents(workflow)}
            </li>
        );
        // verify that the list item has a unique key
        if (listitem.key === undefined) {
            console.error("List item does not have a unique key.");
        }
        else {
            // console.log("List item has a unique key: " + listitem.key);
        }
        return listitem;
    }
    const workflow_list = workflows.map(repo_workflow_listitem);
    var workflows_div_interior = (<div>No workflows found for this repository.</div>);
    if (workflow_list.length > 0) {
        workflows_div_interior = (
            <div>
                <h3 style={{ color: 'var(--ifm-color-primary)', marginBottom: '15px' }}>Workflows:</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {workflow_list}
                </ul>
            </div>
        )
    }
    const workflows_div = (
        <div>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    backgroundColor: '#6c757d',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '2px',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    marginLeft: '2px',
                    fontSize: '1rem',
                    fontWeight: 'normal',
                    fontFamily: 'inherit',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
                Show Workflows
            </button>
            {isExpanded && (
                <div style={{ marginTop: '10px' }}>
                    {workflows_div_interior}
                </div>
            )}
        </div>
    );
    var workflows_div_key = "workflows_div";
    workflows_div_key += "_" + repository.id;
    for (const workflow of workflows) {
        workflows_div_key += "_" + workflow.id;
    }
    return (
        <div key={workflows_div_key}>
            {workflows_div}
        </div>
    );
}
import { RepoCache } from './AccessUtils';
/**
 * @name RepoWorkflowsDiv
 * @description
 * This function takes a repository's name and org and returns a HTML element
 * that displays the repository information and its workflows.
 * @param {Object} props
 * @param {string} props.org_name - The name of the organization.
 * @param {string} props.repo_name - The name of the repository.
 * @param {string} [padding] - The padding of the element. Default is null.
 * @returns {JSX.Element}
 */
function RepoWorkflowsDiv({ org_name, repo_name, padding = null }) {
    // Repository information
    const [loading, setLoading] = useState(true);
    const [repoData, setRepoData] = useState(null);
    const [workflowsData, setWorkflowsData] = useState(null);
    const [repoRateError, setRepoError] = useState(null);
    const [workflowsRateError, setWorkflowsError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    // Only fetch the data once the component is visible
    const ref = React.useRef(null);
    // const visibleFraction = useObserveFraction(ref, true);
    const seenOnce = visibleOnce(ref);
    useEffect(() => {
        if (seenOnce === false) {
            return;
        }
        async function fetchRepo() {
            try {
                const data = await tryGetCachedRepository(org_name, repo_name);
                setRepoData(data);
            } catch (error) {
                // console.log('Error fetching repository data:', error);
                if (error && error instanceof RateLimitError) {
                    setRepoError(error);
                }
                else {
                    // console.warn('Error fetching repository data:', error);
                }
            }
            finally {
                setLoading(false);
                setRepoError(null);
            }
        }
        fetchRepo();
    }, [org_name, repo_name, seenOnce]);
    useEffect(() => {
        if (repoData === null) {
            return;
        }
        async function fetchWorkflows() {
            try {
                const data = await tryGetCachedRepositoryWorkflows(org_name, repo_name);
                setWorkflowsData(data);
            } catch (error) {
                // console.log('Error fetching workflows data:', error);
                if (error && error instanceof RateLimitError) {
                    setWorkflowsError(error);
                }
                else {
                    // console.warn('Error fetching workflows data:', error);
                }
            }
            finally {
                setLoading(false);
                setWorkflowsError(null);
            }
        }
        fetchWorkflows();
    }, [repoData]);
    let repoContent, workflowsContent;
    let didRepoError = (repoRateError && repoRateError instanceof RateLimitError);
    let didWorkflowsError = (workflowsRateError && workflowsRateError instanceof RateLimitError);
    if (didRepoError || didWorkflowsError) {
        // check which is more recent, display that one
        /** @type {RateLimitError} */
        const repoError = repoRateError;
        /** @type {RateLimitError} */
        const workflowsError = workflowsRateError;
        if (didRepoError && didWorkflowsError) {
            if (repoError.limit_data.calculated_at > workflowsError.limit_data.calculated_at) {
                repoContent = repoError.asJSXElement();
                workflowsContent = null;
            }
            else {
                workflowsContent = workflowsError.asJSXElement();
                repoContent = null;
            }
        }
        else if (didRepoError) {
            repoContent = repoError.asJSXElement();
            workflowsContent = null;
        }
        else if (didWorkflowsError) {
            workflowsContent = workflowsError.asJSXElement();
            repoContent = null;
        }
    }
    else if (loading) {
        repoContent = <div>Loading...</div>;
        workflowsContent = null;
    }
    else if (repoData === null) {
        repoContent = (
            <div>
                <p>Repository not found.</p>
                <p>Found Repositories:</p>
                <p>{JSON.stringify(Object.keys(RepoCache[AccessConfig.CIROH]))}</p>
            </div>
        );
        workflowsContent = null;
    }
    else if (workflowsData === null) {
        workflowsContent = <div>Workflows not found.</div>;
        repoContent = BuildRepoDiv(repoData, padding);
    }
    else if (workflowsData.length === 0) {
        workflowsContent = <div>No workflows found for this repository.</div>;
        repoContent = BuildRepoDiv(repoData, padding);
    }
    else {
        workflowsContent = BuildRepoWorkflowsDiv(repoData, workflowsData, isExpanded, setIsExpanded);
        repoContent = BuildRepoDiv(repoData, padding);
    }
    // Add the ref to the content before returning
    return <div ref={ref} style={{ 
        marginBottom: '30px',
        border: '1px solid var(--ifm-color-emphasis-500)',
        borderRadius: '25px',
        backgroundColor: 'var(--ifm-background-color)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    }}>
        <div style={{ padding: '22px' }}>
            {repoContent}
        </div>
        <div style={{ 
            padding: '2px 20px',
        }}>
            {workflowsContent}
        </div>
    </div>;
}

export { RepoDiv, OrgDiv, RepoWorkflowsDiv };