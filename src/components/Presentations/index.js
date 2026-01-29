import React, { useEffect, useState, startTransition, useCallback, useRef } from "react";
import clsx from "clsx";
import { FaThLarge, FaBars, FaListUl } from "react-icons/fa";
import styles from "./styles.module.css";
import HydroShareResourcesTiles from "@site/src/components/HydroShareResourcesTiles";
import HydroShareResourcesRows from "@site/src/components/HydroShareResourcesRows";
import { 
  fetchResource,
  fetchResourcesBySearch,
  fetchKeywordPageData, 
  getCuratedIds,
  fetchResourceCustomMetadata, 
  joinExtraResources 
} from "../HydroShareImporter";
import { useColorMode } from "@docusaurus/theme-common"; // Hook to detect theme
import DatasetLightIcon from '@site/static/img/cards/datasets_logo_light.png';
import DatasetDarkIcon from '@site/static/img/cards/datasets_logo_dark.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { MdFilterList } from "react-icons/md";
import {
  HiOutlineSortDescending,
  HiOutlineSortAscending,
} from 'react-icons/hi';

// Pagination
const PAGE_SIZE        = 40;
const SCROLL_THRESHOLD = 800;

// Search input debounce
let   debounceTimer    = null;
const DEBOUNCE_MS      = 1_000;

// Maps a resource list to the internal format, including custom metadata
const mapWithCustomMetadata = 
  async (resourceList, hs_icon) => {
    const mapping = await Promise.all(resourceList.map(async (res) => {
      let customMetadata = null;
      try {
        customMetadata = await fetchResourceCustomMetadata(res.resource_id);
      } catch (metadataErr) {
        console.error(`Error fetching metadata: ${metadataErr.message}`);
      }
      let embedUrl = "";
      if (customMetadata?.pres_path) embedUrl = `https://www.hydroshare.org/resource/${res.resource_id}/data/contents/${customMetadata.pres_path}`;
      return {
        resource_id: res.resource_id,
        title: res.resource_title,
        authors: res.authors.map(
          (author) => author.split(',').reverse().join(' ')
        ).join(' 🖊️ '),
        resource_type: res.resource_type,
        resource_url: res.resource_url,
        description: res.abstract || "No description available.",
        date_created: res.date_created || "",
        date_last_updated: res.date_last_updated || "",
        thumbnail_url: customMetadata?.thumbnail_url || hs_icon,
        page_url: customMetadata?.page_url || "",
        docs_url: customMetadata?.docs_url || "",
        embed_url: embedUrl,
      }
    }));
    return mapping;
  };

// Helper function to search within a raw resource
const searchRawResource = (resource, searchTerm) => {
  const searchTermLower = searchTerm.toLowerCase();
  const searchFields = [
    resource.resource_title,
    resource.abstract,
    resource.authors.join(' '),
    resource.date_created,
    resource.date_last_updated,
  ];
  return searchFields.some(field => 
    field?.toLowerCase().includes(searchTermLower)
  );
};

// Fetch the curated resources first (from the "parent" resource).
const fetchRawCuratedResources =
  async (curatedParentId) => {
    try {
      const curatedIds = await getCuratedIds(curatedParentId);

      const curatedList = await Promise.all(curatedIds.map(async (id) => {
        const resource = await fetchResource(id);
        return resource;
      }));

      return curatedList;
    } catch (err) {
      console.error("Error fetching curated resources:", err);
      return [];
    }
  };

export default function Presentations({ community_id = 4 }) {
  const { colorMode } = useColorMode(); // Get the current theme
  const hs_icon = colorMode === 'dark' ? DatasetDarkIcon : DatasetLightIcon;
  const CURATED_PARENT_ID = "200fa86bea61438aa862d437103485db";
  // The name is a holdover from the "datasets" tab. This "curated" list actually serves as a
  // backwards compatibility layer to ensure that older presentations can be included in this tab.

  const PLACEHOLDER_ITEMS = 10;
  const initialPlaceholders = Array.from({ length: PLACEHOLDER_ITEMS }).map((_, index) => ({
    resource_id: `placeholder-${index}`,
    title: "",
    authors: "",
    resource_type: "",
    resource_url: "",
    description: "",
    thumbnail_url: "",
    page_url: "",
    docs_url: "",
    embed_url: "",
  }));

  // State
  const [resources, setResources] = useState(initialPlaceholders);   // all resources
  const [collections, setCollections] = useState(initialPlaceholders);
  //const [curatedResources, setCuratedResources] = useState(initialPlaceholders); // Deprecated
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("row");
  const [activeTab, setActiveTab] = useState("presentations");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const fetching = useRef(false);

  // Search State
  const [searchInput,    setSearchInput]    = useState('');
  const [filterSearch,   setFilterSearch]   = useState('');
  const [sortType,       setSortType]       = useState('modified');
  const [sortDirection,  setSortDirection]  = useState('desc');

  // Helper function to determine if search is active
  const usingSearch = useCallback(() => filterSearch.trim() !== '', [filterSearch]);

  // Helper function to add placeholder resources for loading state
  const addPlaceholderResources = useCallback((page) => {
    setResources(prev => [
      ...prev,
      ...Array.from({ length: PAGE_SIZE }, (_, i) => ({
        resource_id: `placeholder-page${page}-${i}`,
        title: "",
        authors: "",
        resource_type: "",
        resource_url: "",
        description: "",
        thumbnail_url: "",
        page_url: "",
        docs_url: "",
      }))
    ]);
  }, []);


  const fetchAll = useCallback(
    async (page) => {
      if (fetching.current) return;
      fetching.current = true;

      try {
        // Add placeholders for loading state (only for pagination, not first page)
        if (page > 1) {
          addPlaceholderResources(page);
        }

        // Search parameters
        const ascending = sortDirection === 'asc';

        // Retrieve resources
        let [rawCuratedResources, invKeywordResources, invCollections, pageData] = await Promise.all([
          fetchRawCuratedResources(CURATED_PARENT_ID), // get array of curated resource IDs
          fetchResourcesBySearch('ciroh_portal_presentation', filterSearch, ascending, sortType, undefined, page),
          fetchResourcesBySearch('ciroh_portal_pres_collections', filterSearch, ascending, sortType, undefined, page),
          fetchKeywordPageData('ciroh_portal_presentation', filterSearch, ascending, sortType, undefined)
        ]);

        // Set last page
        setLastPage(pageData.pageCount);
        
        // Apply search filtering to curated resources
        if (usingSearch()) {
          rawCuratedResources = rawCuratedResources.filter(res => searchRawResource(res, filterSearch));
        }

        const rawKeywordResources = invKeywordResources.reverse(); // Reverse chronological order
        const rawCollections = invCollections.reverse();
        let rawResources = joinExtraResources(rawKeywordResources, rawCuratedResources); // Merge ensures backwards compatibility for presentations predating the keyword

        if (sortType === 'author') {
          for (let i = 0; i < rawResources.length; i++) {
            rawResources[i].authorSort = rawResources[i].authors.map(author => author.split(',').reverse().join(' ')).join(' 🖊️ ');
          }
        }

        // Apply client-side sorting so curated resources are in the correct order
        rawResources = rawResources.sort((a, b) => {
          let comparison = 0;
          
          switch (sortType) {
            case 'modified':
              comparison = a.date_last_updated.localeCompare(b.date_last_updated);
              break;
            case 'created':
              comparison = a.date_created.localeCompare(b.date_created);
              break;
            case 'title':
              comparison = a.resource_title.localeCompare(b.resource_title);
              break;
            case 'author':
              const aAuthors = a.authorSort;
              const bAuthors = b.authorSort;
              comparison = aAuthors.localeCompare(bAuthors);
              break;
            default:
              comparison = 0;
              break;
          }
          
          // Apply sort direction
          return sortDirection === 'asc' ? comparison : -comparison;
        });

        // Map the full resource lists to your internal format (with custom metadata)
        const mappedResources = await mapWithCustomMetadata(rawResources, hs_icon);
        const mappedCollections = await mapWithCustomMetadata(rawCollections, hs_icon);
        
        // Handle first page vs pagination
        if (page === 1) {
          setResources(mappedResources);
        } else {
          setResources(prev => [
            ...prev.filter(r => !r.resource_id.startsWith('placeholder-')),
            ...mappedResources
          ]);
        }

        setCollections(mappedCollections);
        //setCuratedResources(mappedCurated);

        setLoading(false);
      } catch (err) {
        console.error(`Error fetching resources: ${err.message}`);
        setError(err.message);
        setLoading(false);
      }
      finally {
        fetching.current = false;
      }
    },
    [addPlaceholderResources, hs_icon, sortDirection, sortType, filterSearch, usingSearch]
  );

  const fetchPage = useCallback(
    async (page) => {
      if (fetching.current) return;
      fetching.current = true;

      try {
        // Add placeholders for loading state (only for pagination, not first page)
        if (page > 1) {
          addPlaceholderResources(page);
        }

        // Search parameters
        const ascending = sortDirection === 'asc';

        // Retrieve resources
        let [invKeywordResources, pageData] = await Promise.all([
          fetchResourcesBySearch('ciroh_portal_presentation', filterSearch, ascending, sortType, undefined, page),
          fetchKeywordPageData('ciroh_portal_presentation', filterSearch, ascending, sortType, undefined)
        ]);

        // Set last page
        setLastPage(pageData.pageCount);

        const rawKeywordResources = invKeywordResources.reverse(); // Reverse chronological order

        // Map the full resource lists to your internal format (with custom metadata)
        const mappedResources = await mapWithCustomMetadata(rawKeywordResources, hs_icon);
        
        // Handle first page vs pagination
        if (page === 1) {
          setResources(mappedResources);
        } else {
          setResources(prev => [
            ...prev.filter(r => !r.resource_id.startsWith('placeholder-')),
            ...mappedResources
          ]);
        }

        //setCuratedResources(mappedCurated);

        setLoading(false);
      } catch (err) {
        console.error(`Error fetching resources: ${err.message}`);
        setError(err.message);
        setLoading(false);
      }
      finally {
        fetching.current = false;
      }
    },
    [addPlaceholderResources, hs_icon, sortDirection, sortType, filterSearch]
  );

  // Reset and load first page when filters change
  useEffect(() => {
    setResources(initialPlaceholders);
    setCurrentPage(1);
    
    // Reset the fetching flag to allow new requests
    fetching.current = false;
    
    fetchAll(1); // Use fetchAll for first page (includes curated resources)
  }, [filterSearch, sortDirection, sortType, fetchAll]);

  /* infinite scroll */
  useEffect(() => {
    const onScroll = () => {
      // Check if we can fetch more pages
      if (fetching.current || currentPage >= lastPage) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchPage(next);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage, lastPage, fetchPage]);

  /* search helpers */
  const commitSearch = q => {
    clearTimeout(debounceTimer);
    setFilterSearch(q.trim());
  };

  const handleKeyUp   = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => commitSearch(searchInput), DEBOUNCE_MS);
  };
  const handleKeyPress = () => clearTimeout(debounceTimer);
  const handleKeyDown  = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitSearch(searchInput);
    }
  };
  const handleBlur = () => commitSearch(searchInput);

  const getFilteredResourceCount = () => {
    if (activeTab === "presentations") {
      return resources.filter(r => !r.resource_id.startsWith('placeholder-')).length;
    } else {
      return collections.filter(r => !r.resource_id.startsWith('placeholder-')).length;
    }
  }

  const getTotalResourceCount = () => {
    if (activeTab === "presentations") {
      return resources.filter(r => !r.resource_id.startsWith('placeholder-')).length;
    } else {
      return collections.filter(r => !r.resource_id.startsWith('placeholder-')).length;
    }
  }

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  /* ---------------- render ---------------- */
  return (
    <div className={clsx(styles.wrapper)}>
      <div className={clsx("container", "margin-bottom--lg")}>
        {/* Counter */}
        <div className={styles.counterRow}>
          Showing&nbsp;
          <strong>{getFilteredResourceCount()}</strong>
          &nbsp;Presentations
          {!loading && (
            <> of <strong>{getTotalResourceCount()}</strong></>
          )}
        </div>

        {/* Search Form */}
        <form
          className={styles.filterForm}
          onSubmit={e => { e.preventDefault(); commitSearch(searchInput); }}
        >
          <input
            type="text"
            placeholder="Search by Title, Author, Description..."
            className={styles.searchInput}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyUp={handleKeyUp}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />

          <select
            value={sortType}
            onChange={e => setSortType(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="modified">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="title">Title</option>
            <option value="author">Authors</option>
          </select>

          <button
            type="button"
            className={clsx('button', styles.button, styles.buttonPrimary)}
            aria-label={`Sort direction ${sortDirection}`}
            onClick={() =>
              startTransition(() =>
                setSortDirection(d => (d === 'asc' ? 'desc' : 'asc')),
              )
            }
          >
            {sortDirection === 'asc'
              ? <HiOutlineSortAscending size={25} className={styles.sortIcon} />
              : <HiOutlineSortDescending size={25} className={styles.sortIcon} />}
          </button>
        </form>

        {/* Toggle between grid view & list view */}
        <div className={styles.header}>
          <div className={styles.viewToggle}>
            <button
              className={clsx(styles.toggleButton, { [styles.active]: view === "grid" })}
              onClick={() => setView("grid")}
              title="Grid View"
            >
              <FaThLarge size={18} />
            </button>
            <button
              className={clsx(styles.toggleButton, { [styles.active]: view === "row" })}
              onClick={() => setView("row")}
              title="List View"
            >
              <FaBars size={18} />
            </button>
          </div>
        </div>

        {/* Tabs for "Presentations" and "Collections" */}
        <Tabs className={styles.contributeTabs}
          defaultValue="presentations"
          onChange={(value) => setActiveTab(value)}
        >
          <TabItem
            value="presentations"
            label={
              <span className={styles.tabLabel} onClick={() => setActiveTab('presentations')}>
                <FaListUl className={styles.tabIcon} /> Presentations
              </span>
            }
            default
          >
            {view === "grid" ? (
              <HydroShareResourcesTiles resources={resources} loading={loading} />
            ) : (
              <HydroShareResourcesRows resources={resources} loading={loading} />
            )}
          </TabItem>

          <TabItem
            value="collections"
            label={
              <span className={styles.tabLabel} onClick={() => setActiveTab('collections')}>
                <MdFilterList className={styles.tabIcon} /> Collections
              </span>
            }
          >
            {view === "grid" ? (
              <HydroShareResourcesTiles resources={collections} loading={loading} />
            ) : (
              <HydroShareResourcesRows resources={collections} loading={loading} />
            )}
          </TabItem>
        </Tabs>

        {/* empty */}
        {!loading && getFilteredResourceCount() === 0 && (
            <p className={styles.emptyMessage}>No&nbsp;Resources&nbsp;Found</p>
          )}
      </div>
    </div>
  );
}