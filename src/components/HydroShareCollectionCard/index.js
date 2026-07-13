import React, { useEffect, useState } from "react";
import { fetchResourceCustomMetadata, fetchResourcesFromCollection } from "@site/src/components/HydroShareImporter";
import styles from './styles.module.css';

const defaultImage = 'https://ciroh-portal-static-data.s3.us-east-1.amazonaws.com/app_placeholder.png';

export function HydroShareCollectionCard({ resource: collectionResource }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    // Effect to fetch resources when the collection resource changes
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try
            {
                // The component is loading new data for the collection
                setLoading(true);

                // Fetch resources from the collection
                const items = await fetchResourcesFromCollection(collectionResource.resource_id);

                // Bail out if this effect has been cleaned up (unmount or a newer collection request)
                if (!cancelled)
                {
                    // Map the fetched items to the structure expected by the component
                    const mappedResources = items.map((resource) => ({
                        resource_id: resource.resource_id,
                        title: resource.resource_title,
                        authors: resource.authors.map(
                            (author) => author.split(',').reverse().join(' ')
                        ).join(' 🖊 '),
                        resource_type: resource.resource_type,
                        resource_url: resource.resource_url,
                        description: resource.abstract || "No description available.",
                        date_created: resource.date_created,
                        date_last_updated: resource.date_last_updated,
                        thumbnail_url: "",
                        page_url: "",
                        docs_url: "",
                        embed_url: "",
                    }));

                    // Update the component state with the fetched resources
                    setResources(mappedResources);
                    setLoading(false);

                    // Fetch metadata for each resource and update them individually
                    for (let resource of mappedResources)
                    {
                        try
                        {
                            // Fetch custom metadata for the resource
                            const customMetadata = await fetchResourceCustomMetadata(resource.resource_id);
                            let embedUrl = "";
                            if (customMetadata?.pres_path) embedUrl = `https://www.hydroshare.org/resource/${resource.resource_id}/data/contents/${customMetadata.pres_path}`;
                            const updatedResource = {
                                ...resource,
                                thumbnail_url: customMetadata?.thumbnail_url || "",
                                page_url: customMetadata?.page_url || "",
                                docs_url: customMetadata?.docs_url || "",
                                embed_url: embedUrl,
                            };

                            // Update the resource in the state with the fetched metadata
                            setResources((current) =>
                                current.map((item) =>
                                    item.resource_id === updatedResource.resource_id ? updatedResource : item
                                )
                            );
                        }
                        catch (metadataErr)
                        {
                            console.error(`Error fetching metadata: ${metadataErr.message}`);
                        }
                    }
                }
            }
            catch (error)
            {
                console.error(error);
            }
            finally
            {
                setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [collectionResource.resource_id]);

    return (
        <article
            id={collectionResource?.resource_id}
            className="tw-group tw-flex tw-grow-0 tw-h-full tw-min-h-[394px] tw-flex-col tw-overflow-hidden tw-rounded-xl tw-border-2 tw-border-slate-400 dark:tw-border-slate-500 tw-bg-slate-100 dark:tw-bg-slate-900 tw-shadow-md hover:tw-shadow-xl hover:tw-border-cyan-500 tw-transition"
        >
            {/* Collection Title */}
            <header className="tw-pt-3 tw-pb-1 tw-text-center tw-text-lg tw-font-bold tw-text-slate-700 dark:tw-text-slate-200">
                {collectionResource?.title}
            </header>

            {/* Resources */}
            { loading ? (
                // Keep resources from increasing height of card
                <div className="tw-relative tw-flex-1 tw-min-h-0">
                    {/* Placeholder entries while loading */}
                    <div className={`tw-absolute tw-inset-0 tw-grid tw-grid-cols-3 tw-gap-x-3 tw-gap-y-4 tw-p-4 tw-overflow-y-auto`}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="tw-aspect-square tw-w-full tw-rounded-lg tw-bg-slate-200 dark:tw-bg-slate-800 tw-animate-pulse"></div>
                        ))}
                    </div>
                </div>
                ) : (
                // Keep resources from increasing height of card
                <div className="tw-relative tw-flex-1 tw-min-h-0">
                    {/* Resources */}
                    <div className={`tw-absolute tw-inset-0 tw-grid tw-grid-cols-3 tw-gap-x-3 tw-gap-y-4 tw-p-4 tw-overflow-y-auto ${styles.scrollbar}`}>
                        {resources.map(resource => {
                            const hasUrl = Boolean(resource?.page_url || resource?.docs_url || resource?.resource_url);
                            const url = resource?.page_url || resource?.docs_url || resource?.resource_url || "";

                            return (
                                /* Resource */
                                <div key={resource?.resource_id} className={`tw-flex tw-flex-col tw-items-center tw-gap-1.5 ${hasUrl ? "tw-duration-300 tw-ease-out hover:-tw-translate-y-1" : ""}`}>
                                    {/* Thumbnail */}
                                    <div className="tw-aspect-square tw-w-full tw-overflow-hidden tw-rounded-lg tw-bg-slate-200 dark:tw-bg-slate-800">
                                        {hasUrl ? (
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="tw-block tw-h-full tw-w-full">
                                                <img
                                                src={resource?.thumbnail_url || defaultImage}
                                                alt={resource?.title || ""}
                                                loading="lazy"
                                                className="tw-h-full tw-w-full tw-object-cover"
                                                />
                                            </a>
                                        ) : (
                                            <img
                                            src={resource?.thumbnail_url || defaultImage}
                                            alt={resource?.title || ""}
                                            loading="lazy"
                                            className="tw-h-full tw-w-full tw-object-cover"
                                            />
                                        )
                                        }
                                    </div>

                                    {/* Title */}
                                    <span className="tw-w-full tw-truncate tw-text-center tw-text-xs tw-text-slate-600 dark:tw-text-slate-300">
                                        {resource?.title}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </article>
    )
}