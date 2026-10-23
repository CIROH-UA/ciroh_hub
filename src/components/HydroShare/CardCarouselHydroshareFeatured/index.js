import React, { useState, useEffect } from "react";
import CardCarouselGeneric from "@site/src/components/CardCarouselGeneric";
import ResourceCardCurated from "@site/src/components/HydroShare/HydroShareResourceCardsCurated";
import { fetchResourcesFromCollection, fetchResourceCustomMetadata, fetchResourceImageUrls } from "@site/src/components/HydroShare/HydroShareImporter";

/**
 * CardCarouselHydroshareFeatured component
 * @param {Object} props - Component props
 * @param {string} props.collectionId - HydroShare collection ID
 * @param {string} props.header - Carousel header text
 * @param {string} props.defaultImage - Default image URL
 * @param {Object} props.overrides - Overrides for resource attributes, keyed by resource ID
 * @param {number} props.cardsPerView - Number of cards per view
 * @returns {JSX.Element} - Rendered component
 */
export default function CardCarouselHydroshareFeatured({ collectionId, header, defaultImage, overrides, cardsPerView }) {
    // Placeholder resource card to show while loading or if no resources are found.
    const resourceFeaturedPlaceholder = {
        authors: "",
        description: "",
        docs_url: "",
        embed_url: "",
        page_url: "",
        resource_id: "placeholder-1",
        resource_type: "Resource",
        resource_url: "",
        thumbnail_url: "",
        title: "",
    }

    // Component State
    const featuredResourcesCollectionId = collectionId || '';
    const resourceOverridesMap = overrides || {};
    const [carouselCards, setCarouselCards] = useState([resourceFeaturedPlaceholder]);

    // Function to render each card in the curated resources carousel.
    const renderCuratedResourceCard = (card, index, cardProperties) => (
    <ResourceCardCurated
        resource={{
        authors: card.authors,
        description: card.description,
        docs_url: card.docs_url,
        embed_url: card.embed_url,
        page_url: card.page_url,
        resource_id: card.resource_id,
        resource_type: card.resource_type,
        resource_url: card.resource_url,
        thumbnail_url: card.thumbnail_url,
        title: card.title,
        images: card.images,
        }}
        defaultImage={defaultImage}
    />
    );

    // Fetch the featured resource cards when the component mounts or when the collection ID changes.
    useEffect(() => {
        // Function to fetch resources from HydroShare and prepare the featured resource cards for the carousel.
        const fetchFeaturedResourceCards = async () => {
            try
            {
                // Fetch resources from the specified HydroShare collection for featured resources.
                const resources = await fetchResourcesFromCollection(featuredResourcesCollectionId);

                // Map the fetched resources to the card format expected by the carousel.
                const resourcesMapped = resources.map(resource => ({
                    authors: resource.authors.map(
                        (author) => author.split(',').reverse().join(' ')
                    ).join(' 🖊 '),
                    description: resource.abstract,
                    docs_url: resource.docs_url,
                    embed_url: resource.embed_url,
                    page_url: resource.page_url,
                    resource_id: resource.resource_id,
                    resource_type: resource.resource_type,
                    resource_url: resource.resource_url,
                    thumbnail_url: resource.thumbnail_url,
                    title: resource.resource_title,
                    images: resource.images,
                }));

                // Fetch metadata and image URLs for each resource in parallel
                await Promise.all(
                    resourcesMapped.map(async (resource) => {
                        // Fetch custom metadata and image URLs in parallel for each resource
                        const [customMetadata, imageUrls] = await Promise.all([
                            fetchResourceCustomMetadata(resource.resource_id),
                            fetchResourceImageUrls(resource.resource_id),
                        ]);

                        // Update resource attributes with fetched custom metadata if it exists, otherwise keep existing values
                        let embedUrl = "";
                        if (customMetadata?.pres_path)
                        {
                            embedUrl = `https://www.hydroshare.org/resource/${resource.resource_id}/data/contents/${customMetadata.pres_path}`;
                        }
                        
                        // Update resource attributes with custom metadata if available, otherwise keep existing values
                        resource.thumbnail_url = customMetadata?.thumbnail_url || resource.thumbnail_url;
                        resource.page_url = customMetadata?.page_url || resource.page_url;
                        resource.docs_url = customMetadata?.docs_url || resource.docs_url;
                        resource.embed_url = embedUrl;
                        resource.images = imageUrls;
                    })
                );

                // Override resource attributes with hardcoded values
                for (const resource of resourcesMapped)
                {
                    const resourceOverrides = resourceOverridesMap[resource.resource_id];
                    if (resourceOverrides)
                    {
                        Object.assign(resource, resourceOverrides);
                    }
                }

                // Add images_additional to resource's images array if it exists
                for (const resource of resourcesMapped)
                {
                    if (resource.images_additional)
                    {
                        resource.images = [...(resource.images || []), ...resource.images_additional];
                        delete resource.images_additional; // Clean up the temporary field
                    }
                }

                // Return resources
                return resourcesMapped;
            } catch (error) {
                console.error("Error fetching featured resource cards:", error);
                return [];
            }
        };

        // Flag to track if the component is still mounted to avoid setting state on an unmounted component.
        let isMounted = true;

        // Async function to fetch and prepare the featured resource cards.
        async function doFetch() {
            // Fetch the featured resource cards.
            const fetchedCards = await fetchFeaturedResourceCards();

            // If the component is no longer mounted, do not attempt to set state.
            if (!isMounted) {
                return;
            }

            // Update the carousel cards state with the fetched cards.
            setCarouselCards(fetchedCards);
        }

        // Call the async fetch function
        doFetch();

        return () => {
            isMounted = false;
        };
    }, [featuredResourcesCollectionId]);

    // Render the CardCarouselGeneric component with the fetched cards and the custom render function for resource cards.
    return carouselCards.length > 0 ? (
        <CardCarouselGeneric
        header={header || ''}
        cards={carouselCards}
        renderCard={renderCuratedResourceCard}
        cardsPerView={cardsPerView || 1}
        />
    ) : (
        null
    )
}
