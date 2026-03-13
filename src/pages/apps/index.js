import React, { useCallback, useMemo, useState } from "react";
import Header from "@site/src/components/Header";
import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import StatsBar from "@site/src/components/StatsBar";
import CardCarouselGeneric from "@site/src/components/CardCarouselGeneric";
import { getResourceStats } from "@site/src/utils/resourceStats";
import TethysLogoDark from '@site/static/img/logos/tethys-platform-dark.png';
import TethysLogWhite from '@site/static/img/logos/tethys-platform-white.png';
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import curatedApps from "./curatedApps";
import ResourceCardCurated from "@site/src/components/HydroShareResourceCardsCurated";
import { fetchResourcesFromCollection, fetchResourceCustomMetadata, fetchResourceImageUrls } from "@site/src/components/HydroShareImporter";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const items = [
  {
    lightIcon: TethysLogoDark,
    darkIcon: TethysLogWhite,
    alt: 'Tethys Platform',
    name: 'Tethys Platform',
    href: 'https://www.tethysplatform.org/',
  },
  {
    lightIcon: HydroShareLogo,
    darkIcon: HydroShareLogo,
    alt: 'HydroShare',
    name: 'HydroShare',
    href: 'https://hydroshare.org/',
  },
];

const appFeaturedPlaceholder = {
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

export default function AppsPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=apps');
  const docsUrl = useBaseUrl('/docs/products/intro');
  const defaultImage = 'https://ciroh-portal-static-data.s3.us-east-1.amazonaws.com/app_placeholder.png'

  return (
    <Layout title="Apps" description="CIROH Apps">
      <AppsPageContent
        contributeUrl={contributeUrl}
        docsUrl={docsUrl}
        defaultImage={defaultImage}
      />
    </Layout>
  );
}

function AppsPageContent({ contributeUrl, docsUrl, defaultImage }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';

  const [apps, setApps] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const onResultsChange = useCallback((results, meta) => {
    setApps(results);
    setStatsLoading(Boolean(meta?.loading));
  }, []);

  const stats = useMemo(() => getResourceStats(apps), [apps]);

  const { siteConfig } = useDocusaurusContext();
  const featuredAppsCollectionId = siteConfig.customFields.hs_featured_apps_collection_id;

  // Function to render each card in the curated apps carousel.
  const renderCuratedAppCard = (card, index, cardProperties) => (
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

  // Function to fetch resources from HydroShare and prepare the featured app cards for the carousel.
  const fetchCuratedAppCards = async () => {
    try {
      // Fetch resources from the specified HydroShare collection for featured apps.
      const resources = await fetchResourcesFromCollection(featuredAppsCollectionId);

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

      // Fetch metadata for each resource and update them individually
      for (let resource of resourcesMapped) {
        const customMetadata = await fetchResourceCustomMetadata(resource.resource_id);
        let embedUrl = "";
        if (customMetadata?.pres_path) embedUrl = `https://www.hydroshare.org/resource/${resource.resource_id}/data/contents/${customMetadata.pres_path}`;
        resource.thumbnail_url = customMetadata?.thumbnail_url || resource.thumbnail_url;
        resource.page_url = customMetadata?.page_url || resource.page_url;
        resource.docs_url = customMetadata?.docs_url || resource.docs_url;
        resource.embed_url = embedUrl;
      }

      // Fetch image URLs for each resource and update them individually
      for (let resource of resourcesMapped) {
        const imageUrls = await fetchResourceImageUrls(resource.resource_id);
        resource.images = imageUrls;
      }

      // Override resource attributes with hardcoded values from curatedApps.js if they exist
      for (const resource of resourcesMapped) {
        const overrides = curatedApps[resource.resource_id];
        if (overrides) {
          Object.assign(resource, overrides);
        }
      }

      // Return resources
      return resourcesMapped;
    } catch (error) {
        console.error("Error fetching featured app cards:", error);
        return [];
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
      <div className="margin-top--lg">
        <Header 
            title="Apps" 
            tagline="Enhance forecasting, analysis, and water resource management by making your web applications and tools accessible to CIROH and NOAA&apos;s hydrologic research initiatives."
            buttons={[
                { label: "Add your Apps", href: contributeUrl, primary: true },
                { label: "Browse Documentation", href: docsUrl }
              ]}
        />
      </div>
      </section>

      {/* Stats */}
      <StatsBar
        loading={statsLoading}
        items={[
          { label: 'Total Apps', value: stats.total },
          { label: 'Categories', value: stats.categories },
          { label: 'Contributors', value: stats.contributors },
          { label: 'Latest Update', value: stats.lastUpdated },
        ]}
      />

      <main className="tw-relative tw-z-20">
        {/* Curated Apps Carousel */}
        <div className="tw-bg-white dark:tw-bg-[#060010]">
          <CardCarouselGeneric
            header="Featured Apps"
            cards={[appFeaturedPlaceholder]}
            renderCard={renderCuratedAppCard}
            fetchCards={fetchCuratedAppCards}
            cardsPerView={1}
          />
        </div>

        <HydroShareResourcesSelector
          keyword="nwm_portal_app,ciroh_hub_app"
          defaultImage={defaultImage}
          variant="modern"
          onResultsChange={onResultsChange}
        />

        <div className="tw-pb-16">
          <TechBox items={items} type={"Applications"} tethys />
        </div>
      </main>
    </>
  );
}
