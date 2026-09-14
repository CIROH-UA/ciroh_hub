/* Publications.jsx - Zotero list with search, sort **and 1-collection filter** */
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  startTransition,
  useMemo,
} from 'react';
import {
  zoteroApiCreate,
  zoteroFetchTopItems,
  zoteroFetchCollections,
  zoteroFetchAttachments,
  zoteroFetchAttachmentFileUrl,
} from '@site/src/components/ZoteroImporter';
import SelectCollection from './SelectCollection';
import PublicationCard  from './PublicationCard';
import SkeletonCard     from './SkeletonCard';
import styles           from './Publications.module.css';
import clsx             from 'clsx';
import {
  HiOutlineSortDescending,
  HiOutlineSortAscending,
} from 'react-icons/hi';

const PAGE_SIZE        = 50;
const SCROLL_THRESHOLD = 200;
let   debounceTimer    = null;
const DEBOUNCE_MS      = 1_000;

/* ------------------------------------------------------------------------- */
export default function Publications({ apiKey, groupId }) {
  /* memoised Zotero client (doesn't re-create on every render) */
  const zotero = useMemo(
    () => zoteroApiCreate(apiKey, groupId, 'group'),
    [apiKey, groupId],
  );

  /* ---------------- state ---------------- */
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage,    setCurrentPage]    = useState(0);
  const [hasMore,        setHasMore]        = useState(true);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const fetching = useRef(false);

  const [totalItems,     setTotalItems]     = useState(null);
  const [collectionsCount, setCollectionsCount] = useState(null);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  const [searchInput,    setSearchInput]    = useState('');
  const [filterSearch,   setFilterSearch]   = useState('');
  const [filterItemType, setFilterItemType] = useState('all');
  const [sortType,       setSortType]       = useState('date');
  const [sortDirection,  setSortDirection]  = useState('desc');

  /* 💡 single selected collection (object | null) */
  const [selectedCollection, setSelectedCollection] = useState(null);

  /* stable key string for API paths & dependency arrays */
  const collectionKeyStr = selectedCollection?.value ?? '';  // '' ⇒ no filter

  /* Resolve a Zotero attachment item to a displayable URL based on its
   * linkMode. linked_url attachments carry the URL on the data object;
   * imported_file attachments need a Zotero round-trip to fetch a
   * temporary file URL. Other linkModes (linked_file, imported_url) are
   * not handled and resolve to null. */
  const resolveAttachmentUrl = useCallback(async (attachment) => {
    if (!attachment) return null;
    if (attachment.linkMode === 'linked_url') return attachment.url;
    if (attachment.linkMode === 'imported_file') {
      return zoteroFetchAttachmentFileUrl(zotero, attachment.key);
    }
    return null;
  }, [zotero]);

  /* -------- loader ----------------------------------------------- */
  const loadPublications = useCallback(
    async (page) => {
      if (fetching.current) return;
      fetching.current = true;

      try {
        setLoading(true);
        setError(null);

        /* placeholders */
        setDisplayedItems(prev => [
          ...prev,
          ...Array.from({ length: PAGE_SIZE }, () => ({ placeholder: true })),
        ]);

        const query = {
          start: page * PAGE_SIZE,
          limit: PAGE_SIZE,
          sort:  sortType,
          direction: sortDirection,
          include: 'data',
          qmode: 'titleCreatorYear',
          ...(filterSearch ? { q: filterSearch } : {}),
          ...(filterItemType !== 'all' ? { itemType: filterItemType } : {}),
        };

        /* fetch publications */
        const { data: newItems, total, hasMore: morePages } = await zoteroFetchTopItems(zotero, query, collectionKeyStr || null);

        setTotalItems(total);
        setHasMore(morePages);

        /* display publications while thumbnails are loading */
        setDisplayedItems(prev => {
          const upd   = [...prev];
          const first = upd.findIndex(i => i.placeholder);
          newItems.forEach((it, i) => (upd[first + i] = { ...it, thumbnailLoading: true }));
          if (newItems.length < PAGE_SIZE) {
            upd.splice(first + newItems.length, PAGE_SIZE - newItems.length);
          }
          return upd;
        });

        /* For each publication, fetch attachments, resolve the thumbnail URL (if any), and stash image attachment descriptors for later resolution on demand */
        for (const item of newItems) {
          zoteroFetchAttachments(zotero, item.key)
            .then(async ({ data: attachments }) => {
              // Helper to strip extensions (allow various image file types) and allow lowercase
              const baseTitle = (t) => (t || '').replace(/\.[a-z0-9]+$/i, '').toLowerCase();

              // Find thumbnail attachment (if any)
              const thumbnailAttachment = attachments.find(a => baseTitle(a.title) === 'thumbnail');

              // Find images (if any) and sort by the number in the title (image-1, image-2, etc.)
              const imageAttachments = attachments
                .filter(a => /^image-\d+$/.test(baseTitle(a.title)))
                .sort((a, b) => {
                  const an = parseInt(baseTitle(a.title).slice('image-'.length), 10);
                  const bn = parseInt(baseTitle(b.title).slice('image-'.length), 10);
                  return an - bn;
                });

              // Resolve thumbnail URL (if any)
              const thumbnailUrl = await resolveAttachmentUrl(thumbnailAttachment);

              // Stash image descriptors for later resolution. Include thumbnail as first image
              const toDescriptor = (a) => ({ key: a.key, linkMode: a.linkMode, url: a.url });
              const hasSupportedLinkMode = (a) => a.linkMode === 'linked_url' || a.linkMode === 'imported_file';

              const imageDescriptors = imageAttachments
                .filter(hasSupportedLinkMode)
                .map(toDescriptor);

              const thumbnailDescriptor = thumbnailAttachment && thumbnailUrl && hasSupportedLinkMode(thumbnailAttachment)
                ? toDescriptor(thumbnailAttachment)
                : null;

              const thumbnailAlreadyPresent = thumbnailDescriptor
                ? imageDescriptors.some((img) => img.url === thumbnailDescriptor.url)
                : false;

              const images = thumbnailDescriptor && !thumbnailAlreadyPresent
                ? [thumbnailDescriptor, ...imageDescriptors]
                : imageDescriptors;
              
              // Update displayed publications with thumbnail URL and image descriptors
              setDisplayedItems(prev => prev.map(it =>
                it.key === item.key
                  ? { ...it, thumbnailUrl: thumbnailUrl ?? null, images, thumbnailLoading: false }
                  : it
              ));
            })
            .catch(err => {
              console.error(`Failed to fetch attachments for item ${item.key}:`, err);
              setDisplayedItems(prev => prev.map(it =>
                it.key === item.key ? { ...it, thumbnailLoading: false } : it
              ));
            });
        }
      } catch {
        if (apiKey === 'dummy') setError('Site administrator: Please provide a Zotero API key in this website\'s environment file.');
        else if (apiKey == 'forbidden') setError('Access forbidden by CI/CD. (This may be built from a remote branch that cannot access secrets.)')
        else setError('Error retrieving the publications.');
      } finally {
        fetching.current = false;
        setLoading(false);
      }
    },
    [
      zotero,
      apiKey,
      collectionKeyStr,
      filterSearch,
      filterItemType,
      sortType,
      sortDirection,
      resolveAttachmentUrl,
    ],
  );

  /* Resolve a list of image-attachment descriptors (as stashed on each
   * publication item by loadPublications) into displayable URLs. Called
   * by PublicationCard when its modal opens so signed URLs are always
   * fresh. Memoised on `zotero` so each card receives a stable reference. */
  const resolveImageUrls = useCallback(async (imageDescriptors) => {
    const urls = await Promise.all(imageDescriptors.map(resolveAttachmentUrl));
    return urls.filter((u) => u !== null);
  }, [resolveAttachmentUrl]);

  /* -- reload whenever filters OR selected collection change -------- */
  useEffect(() => {
    setDisplayedItems([]);
    setCurrentPage(0);
    setHasMore(true);
    setTotalItems(null);
    loadPublications(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterSearch,
    filterItemType,
    sortType,
    sortDirection,
    collectionKeyStr,
  ]);

  /* infinite scroll */
  useEffect(() => {
    const onScroll = () => {
      if (fetching.current || !hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
        const next = currentPage + 1;
        setCurrentPage(next);
        loadPublications(next);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage, hasMore, loadPublications]);

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

  /* collections count */
  useEffect(() => {
    if (!zotero) return;
    let cancelled = false;
    (async () => {
      try {
        setCollectionsLoading(true);
        const { total } = await zoteroFetchCollections(zotero, { limit: 1 });
        if (!cancelled) setCollectionsCount(total);
      } catch (err) {
        console.error('Could not load Zotero collections count:', err);
        if (!cancelled) setCollectionsCount(null);
      } finally {
        if (!cancelled) setCollectionsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [zotero]);

  const stats = useMemo(() => {
    const items = displayedItems.filter(i => i && !i.placeholder);
    const totalPublications = totalItems ?? items.length;
    const contributors = (() => {
      const set = new Set();
      for (const item of items) {
        const creators = Array.isArray(item?.creators) ? item.creators : [];
        creators.forEach(creator => {
          const name = [
            creator?.lastName,
            creator?.firstName,
          ].filter(Boolean).join(', ') || creator?.name;
          if (name) set.add(name);
        });
      }
      return set.size;
    })();
    const lastUpdated = (() => {
      let latest = null;
      for (const item of items) {
        const dateStr = item?.dateModified || item?.dateAdded;
        if (!dateStr) continue;
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) continue;
        if (!latest || d > latest) latest = d;
      }
      if (!latest) return '-';
      try {
        return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(latest);
      } catch {
        return latest.toISOString().slice(0, 10);
      }
    })();
    return {
      totalPublications,
      collections: collectionsCount ?? '-',
      contributors,
      lastUpdated,
    };
  }, [displayedItems, totalItems, collectionsCount]);

  const statsLoading = loading || fetching.current || collectionsLoading;

  /* ---------------- render ---------------- */
  return (
    <div>
        <div className="tw-relative tw-z-20 tw-border-y tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/60 dark:tw-bg-slate-950 tw-backdrop-blur">
          <div className="tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-6">
            <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6">
              <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {statsLoading
                  ? <span className={styles.loadingText}>...</span>
                  : stats.totalPublications}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Total Publications</div>
            </div>
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {statsLoading
                  ? <span className={styles.loadingText}>...</span>
                  : stats.collections}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Collections</div>
            </div>
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {statsLoading
                  ? <span className={styles.loadingText}>...</span>
                  : stats.contributors}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Contributors</div>
            </div>
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {statsLoading
                  ? <span className={styles.loadingText}>...</span>
                  : stats.lastUpdated}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Latest Update</div>
            </div>
            </div>
          </div>
        </div>
    <div className={styles.wrapper}>

      <div className={styles.container}>
        {/* stats */}


        {/* counter */}
        <div className={styles.counterRow}>
          {loading || fetching.current ? "Fetching Publications..." : (
            <>
              Loaded&nbsp;
              <strong>{displayedItems.filter(i => !i.placeholder).length}</strong>
              &nbsp;publications
              {totalItems !== null && <> of <strong>{totalItems}</strong></>}
            </>
          )}
        </div>

        {/* form */}
        <form
          className={styles.filterForm}
          onSubmit={e => { e.preventDefault(); commitSearch(searchInput); }}
        >
          <input
            type="text"
            placeholder="Search by Title, Author, Year"
            className={styles.searchInput}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyUp={handleKeyUp}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />

          <select
            value={filterItemType}
            onChange={e => setFilterItemType(e.target.value)}
            className={styles.typeSelect}
          >
            <option value="all">All types</option>
            <option value="book">Book</option>
            <option value="journalArticle">Journal Article</option>
            <option value="conferencePaper">Conference Paper</option>
            <option value="prePrint">Pre-print</option>
            <option value="document">Document</option>
            <option value="bookSection">Book Section</option>
          </select>

          <select
            value={sortType}
            onChange={e => setSortType(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="date">Published Date</option>
            <option value="dateAdded">Date Added</option>
            <option value="title">Title</option>
            <option value="creator">Creator</option>
            <option value="itemType">Item Type</option>
            <option value="publisher">Publisher</option>
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

        {/* collection select (single) */}
        <div className={styles.collectionRow}>
          <SelectCollection
            zotero={zotero}
            onChange={opt => setSelectedCollection(opt || null)}
          />
        </div>
        <p></p>
        <p className={styles.hint}>
          <strong>🧪&nbsp;</strong>
          A result is returned only if the exact text you type occurs <em>anywhere</em> in the
          citation's <em>title</em>, <em>author</em>, or <em>year</em>.
        </p>

        {/* error */}
        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.error}>{error}</div>
          </div>
        )}

        {/* grid */}
        <div className={styles.publicationsContainer}>
          {!error &&
            displayedItems.map((item, i) =>
              item.placeholder
                ? <SkeletonCard key={`ph-${i}`} />
                : <PublicationCard key={item.key || `pub-${i}`} publication={item} resolveImageUrls={resolveImageUrls} />,
            )}
        </div>

        {/* empty */}
        {!loading &&
          displayedItems.filter(i => !i.placeholder).length === 0 && (
            <p className={styles.emptyMessage}>No&nbsp;Publications&nbsp;Found</p>
          )}
      </div>
    </div>
    </div>
  );
}
