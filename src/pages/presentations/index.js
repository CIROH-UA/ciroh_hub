import React from "react";
// import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import Header from "@site/src/components/Header";
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import Presentations from "@site/src/components/Presentations";
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
const items = [
  {
    lightIcon: HydroShareLogo,
    darkIcon: HydroShareLogo,
    alt: 'HydroShare',
  },
];

export default function PresentationsPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=presentations');
  const { isDarkTheme } = useDocusaurusContext();

  return (
    <Layout title="Presentations" description="CIROH Presentations">
      <div className="tw-fixed tw-inset-0 tw-pointer-events-none" style={{ zIndex: 1 }}>
        <ConstellationCanvas isDarkTheme={isDarkTheme} />
      </div>
      <div className="margin-top--lg">
        <Header 
            title="Presentations" 
            tagline="Presentations and workshops regarding CIROH and NOAA's hydrologic research, offering cutting-edge insights into the latest tools and advances in hydrology."
            buttons={[
              { label: "Add your Presentation", href: contributeUrl, primary: true },
            ]}
        />
      </div>

      <main>
        <Presentations/>

        {/* <HydroShareResourcesSelector keyword="ciroh_portal_data" /> */}
        <TechBox items={items} type={"Presentations"}  />
      </main>
    
    </Layout>
  );
}

