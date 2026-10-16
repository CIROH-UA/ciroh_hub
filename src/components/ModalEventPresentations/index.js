import React, { useEffect, useMemo, useRef, useState, startTransition } from 'react';
import { useTheme } from '@docusaurus/theme-common';
import ReactDOM from 'react-dom';
import HydroShareResourcesCards from "@site/src/components/HydroShareResourcesCards";
import { FaWindowClose } from 'react-icons/fa';
import { HiOutlineSortDescending, HiOutlineSortAscending, HiOutlineSearch } from 'react-icons/hi';
import styles from './styles.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import DatasetLightIcon from '@site/static/img/cards/datasets_logo_light.png';
import DatasetDarkIcon from '@site/static/img/cards/datasets_logo_dark.png';

const DEBOUNCE_MS = 1_000;

/**
 * Filter and sort a list of presentation cards locally.
 * @param {Array} presentations - List of presentation objects to filter/sort.
 * @param {string} filterSearch - Search query to filter presentations by (matches title, description, authors, or dates).
 * @param {string} sortType - Field to sort by ('modified', 'created', 'title', 'author').
 * @param {string} sortDirection - Sort direction ('asc' or 'desc').
 * @returns {Array} Filtered and sorted list of presentations.
 */
function filterAndSortPresentations(presentations, filterSearch, sortType, sortDirection) {
    // Remove leading/trailing whitespace and make search case-insensitive
    const query = (filterSearch || '').trim().toLowerCase();

    // Search / Filter
    const filtered = !query
        ? presentations.slice()
        : presentations.filter(presentation => {
            const searchableFields = [
                presentation.title,
                presentation.description,
                presentation.authors,
                presentation.date_created,
                presentation.date_last_updated,
            ];
            return searchableFields.some(field =>
                typeof field === 'string' && field.toLowerCase().includes(query)
            );
        });

    // Sort
    filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortType) {
            case 'modified':
                comparison = (a.date_last_updated || '').localeCompare(b.date_last_updated || '');
                break;
            case 'created':
                comparison = (a.date_created || '').localeCompare(b.date_created || '');
                break;
            case 'title':
                comparison = (a.title || '').localeCompare(b.title || '');
                break;
            case 'author':
                comparison = (a.authors || '').localeCompare(b.authors || '');
                break;
            default:
                comparison = 0;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
}

/**
 * Full-screen modal for displaying event presentations.
 * @param {boolean} show - Whether the modal is visible.
 * @param {function} onClose - Function to call when the modal is closed.
 * @param {string} title - Title of the modal.
 * @param {Array} presentations - List of presentations to display.
 * @param {boolean} loadError - Whether there was an error loading the presentations.
 */
export default function ModalEventPresentations({ show, onClose, title, presentations, loadError }) {
    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === 'dark';
    const defaultImage = isDarkTheme ? DatasetDarkIcon : DatasetLightIcon;

    // Search / Sort State
    const [searchInput, setSearchInput] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [sortType, setSortType] = useState('modified');
    const [sortDirection, setSortDirection] = useState('asc');
    const debounceTimerRef = useRef(null);

    // Reset search/sort state each time the modal closes so reopening is fresh
    useEffect(() => {
        if (!show) {
            setSearchInput('');
            setFilterSearch('');
            setSortType('modified');
            setSortDirection('asc');
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
        }
    }, [show]);

    // Debounce search input to avoid excessive re-filtering while the user is typing
    useEffect(() => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
            setFilterSearch(String(searchInput || '').trim());
        }, DEBOUNCE_MS);

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [searchInput]);

    // Immediate commit function for when the user presses Enter
    const commitSearch = (q) => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        setFilterSearch(String(q || '').trim());
    };

    // Prevent background scrolling while modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [show]);

    // Filtered and sorted list (from search input and sort options) - memoized for performance
    const displayedPresentations = useMemo(() => {
        if (!Array.isArray(presentations)) return presentations;
        return filterAndSortPresentations(presentations, filterSearch, sortType, sortDirection);
    }, [presentations, filterSearch, sortType, sortDirection]);

    // Don't render the modal at all if it's not shown
    if (!show) return null;

    // Counts for display above the search bar
    const isLoaded = Array.isArray(presentations);
    const totalCount = isLoaded ? presentations.length : 0;
    const shownCount = isLoaded ? (displayedPresentations?.length || 0) : 0;

    return ReactDOM.createPortal(
        <div
            className={`tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-slate-900/70 tw-backdrop-blur-sm ${styles.modalBelowNavbar}`}
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                className="tw-relative tw-h-full tw-w-full tw-overflow-y-auto tw-rounded-xl tw-shadow-2xl tw-bg-white dark:tw-bg-[#060010]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="tw-absolute tw-top-4 tw-right-4 tw-inline-flex tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-slate-400 tw-bg-white/80 tw-p-2 tw-text-slate-700 hover:tw-text-cyan-700 hover:tw-border-cyan-600 dark:tw-border-slate-600 dark:tw-bg-slate-700/50 dark:tw-text-slate-300 dark:hover:tw-text-cyan-300 hover:tw-shadow-md tw-transition"
                >
                    <FaWindowClose />
                </button>

                {/* Title, Search/Filter Bar, and Presentations Container */}
                <div className="tw-h-full tw-w-full tw-p-6">
                    {/* Title */}
                    <h1 className="tw-mb-4 tw-pr-10 tw-text-2xl tw-font-semibold tw-text-center tw-text-cyan-700 dark:tw-text-cyan-300">
                        {title} Presentations
                    </h1>

                    {/* Search and Filter Inputs */}
                    {isLoaded && totalCount > 0 && (
                        <div className="tw-flex tw-flex-col lg:tw-flex-row lg:tw-items-center lg:tw-justify-between tw-gap-4 tw-mb-6">
                            {/* Counts */}
                            <div className="tw-text-sm sm:tw-text-base tw-text-slate-600 dark:tw-text-slate-300">
                                Showing{' '}
                                <strong className="tw-font-semibold tw-text-slate-900 dark:tw-text-white">
                                    {shownCount}
                                </strong>{' '}
                                of{' '}
                                <strong className="tw-font-semibold tw-text-slate-900 dark:tw-text-white">
                                    {totalCount}
                                </strong>{' '}
                                Presentations
                            </div>

                            {/* Search and Sort Form */}
                            <form
                                className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-gap-3 tw-w-full lg:tw-w-auto"
                                onSubmit={(e) => { e.preventDefault(); commitSearch(searchInput); }}
                            >
                                {/* Search Input */}
                                <div className="tw-relative tw-w-full md:tw-w-[28rem]">
                                    <span className="tw-pointer-events-none tw-absolute tw-left-3 tw-inset-y-0 tw-flex tw-items-center tw-text-slate-400 dark:tw-text-slate-500">
                                        <HiOutlineSearch size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search by Title, Author, Description..."
                                        className="tw-w-full tw-rounded-lg tw-border tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-backdrop-blur tw-pl-10 tw-pr-3 tw-py-3 tw-text-sm tw-text-slate-900 dark:tw-text-white placeholder:tw-text-slate-400 dark:placeholder:tw-text-slate-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-cyan-500/30"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                commitSearch(e.currentTarget.value);
                                            }
                                        }}
                                        onBlur={(e) => commitSearch(e.currentTarget.value)}
                                    />
                                </div>
                                
                                {/* Sort Inputs */}
                                <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
                                    {/* Sort Type */}
                                    <select
                                        value={sortType}
                                        onChange={(e) => setSortType(e.target.value)}
                                        className="tw-rounded-lg tw-border tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-backdrop-blur tw-px-3 tw-py-3 tw-text-sm tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-cyan-500/30"
                                    >
                                        <option value="modified">Last Updated</option>
                                        <option value="created">Date Created</option>
                                        <option value="title">Title</option>
                                        <option value="author">Authors</option>
                                    </select>
                                    
                                    {/* Sort Direction */}
                                    <button
                                        type="button"
                                        aria-label={`Sort direction ${sortDirection}`}
                                        className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-backdrop-blur tw-px-3 tw-py-3 tw-text-slate-700 dark:tw-text-slate-200 hover:tw-border-cyan-500/40 hover:tw-text-cyan-700 dark:hover:tw-text-cyan-300 tw-transition"
                                        onClick={() =>
                                            startTransition(() =>
                                                setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'))
                                            )
                                        }
                                    >
                                        {sortDirection === 'asc'
                                            ? <HiOutlineSortAscending size={20} />
                                            : <HiOutlineSortDescending size={20} />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Presentations */}
                    {presentations === null ? (
                        <div id="selected-image-loader" className="tw-absolute tw-inset-0 tw-z-10 tw-pointer-events-none">
                            <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center">
                                <span className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </span>
                            </div>
                        </div>
                    ) : totalCount === 0 ? (
                        <div className="tw-flex tw-h-64 tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300">
                            {loadError
                                ? `Could not load presentations: ${loadError}`
                                : 'No presentations are associated with this event yet.'}
                        </div>
                    ) : shownCount === 0 ? (
                        <p className="tw-mt-10 tw-text-center tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">
                            No Presentations Found
                        </p>
                    ) : (
                        <HydroShareResourcesCards resources={displayedPresentations} defaultImage={defaultImage} />
                    )}
                </div>
            </div>
        </div>
        , document.body);
}
