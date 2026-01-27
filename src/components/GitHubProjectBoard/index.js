import React, { useState, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

const ORG = 'CIROH-UA';
const PROJECT_NUMBER = 10;

export default function GitHubProjectBoard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { siteConfig } = useDocusaurusContext();
  const token = siteConfig?.customFields?.githubProjectToken;

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!token) {
        setError('Missing GitHub token. Set GITHUB_PROJECT_TOKEN in your .env and expose via customFields.githubProjectToken');
        setLoading(false);
        return;
      }

      const query = `
        query($org: String!, $number: Int!) {
          organization(login: $org) {
            projectV2(number: $number) {
              title
              url
              items(first: 50) {
                nodes {
                  id
                  content {
                    __typename
                    ... on Issue {
                      title
                      url
                      state
                      number
                      repository { name }
                    }
                    ... on PullRequest {
                      title
                      url
                      state
                      number
                      repository { name }
                    }
                  }
                  fieldValues(first: 10) {
                    nodes {
                      __typename
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        name
                        field { name }
                      }
                      ... on ProjectV2ItemFieldTextValue {
                        text
                        field { name }
                      }
                      ... on ProjectV2ItemFieldNumberValue {
                        number
                        field { name }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query, variables: { org: ORG, number: PROJECT_NUMBER } }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`GitHub API error: ${res.status} ${res.statusText} - ${text}`);
        }

        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors.map((e) => e.message).join('; '));
        }

        const nodes = json?.data?.organization?.projectV2?.items?.nodes || [];

        const parsed = nodes.map((node) => {
          const content = node.content || {};
          const status = extractField(node.fieldValues?.nodes, 'Status');
          const priority = extractField(node.fieldValues?.nodes, 'Priority');
          const owner = extractField(node.fieldValues?.nodes, 'Owner');
          const due = extractField(node.fieldValues?.nodes, 'Due date');
          return {
            id: node.id,
            title: content.title || 'Untitled',
            url: content.url,
            state: content.state,
            repo: content.repository?.name,
            number: content.number,
            type: content.__typename,
            status,
            priority,
            owner,
            due,
          };
        });

        setItems(parsed);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [token]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading infrastructure requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Infrastructure Requests Dashboard</h3>
        <a
          href={`https://github.com/orgs/${ORG}/projects/${PROJECT_NUMBER}/`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewFullLink}
        >
          View Full Dashboard on GitHub →
        </a>
      </div>

      <div className={styles.cards}>
        {items.map((item) => (
          <article key={item.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.type}>{item.type === 'Issue' ? 'Issue' : 'PR'}</span>
              {item.status && <span className={styles.status}>{item.status}</span>}
            </div>
            <h4 className={styles.title}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
            </h4>
            <div className={styles.meta}>
              {item.repo && <span>{item.repo}#{item.number}</span>}
              {item.state && <span className={styles.state}>{item.state}</span>}
            </div>
            <div className={styles.fields}>
              {item.priority && <span className={styles.badge}>Priority: {item.priority}</span>}
              {item.owner && <span className={styles.badge}>Owner: {item.owner}</span>}
              {item.due && <span className={styles.badge}>Due: {item.due}</span>}
            </div>
          </article>
        ))}
      </div>

      <div className={styles.fallback}>
        <p>
          <strong>Note:</strong> This view uses the GitHub GraphQL API. Ensure a read-only fine-grained token is provided via <code>GITHUB_PROJECT_TOKEN</code> in your <code>.env</code> and exposed in <code>customFields.githubProjectToken</code>.
        </p>
      </div>
    </div>
  );
}

function extractField(nodes = [], targetFieldName) {
  const match = nodes.find((n) => {
    const fieldName = n?.field?.name || n?.field?.__typename || '';
    return fieldName.toLowerCase() === targetFieldName.toLowerCase();
  });

  if (!match) return null;

  if (match.__typename === 'ProjectV2ItemFieldSingleSelectValue') return match.name;
  if (match.__typename === 'ProjectV2ItemFieldTextValue') return match.text;
  if (match.__typename === 'ProjectV2ItemFieldNumberValue') return match.number;
  return null;
}
