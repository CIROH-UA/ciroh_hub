import React from "react";
// import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import Header from "@site/src/components/Header";
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import Datasets from "@site/src/components/Datasets";
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



export default function DatasetsPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=datasets');
  const { isDarkTheme } = useDocusaurusContext();
  return (
    <Layout title="Datasets" description="CIROH Datasets">
      <div className="tw-fixed tw-inset-0 tw-pointer-events-none" style={{ zIndex: 1 }}>
        <ConstellationCanvas isDarkTheme={isDarkTheme} />
      </div>
      <div className="margin-top--md">
        <Header 
            title="Data" 
            tagline="Datasets from CIROH and NOAA's hydrologic research, designed to enhance forecasting, analysis, and management of water resources."
            buttons={[
              { label: "Add your Dataset", href: contributeUrl, primary: true },
            ]}
        />
      </div>

      <main>
        <Datasets/>

        {/* <HydroShareResourcesSelector keyword="ciroh_portal_data" /> */}
        <TechBox items={items} type={"Datasets"}  />
      </main>
    
    </Layout>
  );
}

