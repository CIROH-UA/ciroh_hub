import React, { useEffect, useState, startTransition, useCallback, useRef } from "react";
import clsx from "clsx";
import { FaThLarge, FaBars, FaListUl } from "react-icons/fa";
import styles from "./styles.module.css";
import HydroShareResourcesTiles from "@site/src/components/HydroShareResourcesTiles";
import HydroShareResourcesRows from "@site/src/components/HydroShareResourcesRows";
import { getCommunityResources, getCuratedIds,fetchResourceCustomMetadata } from "@site/src/components/HydroShareImporter";
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

// Curated Parent Resource ID
const CURATED_PARENT_ID = "302dcbef13614ac486fb260eaa1ca87c";

// Helper function to sort resources
const sortResources = (resourceList, sortType, sortDirection) => {
  return resourceList.sort((a, b) => {
    // Keep placeholders at the beginning during loading
    if (a.resource_id.startsWith('placeholder-')) return -1;
    if (b.resource_id.startsWith('placeholder-')) return 1;
    
    let comparison = 0;
    
    switch (sortType) {
      case 'modified':
        comparison = a.date_last_updated.localeCompare(b.date_last_updated);
        break;
      case 'created':
        comparison = a.date_created.localeCompare(b.date_created);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'author':
        comparison = a.authors.localeCompare(b.authors);
        break;
      default:
        comparison = 0;
        break;
    }
    // Apply sort direction
    return sortDirection === 'asc' ? comparison : -comparison;
  });
};

// Fetch the curated IDs first (from the "parent" resource).
const fetchCuratedIds = async () => {
  try {
    const curatedIds = await getCuratedIds(CURATED_PARENT_ID);
    return curatedIds;
  } catch (err) {
    console.error("Error fetching curated IDs:", err);
    return [];
  }
};

export default function Datasets({ community_id = 4 }) {
  const { colorMode } = useColorMode(); // Get the current theme
  const hs_icon = colorMode === 'dark' ? DatasetDarkIcon : DatasetLightIcon;

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
    docs_url: ""
  }));

  // State
  const [resources, setResources] = useState(initialPlaceholders);   // all resources
  const [curatedResources, setCuratedResources] = useState([]);     // subset for the curated tab
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("row");
  const [activeTab, setActiveTab] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const fetching = useRef(false);
  const lastFetchedPage = useRef(0); // Track the highest page number fetched
  const fetchedPages = useRef(new Set()); // Track fetched pages

  // Search State
  const [searchInput,    setSearchInput]    = useState('');
  const [filterSearch,   setFilterSearch]   = useState('');
  const [sortType,       setSortType]       = useState('modified');
  const [sortDirection,  setSortDirection]  = useState('desc');

  // Fetch all resources by group, then filter them based on curated IDs
  const fetchAll = useCallback(
    async (page) => {
      // Prevent concurrent fetches
      if (fetching.current) return;
      
      // Prevent refetching same or lower page numbers
      if (page <= lastFetchedPage.current) {
        return;
      }

      if (fetchedPages.current.has(page)) {
        return;
      }
      
      fetching.current = true;

      // Add placeholders for loading state (only for pagination, not first page)
      if (page > 1) {
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
      }

      // Search Parameters
      const fullTextSearch = filterSearch.length > 0 ? filterSearch : undefined;
      const ascending = sortDirection === 'asc' ? true : false;
      const sortBy = sortType;

      // Fetch Resources
      try {
        const [curatedIds, communityResourcesResponse] = await Promise.all([
          fetchCuratedIds(),                // get array of curated resource IDs
          getCommunityResources("ciroh_portal_data", "4", fullTextSearch, ascending, sortBy, undefined, page, PAGE_SIZE) // get all resources for the group
        ]);

        const resourceList = communityResourcesResponse.resources;
        fetchedPages.current.add(page);

        // Update pagination state
        setHasMore(communityResourcesResponse.groupResourcesPageData.hasMorePages || communityResourcesResponse.extraResourcesPageData.hasMorePages);

        // Map the full resource list to your internal format
        let mappedList = resourceList.map((res) => ({
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
          thumbnail_url: hs_icon,
          page_url: "",
          docs_url: ""
        }));
        
        // Sort locally to account for curated resources
        mappedList = sortResources(mappedList, sortBy, sortDirection);

        if (page === 1) {
          setResources(mappedList);
        } else {
          // Replace placeholders from this page with actual data
          setResources(prev => [
            ...prev.filter(r => !r.resource_id.startsWith('placeholder-')),
            ...mappedList
          ]);
        }

        // Filter to get only curated subset from current page
        let curatedSubset = mappedList.filter(item =>
          curatedIds.includes(item.resource_id)
        );

        curatedSubset = sortResources(curatedSubset, sortBy, sortDirection);
        
        // Accumulate curated resources across pages (like main resources)
        if (page === 1) {
          setCuratedResources(curatedSubset);
        } else {
          // Replace placeholders from this page with actual data
          setCuratedResources(prev => [
            ...prev.filter(r => !r.resource_id.startsWith('placeholder-')),
            ...curatedSubset
          ]);
        }
        setLoading(false);

        // Update the last fetched page tracker (only if this page is higher)
        if (page > lastFetchedPage.current) {
          lastFetchedPage.current = page;
        }

        // Allow pagination to continue - core data is loaded
        fetching.current = false;

        // Fetch metadata
        for (let res of mappedList) {
          try {
            const customMetadata = await fetchResourceCustomMetadata(res.resource_id);
            
            const updatedResource = {
              ...res,
              thumbnail_url: customMetadata?.thumbnail_url || hs_icon,
              page_url: customMetadata?.page_url || "",
              docs_url: customMetadata?.docs_url || "",

            };

            setResources((current) =>
              current.map((item) =>
                item.resource_id === updatedResource.resource_id ? updatedResource : item
              )
            );
          } catch (metadataErr) {
            console.error(`Error fetching metadata: ${metadataErr.message}`);
          }
        }
      } catch (err) {
        console.error(`Error fetching resources: ${err.message}`);
        setError(err.message);
        setLoading(false);
        fetching.current = false;
      }
    },
    [filterSearch, sortDirection, sortType, hs_icon]
  );

  // Reset and load first page when filters change
  useEffect(() => {
    setResources(initialPlaceholders);
    setCuratedResources(initialPlaceholders);
    setCurrentPage(1);
    setHasMore(true);
    
    // Reset the fetching flag to allow new requests
    fetching.current = false;
    
    // Reset the last fetched page tracker
    lastFetchedPage.current = 0;
    
    // Reset the fetched pages set
    fetchedPages.current.clear();
    
    // Fetch first page with new filters
    fetchAll(1);
  }, [filterSearch, sortDirection, sortType, fetchAll]);

  /* infinite scroll */
  useEffect(() => {
    const onScroll = () => {
      if (fetching.current || !hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchAll(next);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage, hasMore, fetchAll]);

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
    if (activeTab === "all") {
      return resources.filter(r => !r.resource_id.startsWith('placeholder-')).length;
    } else {
      return curatedResources.filter(r => !r.resource_id.startsWith('placeholder-')).length;
    }
  }

  const getTotalResourceCount = () => {
    if (activeTab === "all") {
      return resources.filter(r => !r.resource_id.startsWith('placeholder-')).length;
    } else {
      return curatedResources.filter(r => !r.resource_id.startsWith('placeholder-')).length;
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
          &nbsp;Datasets
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

        {/* Tabs for "All" and "Curated" */}
        <Tabs 
          className={styles.contributeTabs}
          defaultValue="all"
          onTabChange={(value) => setActiveTab(value)}
        >
          <TabItem
            value="all"
            label={
              <span className={styles.tabLabel} onClick={() => setActiveTab('all')}>
                <FaListUl className={styles.tabIcon} /> All
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
            value="curated"
            label={
              <span className={styles.tabLabel} onClick={() => setActiveTab('curated')}>
                <MdFilterList className={styles.tabIcon} /> Curated
              </span>
            }
          >
            {view === "grid" ? (
              <HydroShareResourcesTiles resources={curatedResources} loading={loading} />
            ) : (
              <HydroShareResourcesRows resources={curatedResources} loading={loading} />
            )}
          </TabItem>
        </Tabs>

        {/* Empty state */}
        {!loading && getFilteredResourceCount() === 0 && (
          <p className={styles.emptyMessage}>No&nbsp;Resources&nbsp;Found</p>
        )}
      </div>
    </div>
  );
}
