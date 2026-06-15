import React from 'react';
import boardData from '@site/src/data/githubProjectBoard.json';
import styles from './styles.module.css';

const ORG = 'CIROH-UA';
const PROJECT_NUMBER = 10;

// Data is fetched at BUILD TIME by scripts/fetch-project-board.mjs (server-side,
// using GH_PROJECT_TOKEN) and written to src/data/githubProjectBoard.json. The
// token is never shipped to the browser; this component only reads static data.
export default function GitHubProjectBoard() {
  const items = boardData?.items || [];
  const error = boardData?.error;

  if (error && items.length === 0) {
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
          <strong>Note:</strong> This dashboard is generated at build time from the GitHub GraphQL API
          (CIROH-UA Project #{PROJECT_NUMBER}). The read-only token is used only during the build via
          <code> GH_PROJECT_TOKEN</code> and is never exposed to the browser.
        </p>
      </div>
    </div>
  );
}
