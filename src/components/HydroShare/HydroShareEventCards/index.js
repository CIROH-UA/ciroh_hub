import { useEffect, useState } from 'react';
import { LiaExternalLinkSquareAltSolid } from 'react-icons/lia';
import { FaGraduationCap } from 'react-icons/fa';
import { LuLayers3 } from 'react-icons/lu';
import { HiOutlineGlobeAlt, HiOutlineUserGroup } from 'react-icons/hi';
import { isPlaceholder, splitAuthors, StatTag, ActionLink } from '@site/src/components/HydroShare/HydroShareResourcesCards/shared';
import { fetchResourcesFromCollection, fetchResourceCustomMetadata, fetchResourceImageUrls, } from '@site/src/components/HydroShare/HydroShareImporter';
import ModalEventPresentations from './ModalEventPresentations';

/**
 * Load event presentations for a given collection.
 * @param {string} collectionId 
 * @returns {Promise<Array>} List of presentation cards
 */
async function loadEventPresentations(collectionId) {
    // Fetch presentations in the collection
    const resources = await fetchResourcesFromCollection(collectionId);

    // Map to card format and enrich with custom metadata and images
    const mapped = resources.map(resource => ({
        authors: (resource.authors || [])
            .map(a => a.split(',').reverse().join(' '))
            .join(' 🖊 '),
        description: resource.abstract || '',
        docs_url: '',
        embed_url: '',
        page_url: '',
        resource_id: resource.resource_id,
        resource_type: resource.resource_type,
        resource_url: resource.resource_url,
        date_created: resource.date_created || '',
        date_last_updated: resource.date_last_updated || '',
        thumbnail_url: '',
        title: resource.resource_title,
        images: [],
    }));

    // Update each card with custom metadata and images
    await Promise.all(
        mapped.map(async (card) => {
            try {
                // Fetch custom metadata and images for each presentation
                const [customMetadata, imageUrls] = await Promise.all([
                    fetchResourceCustomMetadata(card.resource_id).catch(() => null),
                    fetchResourceImageUrls(card.resource_id).catch(() => []),
                ]);

                // Update card with fetched metadata, falling back to existing values if not available
                if (customMetadata?.pres_path) {
                    card.embed_url = `https://www.hydroshare.org/resource/${card.resource_id}/data/contents/${customMetadata.pres_path}`;
                }
                card.thumbnail_url = customMetadata?.thumbnail_url || card.thumbnail_url;
                card.page_url = customMetadata?.page_url || card.page_url;
                card.docs_url = customMetadata?.docs_url || card.docs_url;
                card.images = imageUrls || [];
            } catch (err) {
                console.error(`Error enriching presentation ${card.resource_id}:`, err);
            }
        })
    );

    return mapped;
}

/**
 * A component to display an individual event card, which can be clicked to view associated presentations.
 * @param {*} resource The event resource to display
 * @param {*} defaultImage The default image to use if the resource doesn't have one
 * @returns JSX element rendering the event card
 */
export function EventCard({ resource, defaultImage }) {
    const placeholder = isPlaceholder(resource);

    const title = resource?.title || 'Untitled';
    const description = resource?.description || '';
    const authors = splitAuthors(resource?.authors);

    const thumbnailUrl = resource?.thumbnail_url || defaultImage;
    const pageUrl = resource?.page_url;
    const docsUrl = resource?.docs_url;
    const resourceUrl = resource?.resource_url;
    const resourceType = resource?.resource_type;
    const collectionId = resource?.resource_id;

    const [showModal, setShowModal] = useState(false);
    const [presentations, setPresentations] = useState(null);
    const [loadError, setLoadError] = useState(null);

    // Load presentations when modal is opened for the first time
    useEffect(() => {
        // Only load if modal is being shown, it's not a placeholder, and we haven't already loaded children
        if (!showModal || placeholder || presentations !== null) return;

        // Load presentations for the event's collection
        let cancelled = false;
        setLoadError(null);
        loadEventPresentations(collectionId)
            .then(list => {
                if (!cancelled) setPresentations(list);
            })
            .catch(err => {
                if (!cancelled) {
                    console.error(`Error loading event presentations for ${collectionId}:`, err);
                    setLoadError(err.message || 'Failed to load presentations.');
                    setPresentations([]);
                }
            });
        return () => { cancelled = true; };
    }, [showModal, placeholder, collectionId, presentations]);

    // Close modal on Escape key press
    useEffect(() => {
        if (!showModal) return;
        const onKeyDown = (e) => { if (e.key === 'Escape') setShowModal(false); };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showModal]);

    // Open modal when title is clicked, but only if not a placeholder
    const openModal = (e) => {
        e.preventDefault();
        if (!placeholder) setShowModal(true);
    };

    return (
        <>
            <article
                id={collectionId}
                className="tw-group tw-flex tw-h-full tw-flex-col tw-overflow-hidden tw-rounded-xl tw-border-2 tw-border-slate-400 dark:tw-border-slate-500 tw-bg-slate-100 dark:tw-bg-slate-900 tw-shadow-md hover:tw-shadow-xl hover:tw-border-cyan-500 tw-transition"
            >
                <div className="tw-flex tw-flex-1 tw-flex-col tw-gap-4 tw-p-5">
                    {/* Thumbnail and Title Container */}
                    <div className="tw-flex tw-items-start tw-gap-4">
                        {/* Thumbnail */}
                        <div className="tw-relative tw-shrink-0 tw-w-16 tw-h-16 sm:tw-w-20 sm:tw-h-20 tw-rounded-lg tw-overflow-hidden tw-bg-slate-100 dark:tw-bg-slate-800">
                            {placeholder ? (
                                <div className="tw-h-full tw-w-full tw-animate-pulse tw-bg-slate-200 dark:tw-bg-slate-800" />
                            ) : thumbnailUrl ? (
                                <img
                                    src={thumbnailUrl}
                                    alt={title}
                                    className="tw-h-full tw-w-full tw-object-fill"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-text-slate-400 dark:tw-text-slate-500">
                                    <LuLayers3 size={28} />
                                </div>
                            )}
                        </div>
                        
                        {/* Title */}
                        <div className="tw-min-w-0 tw-flex-1">
                            {placeholder ? (
                                <div className="tw-space-y-3">
                                    <div className="tw-h-5 tw-w-2/3 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                                    <div className="tw-h-4 tw-w-1/3 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                                </div>
                            ) : (
                                <h3 className="tw-text-base sm:tw-text-lg tw-font-semibold tw-leading-snug tw-text-slate-900 dark:tw-text-white tw-line-clamp-2">
                                    <button
                                        type="button"
                                        onClick={openModal}
                                        title={`View presentations for ${title}`}
                                        className="tw-text-left tw-w-full tw-bg-transparent tw-border-0 tw-p-0 tw-no-underline [font:inherit] tw-text-black hover:tw-text-cyan-700 dark:tw-text-white dark:hover:tw-text-cyan-300 tw-cursor-pointer"
                                    >
                                        {title}
                                    </button>
                                </h3>
                            )}
                        </div>
                    </div>
                    
                    {/* Authors */}
                    {placeholder ? (
                        <div className="tw-h-4 tw-w-1/2 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                    ) : (
                        authors.length > 0 && (
                            <div className="tw-flex tw-items-start tw-gap-2 tw-text-xs tw-text-slate-600 dark:tw-text-slate-300 tw-whitespace-normal tw-break-words">
                                <span className="tw-mt-[1px] tw-shrink-0 tw-text-slate-500 dark:tw-text-slate-400" aria-hidden="true">
                                    <HiOutlineUserGroup size={16} />
                                </span>
                                <span>{authors.join(' • ')}</span>
                            </div>
                        )
                    )}

                    {/* Description */}
                    {placeholder ? (
                        <div className="tw-space-y-3">
                            <div className="tw-h-4 tw-w-full tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                            <div className="tw-h-4 tw-w-5/6 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                            <div className="tw-h-4 tw-w-3/4 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                        </div>
                    ) : (
                        description && (
                            <p className="tw-text-sm tw-leading-relaxed tw-text-slate-600 dark:tw-text-slate-300 tw-overflow-y-auto tw-max-h-36">
                                {description}
                            </p>
                        )
                    )}
                </div>
                
                {/* Footer */}
                <div className="tw-mt-auto tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-t tw-border-slate-200/70 tw-text-black dark:tw-text-white dark:tw-border-slate-700/70 tw-bg-cyan-400 dark:tw-bg-slate-800 tw-px-5 tw-py-3">
                    {/* Resource Type */}
                    <div className="tw-flex tw-flex-wrap tw-gap-2">
                        {!placeholder && <StatTag>{resourceType || 'Event'}</StatTag>}
                    </div>
                    
                    {/* Action Link Buttons */}
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <ActionLink href={pageUrl} title="Website">
                            <LiaExternalLinkSquareAltSolid size={18} />
                        </ActionLink>
                        <ActionLink href={docsUrl} title="Learning / Docs">
                            <FaGraduationCap size={16} />
                        </ActionLink>
                        <ActionLink href={resourceUrl} title="HydroShare Resource">
                            <HiOutlineGlobeAlt size={18} />
                        </ActionLink>
                    </div>
                </div>
            </article>
            
            {/* Event Presentations Modal */}
            <ModalEventPresentations
                show={showModal}
                onClose={() => setShowModal(false)}
                title={title}
                presentations={presentations}
                loadError={loadError}
            />
        </>
    );
}

/**
 * Component to display a grid of event cards.
 * @param {Array} resources List of event resources to display
 * @param {string} defaultImage URL of default image to use if a resource doesn't have one
 * @returns JSX element rendering the grid of event cards
 */
export default function HydroShareEventCards({ resources, defaultImage }) {
    return (
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 2xl:tw-grid-cols-3 tw-gap-6">
            {resources.map(resource => (
                <EventCard
                    key={resource.resource_id}
                    resource={resource}
                    defaultImage={defaultImage}
                />
            ))}
        </div>
    );
}
