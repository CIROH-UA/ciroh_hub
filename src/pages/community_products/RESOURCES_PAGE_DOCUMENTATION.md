# 📚 CIROH Resources Page - Complete Technical Documentation

## 🎯 Overview
The Resources page is a tabbed interface that fetches and displays HydroShare resources (tools, courses, presentations, and datasets) with advanced filtering, sorting, and infinite scroll capabilities.

---

## 📁 File Structure

```
src/
├── pages/
│   └── resources/
│       ├── index.js              # Main page component with tabs
│       └── resources.module.css   # Page-specific styles
├── components/
│   └── ResourceBrowser/
│       ├── index.js              # Main browser component (filtering, sorting, pagination)
│       ├── styles.module.css      # Browser styles
│       └── ResourceList/
│           ├── index.js           # List wrapper component
│           ├── ResourceRow.js     # Individual resource card
│           └── styles.module.css   # Row/card styles
└── api/
    └── hydroshareAPI.js          # API service for HydroShare integration
```

---

## 🔄 Data Flow Architecture

```
User navigates to /resources
         ↓
index.js (Resources Page)
         ↓
Docusaurus <Tabs> component renders 4 tabs
         ↓
Each <TabItem> contains <ResourceBrowser> with different keyword
         ↓
ResourceBrowser (Filtering UI + State Management)
         ↓
hydroshareAPI.js (Fetches from HydroShare)
         ↓
Data normalized and enriched with metadata
         ↓
ResourceList (Maps resources to rows)
         ↓
ResourceRow (Individual cards with actions)
         ↓
Rendered to user
```

---

## 📄 File-by-File Breakdown

### 1. `/src/pages/resources/index.js`
**Purpose:** Main entry point for the Resources page

**Key Components:**
- **Layout Wrapper:** Docusaurus theme layout
- **Hero Banner:** Page title and description
- **Tabs Component:** 4 tabs for different resource types
  - Resources (Apps/Tools)
  - Courses (Learning modules)
  - Presentations (Conference materials)
  - Datasets (Data collections)

**How It Works:**
```javascript
// Step 1: Page loads with Layout wrapper
<Layout title="CIROH Community Products" description="...">
  
  // Step 2: Hero banner section displays
  <div className={styles.resourcesBanner}>
    <h1>CIROH Community Products</h1>
    <p>Discover hydrologic data, models, tools...</p>
  </div>

  // Step 3: Tabs component initializes with defaultValue="products"
  <Tabs defaultValue="products" values={[...]}>
    
    // Step 4: First tab renders ResourceBrowser
    <TabItem value="products">
      <ResourceBrowser
        keyword="nwm_portal_app"        // ← HydroShare subject filter
        resourceLabel="Resources"
        defaultImage="/img/datasets_logo_light.png"
      />
    </TabItem>
    
    // Similar structure for other tabs...
  </Tabs>
</Layout>
```

**Props Passed to ResourceBrowser:**
- `keyword`: HydroShare subject tag to filter by
  - `"nwm_portal_app"` → Resources/Apps
  - `"nwm_portal_module"` → Courses
  - `"ciroh_portal_presentation"` → Presentations
  - `"ciroh_portal_data"` → Datasets
- `resourceLabel`: Display name for the resource type
- `defaultImage`: Fallback thumbnail image

**Full Source Code:**
```javascript
import React from 'react';
import Layout from '@theme/Layout';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './resources.module.css';
import ResourceBrowser from '@site/src/components/ResourceBrowser';

export default function Resources() {
  const hydroShareIcon = 'https://storage.googleapis.com/hydroshare-prod-static-media/static/img/logo-lg.cf4395806c8e.png';
  const tethysIcon = 'https://tethysgeoscience.org/wp-content/uploads/2025/01/TehtysPlatform.png';
  
  return (
    <Layout
      title="CIROH Community Products"
      description="HydroShare resources and courses">
      <main>
        <div className={styles.resourcesBanner}>
          <div className={styles.resourcesContainer}>
            <h1 className={styles.resourcesTitle}>CIROH Community Products</h1>
            <p className={styles.resourcesSubtitle}>
              Discover hydrologic data, models, tools, and learning modules curated from HydroShare.
              Explore CIROH's ecosystem of community-contributed resources supporting NOAA's hydrologic research.
            </p>
          </div>
        </div>

        <div className="container" style={{ marginTop: '2rem' }}>
          <Tabs defaultValue="products" values={[
            {label: 'Resources', value: 'products'},
            {label: 'Courses', value: 'courses'},
            {label: 'Presentations', value: 'presentations'},
            {label: 'Datasets', value: 'datasets'},
          ]}>
            <TabItem value="products">
              <div className={styles.tabBanner}>
                <div className={styles.tabBannerContent}>
                  <h2 className={styles.tabTitle}>HydroShare Resources</h2>
                  <p className={styles.tabSubtitle}>
                Browse hydrologic resources: datasets, apps, and tools aligned with NextGen and CIROH initiatives.
                Enhance forecasting, analysis, and water resource management by making your web applications and tools accessible to CIROH and NOAA's hydrologic research initiatives.
                  </p>
                  <div className={styles.poweredBy}>
                    <span className={styles.poweredByLabel}>Powered by</span>
                    <img src={tethysIcon} alt="Tethys Platform" style={{height:32}} />
                    <img src={hydroShareIcon} alt="HydroShare" style={{height:32}} />
                  </div>
                </div>
              </div>
              <ResourceBrowser
                keyword="nwm_portal_app"
                resourceLabel="Resources"
                defaultImage="/img/datasets_logo_light.png"
              />
            </TabItem>
            <TabItem value="courses">
              <div className={styles.tabBanner}>
                <div className={styles.tabBannerContent}>
                  <h2 className={styles.tabTitle}>HydroShare Courses</h2>
                  <p className={styles.tabSubtitle}>
                    Access a range of open courses in hydrology, enriched with CIROH and NOAA research, designed for learners at all levels seeking to deepen their understanding of water science.
                  </p>
                  <div className={styles.poweredBy}>
                    <span className={styles.poweredByLabel}>Powered by</span>
                    <img src={tethysIcon} alt="Tethys Platform" style={{height:32}} />
                    <img src={hydroShareIcon} alt="HydroShare" style={{height:32}} />
                  </div>
                </div>
              </div>
              <ResourceBrowser
                keyword="nwm_portal_module"
                resourceLabel="Courses"
                defaultImage="/img/datasets_logo_light.png"
              />
            </TabItem>
            <TabItem value="presentations">
              <div className={styles.tabBanner}>
                <div className={styles.tabBannerContent}>
                  <h2 className={styles.tabTitle}>Presentations</h2>
                  <p className={styles.tabSubtitle}>
                    Explore CIROH and partner conference, workshop, and webinar presentations covering hydrologic modeling, forecasting, and water resources research.
                  </p>
                  <div className={styles.poweredBy}>
                    <span className={styles.poweredByLabel}>Powered by</span>
                    <img src={hydroShareIcon} alt="HydroShare" style={{height:32}} />
                  </div>
                </div>
              </div>
              <ResourceBrowser
                keyword="ciroh_portal_presentation"
                resourceLabel="Presentations"
                defaultImage="/img/datasets_logo_light.png"
              />
            </TabItem>
            <TabItem value="datasets">
              <div className={styles.tabBanner}>
                <div className={styles.tabBannerContent}>
                  <h2 className={styles.tabTitle}>Datasets</h2>
                  <p className={styles.tabSubtitle}>
                    Access curated hydrologic datasets including model outputs, observations, and forcing data supporting CIROH and NOAA water prediction initiatives.
                  </p>
                  <div className={styles.poweredBy}>
                    <span className={styles.poweredByLabel}>Powered by</span>
                    <img src={hydroShareIcon} alt="HydroShare" style={{height:32}} />
                  </div>
                </div>
              </div>
              <ResourceBrowser
                keyword="ciroh_portal_data"
                resourceLabel="Datasets"
                defaultImage="/img/datasets_logo_light.png"
              />
            </TabItem>
          </Tabs>
        </div>
      </main>
    </Layout>
  );
}
```

---

### 2. `/src/components/ResourceBrowser/index.js`
**Purpose:** Main orchestrator for fetching, filtering, sorting, and pagination

**State Variables:**
```javascript
const [resources, setResources] = useState([])        // All loaded resources
const [loading, setLoading] = useState(true)          // Loading state
const [error, setError] = useState(null)              // Error messages
const [hasMore, setHasMore] = useState(true)          // More pages available?
const [currentPage, setCurrentPage] = useState(1)     // Current page number

const [searchInput, setSearchInput] = useState('')    // User's typed search
const [activeSearch, setActiveSearch] = useState('')  // Debounced search query
const [sortBy, setSortBy] = useState('modified')      // Sort field
const [sortDirection, setSortDirection] = useState('desc') // asc/desc
```

**Step-by-Step Execution Flow:**

#### Initial Load (Page 1):
```javascript
// STEP 1: Component mounts
useEffect(() => {
  setCurrentPage(1)
  setHasMore(true)
  fetchingRef.current = false
  fetchPage(1, true)  // ← Triggers initial fetch
}, [keyword, activeSearch, sortBy, sortDirection])

// STEP 2: fetchPage() executes
const fetchPage = async (page, replace = false) => {
  // 2a. Show placeholder skeletons
  if (page === 1 && replace) {
    setResources(createPlaceholders())  // 10 skeleton rows
    setLoading(true)
  }

  // 2b. Call HydroShare API
  const raw = await fetchResourcesBySearch(
    keyword,           // e.g., "nwm_portal_app"
    activeSearch,      // e.g., "streamflow"
    ascending,         // true/false
    sortBy,            // "modified", "created", "title", "author"
    undefined,         // author filter (unused)
    page,              // page number
  )

  // 2c. Normalize data structure
  const normalized = raw.map(normalize)
  // Converts HydroShare API format to internal format:
  // {
  //   id: resource_id,
  //   title: resource_title,
  //   description: abstract,
  //   authors: authors array joined by ' • ',
  //   thumbnailUrl: '',  // populated later
  //   pageUrl: '',       // populated later
  //   docsUrl: '',       // populated later
  //   resourceUrl: resource_url
  // }

  // 2d. Replace skeletons with real data
  setResources(normalized)
  setHasMore(raw.length === pageSize)  // Has more if full page returned
  setLoading(false)

  // STEP 3: Lazy metadata enrichment
  for (const item of normalized) {
    try {
      const meta = await fetchResourceCustomMetadata(item.id)
      // Updates resources state with:
      // - thumbnailUrl: meta.thumbnail_url
      // - pageUrl: meta.page_url (link to product website)
      // - docsUrl: meta.docs_url (link to documentation)
      setResources(curr => curr.map(r => 
        r.id === item.id ? { ...r, ...meta } : r
      ))
    } catch (err) {
      console.warn('Metadata fetch failed', err)
    }
  }
}
```

#### Search Functionality:
```javascript
// User types in search box
const handleSearchChange = (val) => {
  setSearchInput(val)           // Update input immediately
  clearTimeout(debounceRef.current)
  
  // Wait 1000ms before triggering search
  debounceRef.current = setTimeout(() => {
    setActiveSearch(val.trim())  // ← Triggers useEffect → fetchPage(1, true)
  }, 1000)
}

// User presses Enter
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    setActiveSearch(searchInput.trim())  // Immediate search
  }
}
```

#### Infinite Scroll:
```javascript
useEffect(() => {
  const onScroll = () => {
    if (fetchingRef.current || !hasMore || loading) return

    const { scrollTop, clientHeight, scrollHeight } = document.documentElement
    
    // Check if user scrolled to within 800px of bottom
    if (scrollTop + clientHeight >= scrollHeight - 800) {
      const next = currentPage + 1
      setCurrentPage(next)
      fetchPage(next)  // Fetch next page and append to resources
    }
  }
  
  window.addEventListener('scroll', onScroll)
  return () => window.removeEventListener('scroll', onScroll)
}, [currentPage, hasMore, loading])
```

**Full Source Code:**
```javascript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { HiOutlineSortDescending, HiOutlineSortAscending } from 'react-icons/hi';
import ResourceList from './ResourceList';
import styles from './styles.module.css';

// Use wrapper API (re-exports HydroShareImporter functions)
import { fetchResourcesBySearch, fetchResourceCustomMetadata } from '../../api/hydroshareAPI';

const PAGE_SIZE = 40;            // HydroShare discoverapi per-page (default)
const SCROLL_THRESHOLD = 800;    // px from bottom before we load more (default)
const DEBOUNCE_MS = 1000;        // search debounce delay
const PLACEHOLDER_COUNT = 10;    // initial skeleton rows

export default function ResourceBrowser({
  keyword = 'nwm_portal_app',
  resourceLabel = 'Resources',
  defaultImage,
  pageSize = PAGE_SIZE,
  scrollThreshold = SCROLL_THRESHOLD,
}) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [sortBy, setSortBy] = useState('modified');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchingRef = useRef(false);
  const debounceRef = useRef(null);

  const createPlaceholders = useCallback((count = PLACEHOLDER_COUNT, page = 1) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `placeholder-${page}-${i}`,
      title: '',
      description: '',
      authors: '',
      thumbnailUrl: '',
      isPlaceholder: true,
    }));
  }, []);

  const normalize = useCallback((res) => ({
    id: res.resource_id,
    title: res.resource_title || 'Untitled',
    description: res.abstract || '',
    authors: Array.isArray(res.authors) ? res.authors.join(' • ') : (res.authors || ''),
    thumbnailUrl: '', // will be populated by custom metadata
    pageUrl: '',
    docsUrl: '',
    resourceUrl: res.resource_url,
  }), []);

  const fetchPage = useCallback(async (page, replace = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      if (page === 1 && replace) {
        setResources(createPlaceholders());
        setLoading(true);
      } else if (page > 1) {
        setResources((prev) => [...prev, ...createPlaceholders(pageSize, page)]);
      }

      const ascending = sortDirection === 'asc';
      const raw = await fetchResourcesBySearch(
        keyword,
        activeSearch,
        ascending,
        sortBy,
        undefined,
        page,
      );

      const normalized = raw.map(normalize);

      if (page === 1 && replace) {
        setResources(normalized);
      } else {
        setResources((prev) => [...prev.filter((r) => !r.isPlaceholder), ...normalized]);
      }

      setHasMore(raw.length === pageSize);
      setLoading(false);

      // Lazy metadata enrichment
      for (const item of normalized) {
        try {
          const meta = await fetchResourceCustomMetadata(item.id);
          setResources((curr) => curr.map((r) => r.id === item.id ? {
            ...r,
            thumbnailUrl: meta?.thumbnail_url || r.thumbnailUrl,
            pageUrl: meta?.page_url || r.pageUrl,
            docsUrl: meta?.docs_url || r.docsUrl,
          } : r));
        } catch (err) {
          // Non-fatal enrichment failure; log for diagnostics.
          console.warn('Metadata fetch failed for resource', item.id, err);
        }
      }
    } catch (e) {
      setError(e.message || 'Unknown error');
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, [keyword, activeSearch, sortBy, sortDirection, createPlaceholders, normalize, pageSize]);

  // Reset + fetch whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchingRef.current = false;
    fetchPage(1, true);
  }, [keyword, activeSearch, sortBy, sortDirection, fetchPage]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (fetchingRef.current || !hasMore || loading) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchPage(next);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage, hasMore, loading, fetchPage, scrollThreshold]);

  // Debounced search
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setActiveSearch(val.trim());
    }, DEBOUNCE_MS);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(debounceRef.current);
      setActiveSearch(searchInput.trim());
    }
  };

  const toggleSort = () => setSortDirection((d) => d === 'asc' ? 'desc' : 'asc');

  const visible = resources.filter((r) => !r.isPlaceholder);

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={clsx('container', styles.errorBox)}>⚠️ Error loading {resourceLabel.toLowerCase()}: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <div className={styles.counter}>
          Showing <strong>{visible.length}</strong> {resourceLabel}
          {hasMore && ' (loading more…)'}
        </div>

        <form className={styles.filterForm} onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Search title, author, description…"
            className={styles.searchInput}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="modified">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>

          <button
            type="button"
            className={clsx(styles.button, styles.buttonPrimary)}
            aria-label={`Sort direction ${sortDirection}`}
            onClick={toggleSort}
            title={`Toggle sort (${sortDirection})`}
          >
            {sortDirection === 'asc' ? (
              <HiOutlineSortAscending size={22} />
            ) : (
              <HiOutlineSortDescending size={22} />
            )}
          </button>
        </form>

        <ResourceList resources={resources} defaultImage={defaultImage} />

        {!loading && visible.length === 0 && (
          <div className={styles.empty}>No {resourceLabel.toLowerCase()} found</div>
        )}
      </div>
    </div>
  );
}

ResourceBrowser.propTypes = {
  keyword: PropTypes.string,
  resourceLabel: PropTypes.string,
  defaultImage: PropTypes.string,
};
```

---

### 3. `/src/api/hydroshareAPI.js`
**Purpose:** Interface with HydroShare's REST API

**Key Functions:**

#### `fetchResourcesBySearch()` - Main search function
```javascript
async function fetchResourcesBySearch(
  keyword,        // Subject tag (e.g., "nwm_portal_app")
  searchText,     // Full-text search query
  ascending,      // Sort direction
  sortBy,         // Sort field
  author,         // Author filter
  pageNumber      // Page number (1-based)
) {
  // Build API URL
  let url = `https://www.hydroshare.org/discoverapi/?q=${searchText}&subject=${keyword}`
  
  // Add sorting
  url += `&asc=${ascending ? 1 : -1}`
  if (sortBy) url += `&sort=${sortBy}`
  
  // Add pagination
  url += `&pnum=${pageNumber}`
  
  // Add filters
  const filter = {
    author: [author].filter(Boolean),
    subject: [keyword]
  }
  url += `&filter=${JSON.stringify(filter)}`

  // FETCH DATA
  const response = await fetch(url)
  const data = await response.json()

  // PARSE RESPONSE
  // HydroShare sometimes returns resources as JSON string
  let resources = typeof data.resources === "string" 
    ? JSON.parse(data.resources) 
    : data.resources

  // NORMALIZE STRUCTURE
  return resources.map(resource => ({
    resource_id: resource.short_id,
    resource_title: resource.title,
    authors: resource.authors,
    resource_type: resource.type,
    resource_url: 'https://www.hydroshare.org' + resource.link,
    abstract: resource.abstract,
    date_created: resource.created,
    date_last_updated: resource.modified,
  }))
}
```

#### `fetchResourceCustomMetadata()` - Fetch extended metadata
```javascript
async function fetchResourceCustomMetadata(resourceId) {
  // Fetch extended metadata from HydroShare
  const url = `https://www.hydroshare.org/hsapi/resource/${resourceId}/scimeta/custom/`
  const response = await fetch(url)
  const data = await response.json()
  
  // Returns object with:
  // {
  //   thumbnail_url: "...",  // Product thumbnail
  //   page_url: "...",       // External website link
  //   docs_url: "..."        // Documentation link
  // }
  return data
}
```

**Relevant Excerpts from Full File:**
```javascript
/**
 * Fetch resources from HydroShare based on search criteria.
 * @param {string} keyword  - The keyword (subject) to use for the api request
 * @param {string} searchText - The text to look for in all the resource fields
 * @param {boolean} ascending - Whether to sort results in ascending order (true) or descending order (false)
 * @param {string} sortBy - The field to sort by. One of 'title', 'author', 'created', 'modified'
 * @param {string} author - The author to filter by
 * @returns {Promise<Array>} Array of resource objects
 */
async function fetchResourcesBySearch(keyword, searchText, ascending=false, sortBy=undefined, author=undefined, pageNumber=1) {
  // API Url with query parameters
  let url = `https://www.hydroshare.org/discoverapi/?q=${encodeURIComponent(searchText)}&subject=${encodeURIComponent(keyword)}`;

  // Add sort order parameter
  if (ascending) {
    url += `&asc=1`;
  } else {
    url += `&asc=-1`;
  }

  // Add sort parameter if provided
  if (sortBy !== undefined) {
    url += `&sort=${encodeURIComponent(sortBy)}`;
  }

  // Convert author name from "First Middle Last" to "Last, First Middle"
  if (author !== undefined) {
    author = convertAuthorToLastFirst(author);
  }

  // Add page number parameter (1-based indexing)
  url += `&pnum=${pageNumber}`;

  // Add filter parameter
  const filter = {
    author: [author].filter(a => a !== undefined),
    subject: [keyword],
  };

  url += `&filter=${encodeURIComponent(JSON.stringify(filter))}`;

  // Fetch data from the API
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching resources (status: ${response.status})`);
  }
  const data = await response.json();

  // Put resources into a corrected format
  let resources;

  if (typeof data.resources === "string") {
    try {
      resources = JSON.parse(data.resources);
    } catch (e) {
      console.error("Failed to parse data.resources as JSON string:", e);
      resources = [];
    }
  } else if (Array.isArray(data.resources)) {
    resources = data.resources;
  } else {
    console.warn("Unexpected format for data.resources:", data.resources);
    resources = [];
  }

  let resourcesCorrected = [];

  for (let i = 0; i < resources.length; i++) {
    let resource = resources[i];
    let resourceCorrected = {
      resource_id: resource.short_id,
      resource_title: resource.title,
      authors: resource.authors,
      resource_type: resource.type,
      resource_url: 'https://www.hydroshare.org' + resource.link,
      abstract: resource.abstract,
      date_created: resource.created,
      date_last_updated: resource.modified,
    };

    resourcesCorrected.push(resourceCorrected);
  }

  // Return the corrected resources
  return resourcesCorrected;
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
```

---

### 4. `/src/components/ResourceBrowser/ResourceList/index.js`
**Purpose:** Simple wrapper that maps resources to ResourceRow components

```javascript
import React from 'react';
import ResourceRow from './ResourceRow';
import styles from './styles.module.css';

/**
 * List wrapper: renders rows in a vertical stack.
 * Expects each resource object to have:
 *   id, title, description, authors, thumbnailUrl,
 *   pageUrl, docsUrl, resourceUrl, isPlaceholder (boolean)
 */
export default function ResourceList({ resources, defaultImage }) {
  return (
    <div className={styles.listContainer}>
      {resources.map(resource => (
        <ResourceRow
          key={resource.id}
          resource={resource}
          defaultImage={defaultImage}
        />
      ))}
    </div>
  );
}
```

**Execution:**
1. Receives array of resources from parent
2. Maps each resource to a `<ResourceRow />` component
3. Passes resource object and defaultImage as props

---

### 5. `/src/components/ResourceBrowser/ResourceList/ResourceRow.js`
**Purpose:** Individual resource card/row display

**Structure:**
```javascript
export default function ResourceRow({ resource, defaultImage }) {
  const {
    id, title, description, authors,
    pageUrl, docsUrl, resourceUrl, isPlaceholder
  } = resource

  // SKELETON RENDERING (during load)
  if (isPlaceholder || !title) {
    return (
      <div className={styles.row}>
        <div className={styles.titlePlaceholder} />
        <div className={styles.authorsPlaceholder} />
        <div className={styles.descPlaceholder} />
      </div>
    )
  }

  // REAL CONTENT RENDERING
  return (
    <div className={styles.row}>
      {/* Left: Content */}
      <div className={styles.content}>
        {/* Title (clickable if pageUrl exists) */}
        <h3 className={styles.title}>
          {pageUrl ? (
            <a href={pageUrl} target="_blank">{title}</a>
          ) : title}
        </h3>

        {/* Meta row: Origin badge + Author chips */}
        <div className={styles.metaRow}>
          <span className={styles.chip}>HydroShare</span>
          {authorChips.map(author => (
            <span className={styles.chip}>
              <span className={styles.chipAvatar}>{author.initials}</span>
              <span className={styles.chipText}>{author.display}</span>
            </span>
          ))}
        </div>

        {/* Description (truncated to 3 lines) */}
        <p className={styles.description}>{description}</p>
      </div>

      {/* Right: Action buttons */}
      <div className={styles.actionsBar}>
        {pageUrl && (
          <a href={pageUrl} className={styles.actionButton}>
            <ExternalLinkIcon />
            <span>Website</span>
          </a>
        )}
        {docsUrl && (
          <a href={docsUrl} className={styles.actionButton}>
            <BookmarkIcon />
            <span>Docs</span>
          </a>
        )}
        {resourceUrl && (
          <a href={resourceUrl} className={styles.actionButton}>
            <FileIcon />
            <span>HydroShare</span>
          </a>
        )}
      </div>
    </div>
  )
}
```

**Author Name Processing:**
```javascript
// Step 1: Split authors string by separators (•, |, ;)
const splitAuthors = (authors || '')
  .split(/[•|;]+/)
  .map(a => a.trim())
  .filter(Boolean)

// Step 2: Reorder from "Last, First" to "First Last"
const reorderName = (name) => {
  const parts = name.split(',')
  if (parts.length >= 2) {
    const last = parts[0].trim()
    const first = parts.slice(1).join(',').trim()
    return `${first} ${last}`.trim()
  }
  return name.trim()
}

// Step 3: Generate initials for avatar
const initialsFrom = (name) => {
  const segs = name.split(' ')
  const first = segs[0] || ''
  const last = segs[segs.length - 1] || ''
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

// Step 4: Create author chips
const authorChips = splitAuthors.map(raw => ({
  raw,
  display: reorderName(raw),
  initials: initialsFrom(reorderName(raw))
}))
```

**Full Source Code:**
```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { LiaExternalLinkSquareAltSolid } from 'react-icons/lia';
import { MdDriveFileMove } from 'react-icons/md';
import { FaBookmark } from 'react-icons/fa';
import styles from './styles.module.css';

/**
 * Single resource row with thumbnail + overlay actions + text content.
 * Renders skeleton placeholders when isPlaceholder=true or title is empty.
 */
export default function ResourceRow({ resource, defaultImage }) {
  const {
    id,
    title,
    description,
    authors,
    pageUrl,
    docsUrl,
    resourceUrl,
    isPlaceholder,
  } = resource;

  // Derive authors list into chips without splitting on commas inside names
  // Prefer separators: bullet •, pipe |, semicolon ;
  const splitAuthors = (authors || '')
    .split(/[•|;]+/)
    .map((a) => a.trim())
    .filter(Boolean);

  // Reorder 'Last, First Middle' -> 'First Middle Last'
  const reorderName = (name) => {
    if (!name) return '';
    const parts = name.split(',');
    if (parts.length >= 2) {
      const last = parts[0].trim();
      const first = parts.slice(1).join(',').trim();
      return `${first} ${last}`.trim();
    }
    return name.trim();
  };

  const initialsFrom = (name) => {
    const cleaned = name.replace(/\s+/g, ' ').trim();
    const segs = cleaned.split(' ');
    const first = segs[0] || '';
    const last = segs[segs.length - 1] || '';
    const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    return initials || cleaned.charAt(0).toUpperCase();
  };

  const authorChips = splitAuthors.map((raw) => {
    const display = reorderName(raw);
    return {
      raw,
      display,
      initials: initialsFrom(display),
    };
  });

  const originLabel = resourceUrl ? 'HydroShare' : undefined;

  // Render skeleton placeholders while loading
  if (isPlaceholder || !title) {
    return (
      <div className={styles.row}>
        <div className={styles.content}>
          <div className={styles.titlePlaceholder} />
          <div className={styles.authorsPlaceholder} />
          <div className={styles.descPlaceholder} />
        </div>
      </div>
    );
  }

  return (
    <div id={id} className={styles.row}>
      {/* Content: title, authors chips, description */}
      <div className={styles.content}>
        <h3 className={styles.title}>
          {pageUrl ? (
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.titleLink}
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>

        {/* Meta row: origin + authors chips */}
        <div className={styles.metaRow}>
          {originLabel && <span className={styles.chip}>{originLabel}</span>}
          {authorChips.length > 0 && (
            <div className={styles.chips} aria-label="Authors">
              {authorChips.map((a, idx) => (
                <span key={`${id}-author-${idx}`} className={styles.chip} title={a.display}>
                  <span className={styles.chipAvatar} aria-hidden="true">{a.initials}</span>
                  <span className={styles.chipText}>{a.display}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {description && <p className={styles.description}>{description}</p>}
      </div>

      {/* Persistent actions on the right */}
      <div className={styles.actionsBar} aria-label="Resource actions">
        {pageUrl && (
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
            title="Visit website"
            aria-label="Visit website"
          >
            <LiaExternalLinkSquareAltSolid size={22} />
            <span className={styles.actionLabel}>Website</span>
          </a>
        )}
        {docsUrl && (
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
            title="Documentation"
            aria-label="Documentation"
          >
            <FaBookmark size={18} />
            <span className={styles.actionLabel}>Docs</span>
          </a>
        )}
        {resourceUrl && (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
            title="Resource page"
            aria-label="Resource page"
          >
            <MdDriveFileMove size={22} />
            <span className={styles.actionLabel}>HydroShare</span>
          </a>
        )}
      </div>
    </div>
  );
}

ResourceRow.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    authors: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    pageUrl: PropTypes.string,
    docsUrl: PropTypes.string,
    resourceUrl: PropTypes.string,
    isPlaceholder: PropTypes.bool,
  }).isRequired,
  defaultImage: PropTypes.string,
};
```

---

## 🎨 Styling System

### CSS Modules Architecture
- Each component has its own `.module.css` file
- Classes are scoped to prevent conflicts
- Dark mode handled via `html[data-theme='dark']` selectors

### Key CSS Files

#### `/src/components/ResourceBrowser/styles.module.css`
```css
.wrapper {
	width: 100%;
	padding: 3rem 0;
	background: var(--background, #fff);
}

.counter {
	margin-bottom: 0.75rem;
	font-size: 1rem;
	font-weight: 600;
	color: var(--text, #222);
}

.filterForm {
	display: flex;
	gap: 0.75rem;
	flex-wrap: wrap;
	margin-bottom: 1.25rem;
}

.searchInput {
	flex: 1;
	min-width: 240px;
	padding: 0.7rem 0.9rem;
	border: 1px solid var(--border, #ddd);
	border-radius: 6px;
	font-size: 1rem;
}

.sortSelect {
	min-width: 180px;
	padding: 0.7rem 0.9rem;
	border: 1px solid var(--border, #ddd);
	border-radius: 6px;
	font-size: 1rem;
	background: var(--surface, #fff);
}

.button {
	padding: 0.55rem 0.7rem;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.15s ease;
}

.button:hover { transform: scale(1.05); }

.buttonPrimary {
	background: var(--primary, #0d6efd);
	color: #fff;
}

.empty {
	text-align: center;
	color: #666;
	padding: 2rem 0;
}

.errorBox {
	background: #fee;
	border: 1px solid #fcc;
	border-radius: 8px;
	padding: 1rem;
	color: #b22;
}

/* Dark mode – respect Docusaurus theme toggle */
html[data-theme='dark'] .wrapper { background: var(--background, #1b1b1b); }
html[data-theme='dark'] .counter { color: var(--text, #e6e6e6); }
html[data-theme='dark'] .searchInput,
html[data-theme='dark'] .sortSelect {
	background: var(--surface, #2a2a2a);
	border-color: var(--border, #444);
	color: var(--text, #e6e6e6);
}
html[data-theme='dark'] .empty { color: #aaa; }
```

#### `/src/components/ResourceBrowser/ResourceList/styles.module.css`
```css
.listContainer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Row shell */
.row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 10px;
  background: var(--surface, #fff);
}

/* Actions bar (persistent on the right) */
.actionsBar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.actionButton {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  background: var(--surface-2, #f8f9fa);
  color: var(--text, #222);
  text-decoration: none;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.actionButton:hover {
  background: var(--surface-3, #f1f3f5);
  border-color: var(--border-strong, #d0d7de);
}

.actionLabel {
  font-size: 0.9rem;
}

/* Content area */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text, #222);
}

.titleLink {
  color: inherit;
  text-decoration: none;
}

.titleLink:hover { text-decoration: underline; }

.metaRow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--muted, #555);
  background: var(--surface-2, #f8f9fa);
}

.chipAvatar {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--muted, #666);
  background: var(--surface-3, #eef2f6);
  border: 1px solid var(--border, #dce3ea);
}

.chipText {
  line-height: 1;
}

.description {
  margin: 0.25rem 0 0;
  font-size: 1rem;
  color: var(--muted, #666);
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;      /* limit to 3 lines */
  line-clamp: 3;              /* standard property for compatibility */
  -webkit-box-orient: vertical;
}

/* Skeleton placeholders */
.titlePlaceholder,
.authorsPlaceholder,
.descPlaceholder {
  background: linear-gradient(
    90deg,
    var(--skeleton-base, #e0e0e0) 25%,
    var(--skeleton-shine, #f0f0f0) 50%,
    var(--skeleton-base, #e0e0e0) 75%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}

.titlePlaceholder {
  width: 60%;
  height: 1.6rem;
}

.authorsPlaceholder {
  width: 40%;
  height: 1rem;
  margin-top: 0.4rem;
}

.descPlaceholder {
  width: 100%;
  height: 3.2rem;
  margin-top: 0.4rem;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* Responsive */
@media (max-width: 768px) {
  .row { flex-direction: column; }
  .actionsBar { margin-top: 0.5rem; }
}

/* Dark mode – respect Docusaurus theme toggle */
html[data-theme='dark'] .row {
  background: var(--surface, #222);
  border-color: var(--border, #444);
}

html[data-theme='dark'] .title {
  color: var(--text, #e6e6e6);
}

html[data-theme='dark'] .description {
  color: var(--muted, #aaa);
}

html[data-theme='dark'] .chip {
  border-color: var(--border, #444);
  background: var(--surface-2, #2a2a2a);
  color: var(--muted, #c2c2c2);
}

html[data-theme='dark'] .chipAvatar {
  background: var(--surface-3, #3a3a3a);
  border-color: var(--border, #555);
  color: var(--muted, #ddd);
}

html[data-theme='dark'] .titlePlaceholder,
html[data-theme='dark'] .authorsPlaceholder,
html[data-theme='dark'] .descPlaceholder {
  background: linear-gradient(
    90deg,
    var(--skeleton-base, #333) 25%,
    var(--skeleton-shine, #444) 50%,
    var(--skeleton-base, #333) 75%
  );
  background-size: 400% 100%;
}

html[data-theme='dark'] .actionButton {
  background: var(--surface-2, #2a2a2a);
  border-color: var(--border, #444);
  color: var(--text, #e6e6e6);
}

html[data-theme='dark'] .actionButton:hover {
  background: var(--surface-3, #333);
  border-color: var(--border-strong, #555);
}
```

---

## 🔍 Debugging Guide

### Common Issues & Solutions

#### 1. No resources showing
**Debug Steps:**
```javascript
// In ResourceBrowser/index.js, add console logs:
console.log('Keyword:', keyword)
console.log('Raw API response:', raw)
console.log('Normalized resources:', normalized)
console.log('Final resources state:', resources)

// Test HydroShare API directly in browser:
// https://www.hydroshare.org/discoverapi/?subject=nwm_portal_app
```

#### 2. Metadata not loading (no buttons)
**Debug Steps:**
```javascript
// In fetchPage function, add:
console.log('Fetching metadata for:', item.id)
console.log('Metadata response:', meta)

// Test HydroShare custom metadata endpoint directly:
// https://www.hydroshare.org/hsapi/resource/{RESOURCE_ID}/scimeta/custom/
```

#### 3. Search not working
**Debug Steps:**
```javascript
// In handleSearchChange:
console.log('Search input:', searchInput)
console.log('Active search:', activeSearch)  // Should update after 1s

// In fetchResourcesBySearch:
console.log('API URL:', url)
```

#### 4. Infinite scroll not triggering
**Debug Steps:**
```javascript
// In scroll useEffect:
useEffect(() => {
  const onScroll = () => {
    console.log('Scroll position:', {
      scrollTop: document.documentElement.scrollTop,
      clientHeight: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
      threshold: scrollThreshold,
      hasMore,
      loading,
      fetching: fetchingRef.current
    })
  }
  // ...
}, [])
```

#### 5. Styling issues
**Debug Steps:**
```javascript
// Verify CSS modules import:
import styles from './styles.module.css'

// Check dark mode in browser DevTools:
// <html data-theme="dark"> or <html data-theme="light">

// Verify CSS custom properties in DevTools Styles panel:
// --text, --surface, --border values
```

---

## 🚀 Performance Optimizations

1. **Placeholder Skeletons** - Show immediately while fetching
2. **Debounced Search** - Prevents API spam (1000ms delay)
3. **Lazy Metadata Enrichment** - Fetches extended data after initial load
4. **Infinite Scroll** - Loads more data as user scrolls (800px threshold)
5. **Memoized Callbacks** - `useCallback` prevents unnecessary re-renders
6. **Fetch Guard** - `fetchingRef` prevents duplicate requests

---

## 📊 Data Flow Summary

| User Action | State Change | Effect |
|-------------|--------------|--------|
| Page Load | `keyword` set | `fetchPage(1, true)` |
| Type in Search | `searchInput` updates | (debounced) |
| Wait 1s / Press Enter | `activeSearch` updates | `fetchPage(1, true)` |
| Change Sort Field | `sortBy` updates | `fetchPage(1, true)` |
| Toggle Sort Direction | `sortDirection` updates | `fetchPage(1, true)` |
| Scroll Near Bottom | `currentPage++` | `fetchPage(nextPage)` |
| Metadata Loads | `resources` updated | Re-render with buttons |

---

## 🔗 External Dependencies

- **HydroShare Discovery API:** `https://www.hydroshare.org/discoverapi/`
- **HydroShare Resource API:** `https://www.hydroshare.org/hsapi/resource/`
- **Docusaurus Tabs:** `@theme/Tabs` and `@theme/TabItem`
- **React Icons:**
  - `react-icons/hi` - Sort icons
  - `react-icons/lia` - External link icon
  - `react-icons/md` - File move icon
  - `react-icons/fa` - Bookmark icon

---

## 📝 Configuration in docusaurus.config.js

The Resources page is accessible via the top navigation bar as "Community Resources":

```javascript
navbar: {
  items: [
    // ... other items
    {
      href: "/resources",
      label: "Community Resources",
      position: "left",
    },
    // ... other items
  ],
},
```

And in the footer Quick Links:

```javascript
footer: {
  links: [
    {
      title: 'Quick Links',
      items: [
        {
          label: 'Community Resources',
          href: '/resources'
        },
        // ... other items
      ]
    },
    // ... other sections
  ]
}
```

---

## ✅ Testing Checklist

- [ ] Resources load on initial page visit
- [ ] Search filters results correctly
- [ ] Sort options work (modified, created, title, author)
- [ ] Sort direction toggle works
- [ ] Infinite scroll loads more pages
- [ ] Metadata buttons appear after enrichment
- [ ] Dark mode styles apply correctly
- [ ] Responsive design works on mobile
- [ ] All 4 tabs load independently
- [ ] External links open in new tab
- [ ] Skeleton placeholders display during loading
- [ ] Error messages display on API failure
- [ ] "No resources found" message displays when appropriate

---

## 🎯 HydroShare Keywords Reference

| Tab | Keyword | Description |
|-----|---------|-------------|
| Resources | `nwm_portal_app` | Web applications and tools |
| Courses | `nwm_portal_module` | Learning modules and courses |
| Presentations | `ciroh_portal_presentation` | Conference presentations |
| Datasets | `ciroh_portal_data` | Data collections |

---

## 🛠️ Development Commands

```bash
# Start development server
npm run start

# Build for production
npm run build

# Serve production build locally
npm run serve
```

---

## 📦 Component Props Reference

### ResourceBrowser
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keyword` | string | `'nwm_portal_app'` | HydroShare subject filter |
| `resourceLabel` | string | `'Resources'` | Display name for resource type |
| `defaultImage` | string | undefined | Fallback thumbnail image |
| `pageSize` | number | `40` | Resources per page |
| `scrollThreshold` | number | `800` | Pixels from bottom to trigger load |

### ResourceList
| Prop | Type | Description |
|------|------|-------------|
| `resources` | array | Array of resource objects |
| `defaultImage` | string | Fallback thumbnail image |

### ResourceRow
| Prop | Type | Description |
|------|------|-------------|
| `resource` | object | Resource data object |
| `defaultImage` | string | Fallback thumbnail image |

**Resource Object Shape:**
```javascript
{
  id: string,              // Unique identifier
  title: string,           // Resource title
  description: string,     // Abstract/description
  authors: string,         // Authors separated by ' • '
  thumbnailUrl: string,    // Thumbnail image URL
  pageUrl: string,         // External website link
  docsUrl: string,         // Documentation link
  resourceUrl: string,     // HydroShare resource page
  isPlaceholder: boolean   // Loading skeleton flag
}
```

---

## 🔄 State Management Flow

```
Component Mount
      ↓
Initialize State (loading=true, resources=[])
      ↓
Create Placeholder Skeletons
      ↓
Fetch Page 1 from HydroShare
      ↓
Normalize Data Format
      ↓
Update State with Real Resources
      ↓
Start Lazy Metadata Enrichment Loop
      ↓
For Each Resource:
  - Fetch Custom Metadata
  - Update State with Additional URLs
      ↓
User Interacts (search/sort/scroll)
      ↓
Reset to Page 1 OR Load Next Page
      ↓
Repeat Fetch → Normalize → Update Cycle
```

---

## 🎨 CSS Custom Properties Used

```css
/* Light mode defaults */
--background: #fff
--surface: #fff
--surface-2: #f8f9fa
--surface-3: #f1f3f5
--text: #222
--muted: #666
--border: #e0e0e0
--border-strong: #d0d7de
--primary: #0d6efd
--skeleton-base: #e0e0e0
--skeleton-shine: #f0f0f0

/* Dark mode values */
--background: #1b1b1b
--surface: #222
--surface-2: #2a2a2a
--surface-3: #333
--text: #e6e6e6
--muted: #aaa
--border: #444
--border-strong: #555
--skeleton-base: #333
--skeleton-shine: #444
```

---

## 🌐 API Endpoints Reference

### HydroShare Discovery API
**Endpoint:** `https://www.hydroshare.org/discoverapi/`

**Query Parameters:**
- `q` - Full-text search query
- `subject` - Subject/keyword filter
- `asc` - Sort direction (1=ascending, -1=descending)
- `sort` - Sort field (modified, created, title, author)
- `pnum` - Page number (1-based)
- `filter` - JSON encoded filter object

**Example:**
```
https://www.hydroshare.org/discoverapi/?q=streamflow&subject=nwm_portal_app&asc=-1&sort=modified&pnum=1&filter={"author":[],"subject":["nwm_portal_app"]}
```

### HydroShare Custom Metadata API
**Endpoint:** `https://www.hydroshare.org/hsapi/resource/{resource_id}/scimeta/custom/`

**Response:**
```json
{
  "thumbnail_url": "https://example.com/image.png",
  "page_url": "https://example.com/app",
  "docs_url": "https://docs.example.com"
}
```

---

## 📚 Additional Resources

- [HydroShare API Documentation](https://hydroshare.org/hsapi/)
- [Docusaurus Documentation](https://docusaurus.io/)
- [React Hooks Reference](https://react.dev/reference/react)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)

---

**Last Updated:** November 14, 2025  
**Version:** 1.0  
**Maintainer:** CIROH Hub Team
