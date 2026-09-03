import React, { useCallback, useMemo, useState } from "react";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/HydroShare/TechBox";
import HydroShareResourcesSelector from "@site/src/components/HydroShare/HydroShareResourcesSelector";
import HydroShareEventCards from "@site/src/components/HydroShare/HydroShareEventCards";
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Header from "@site/src/components/Header";
import { useColorMode } from '@docusaurus/theme-common';
import StatsBar from "@site/src/components/HydroShare/StatsBar";
import { getResourceStats } from "@site/src/utils/resourceStats";
import DatasetLightIcon from '@site/static/img/cards/datasets_logo_light.png';
import DatasetDarkIcon from '@site/static/img/cards/datasets_logo_dark.png';

const items = [
  {
    lightIcon: HydroShareLogo,
    darkIcon: HydroShareLogo,
    alt: 'HydroShare',
    name: 'HydroShare',
    href: 'https://hydroshare.org/',
  },
];

export default function EventsPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=presentations');
  const docsUrl = useBaseUrl('/docs/products/intro');

  return (
    <Layout title="Events" description="CIROH Events">
      <EventsPageContent
        contributeUrl={contributeUrl}
        docsUrl={docsUrl}
      />
    </Layout>
  );
}

function EventsPageContent({ contributeUrl, docsUrl }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  const defaultImage = isDarkTheme ? DatasetDarkIcon : DatasetLightIcon;

  const [events, setEvents] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const onResultsChange = useCallback((results, meta) => {
    setEvents(results);
    setStatsLoading(Boolean(meta?.loading));
  }, []);

  const stats = useMemo(() => getResourceStats(events), [events]);

  return (
    <>
      {/* Hero */}
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
        <div className="margin-top--lg">
          <Header
            title="Events"
            tagline="Conferences, workshops, and meetings where CIROH and NOAA hydrologic research is shared. Click an event to browse its presentations."
            buttons={[]}
          />
        </div>
      </section>

      {/* Stats */}
      <StatsBar
        loading={statsLoading}
        items={[
          { label: 'Total Events', value: stats.total },
          { label: 'Categories', value: stats.categories },
          { label: 'Contributors', value: stats.contributors },
          { label: 'Latest Update', value: stats.lastUpdated },
        ]}
      />

      <main className="tw-relative tw-z-20">
        <HydroShareResourcesSelector
          keyword="ciroh_hub_event"
          defaultImage={defaultImage}
          variant="modern"
          cardsComponent={HydroShareEventCards}
          onResultsChange={onResultsChange}
        />

        <div className="tw-pb-16">
          <TechBox items={items} type={"Events"} />
        </div>
      </main>
    </>
  );
}
