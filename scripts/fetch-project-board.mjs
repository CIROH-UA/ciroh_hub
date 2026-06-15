/**
 * Build-time fetch of the GitHub Project board ("Infrastructure Requests
 * Dashboard").
 *
 * This runs in Node during `prebuild`/`prestart`, so GH_PROJECT_TOKEN is used
 * ONLY server-side at build time and is never shipped to the browser. The
 * fetched data is written to src/data/githubProjectBoard.json, which the
 * GitHubProjectBoard component imports statically.
 *
 * If GH_PROJECT_TOKEN is unset (e.g. fork PRs) or the request fails, an empty
 * board is written so the site still builds.
 *
 * The query and parsing below are kept identical to the previous client-side
 * implementation so the rendered output is unchanged.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const ORG = 'CIROH-UA';
const PROJECT_NUMBER = 10;
const OUT_DIR = 'src/data';
const OUT_FILE = `${OUT_DIR}/githubProjectBoard.json`;

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
                  field { ... on ProjectV2FieldCommon { name } }
                }
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field { ... on ProjectV2FieldCommon { name } }
                }
                ... on ProjectV2ItemFieldNumberValue {
                  number
                  field { ... on ProjectV2FieldCommon { name } }
                }
              }
            }
          }
        }
      }
    }
  }
`;

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

function write(items, error) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify({ items, error }, null, 2) + '\n');
}

async function main() {
  const token = process.env.GH_PROJECT_TOKEN;

  if (!token) {
    const msg =
      'GH_PROJECT_TOKEN not set at build time; writing an empty project board.';
    console.warn(`[fetch-project-board] ${msg}`);
    write([], msg);
    return;
  }

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { org: ORG, number: PROJECT_NUMBER },
      }),
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

    const items = nodes.map((node) => {
      const content = node.content || {};
      return {
        id: node.id,
        title: content.title || 'Untitled',
        url: content.url,
        state: content.state,
        repo: content.repository?.name,
        number: content.number,
        type: content.__typename,
        status: extractField(node.fieldValues?.nodes, 'Status'),
        priority: extractField(node.fieldValues?.nodes, 'Priority'),
        owner: extractField(node.fieldValues?.nodes, 'Owner'),
        due: extractField(node.fieldValues?.nodes, 'Due date'),
      };
    });

    write(items, null);
    console.log(`[fetch-project-board] Wrote ${items.length} item(s) to ${OUT_FILE}.`);
  } catch (err) {
    // Never fail the build because of the dashboard; render it empty instead.
    console.warn(`[fetch-project-board] ${err.message}`);
    write([], err.message);
  }
}

main();
