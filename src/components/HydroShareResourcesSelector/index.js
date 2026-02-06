import React, { useEffect, useState, startTransition, useRef, useCallback } from "react";
import clsx from "clsx";
import { FaThLarge, FaBars } from "react-icons/fa";
import styles from "./styles.module.css";
import HydroShareResourcesTiles from "@site/src/components/HydroShareResourcesTiles";
import HydroShareResourcesRows from "@site/src/components/HydroShareResourcesRows";
import { fetchResourcesBySearch, fetchResourceCustomMetadata } from "@site/src/components/HydroShareImporter";
import { useColorMode } from "@docusaurus/theme-common"; // Hook to detect theme
import DatasetLightIcon from '@site/static/img/cards/datasets_logo_light.png';
import DatasetDarkIcon from '@site/static/img/cards/datasets_logo_dark.png';
import {
  HiOutlineSortDescending,
  HiOutlineSortAscending,
} from 'react-icons/hi';

const PAGE_SIZE        = 40;
const SCROLL_THRESHOLD = 800;
let   debounceTimer    = null;
const DEBOUNCE_MS      = 1_000;

export default function HydroShareResourcesSelector({ keyword = "nwm_portal_app", defaultImage }) {
  const { colorMode } = useColorMode(); // Get the current theme
  const PLACEHOLDER_ITEMS = 10;

  // Initialize with placeholder objects so that the component renders immediately.
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
  }));

  const hs_icon = colorMode === 'dark' ? DatasetDarkIcon : DatasetLightIcon;
  
  // State
  const [resources, setResources] = useState(initialPlaceholders);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("row");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const fetching = useRef(false);

  // Search State
  const [searchInput,    setSearchInput]    = useState('');
  const [filterSearch,   setFilterSearch]   = useState('');
  const [sortType,       setSortType]       = useState('modified');
  const [sortDirection,  setSortDirection]  = useState('desc');



  const fetchResources = useCallback(
    async (page) => {
      if (fetching.current) return;
      fetching.current = true;

      try {
        let resourceList = undefined;
        
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

        // Start data fetching (while placeholders are already rendered)
        const ascending = sortDirection === 'asc' ? true : false;
        resourceList = await fetchResourcesBySearch(keyword, filterSearch, ascending, sortType, undefined, page);

        const mappedList = resourceList.map((res) => ({
          resource_id: res.resource_id,
          title: res.resource_title,
          authors: res.authors.map(
            (author) => author.split(',').reverse().join(' ')
          ).join(' 🖊️ '),
          resource_type: res.resource_type,
          resource_url: res.resource_url,
          description: res.abstract || "No description available.",
          date_created: res.date_created,
          date_last_updated: res.date_last_updated,
          thumbnail_url: "",
          page_url: "",
          docs_url: "",
          embed_url: "",
        }));

        // Handle first page vs pagination
        if (page === 1) {
          setResources(mappedList); // Replace for first page
        } else {
          setResources(prev => [
            ...prev.filter(r => !r.resource_id.startsWith('placeholder-')),
            ...mappedList
          ]);
        }
        
        // Update hasMore based on API response
        setHasMore(mappedList.length === PAGE_SIZE);
        setLoading(false);

        // Fetch metadata for each resource and update them individually
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
      } finally {
        fetching.current = false;
      }
    },
    [keyword, filterSearch, sortDirection, sortType, hs_icon]
  );



  // Reset and load first page when filters change
  useEffect(() => {
    setResources(initialPlaceholders);
    setCurrentPage(1);
    setHasMore(true);
    
    // Reset the fetching flag to allow new requests (fixes race condition)
    fetching.current = false;
    
    fetchResources(1);
  }, [keyword, filterSearch, sortDirection, sortType, fetchResources]);

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  /* infinite scroll */
  useEffect(() => {
    const onScroll = () => {
      if (fetching.current || !hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchResources(next);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage, hasMore, fetchResources]);

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

  /* ---------------- render ---------------- */
  return (
    <div className={clsx(styles.wrapper)}>
      <div className={clsx("container", "margin-bottom--lg")}>
        {/* counter */}
      <div className={styles.counterRow}>
        Showing&nbsp;
        <strong>{resources.filter(r => !r.resource_id.startsWith('placeholder-')).length}</strong>
        &nbsp; { keyword == 'nwm_portal_app' ? 'Apps' : keyword == 'nwm_portal_module' ? 'Courses' : 'Resources' }
        {!loading && <> of <strong>{resources.filter(r => !r.resource_id.startsWith('placeholder-')).length}</strong></>}
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
        
        {/* Header */}
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

        {/* Resources */}
        {view === "grid" ? (
          <HydroShareResourcesTiles resources={resources} />
        ) : (
          <HydroShareResourcesRows resources={resources} />
        )}

        {/* empty */}
        {!loading &&
          resources.filter(r => !r.resource_id.startsWith('placeholder-')).length === 0 && (
            <p className={styles.emptyMessage}>No&nbsp;Resources&nbsp;Found</p>
          )}
      </div>
    </div>
  );
}