import React from "react";
import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Header from "@site/src/components/Header";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import TethysLogoDark from '@site/static/img/logos/tethys-platform-dark.png';
import TethysLogWhite from '@site/static/img/logos/tethys-platform-white.png';
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';

const items = [
  {
    lightIcon: TethysLogoDark,
    darkIcon: TethysLogWhite,
    alt: 'Tethys Platform',
  },
  {
    lightIcon: HydroShareLogo,
    darkIcon: HydroShareLogo,
    alt: 'HydroShare',
  },
];

export default function AppsPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=apps');
  const defaultImage = 'https://ciroh-portal-static-data.s3.us-east-1.amazonaws.com/app_placeholder.png'
  const { isDarkTheme } = useDocusaurusContext();
  
  return (
    <Layout title="Apps" description="CIROH Apps">
      <div className="tw-fixed tw-inset-0 tw-pointer-events-none" style={{ zIndex: 1 }}>
        <ConstellationCanvas isDarkTheme={isDarkTheme} />
      </div>


      <div className="margin-top--md">
        <Header 
            title="Apps" 
            tagline="Enhance forecasting, analysis, and water resource management by making your web applications and tools accessible to CIROH and NOAA's hydrologic research initiatives."
            buttons={[
              { label: "Add your Apps", href: contributeUrl, primary: true },
            ]}
        />
      </div>
      <main>
        <HydroShareResourcesSelector keyword="nwm_portal_app" defaultImage={defaultImage} />
        <TechBox items={items} type={"Applications"} tethys/>
      </main>
    
    </Layout>
  );
}

