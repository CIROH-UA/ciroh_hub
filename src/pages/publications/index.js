import React from "react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Header from "@site/src/components/Header";
import Layout from '@theme/Layout';
import Publications from "@site/src/components/Publications";
import TechBox from "@site/src/components/TechBox";
import ZoteroLightLogo from '@site/static/img/cards/zotero_logo_light.png';
import ZoteroDarkLogo from '@site/static/img/cards/zotero_logo_dark.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
const items = [
  {
    lightIcon: ZoteroLightLogo,
    darkIcon: ZoteroDarkLogo,
    alt: 'Zotero',
    name: 'Zotero',
    href: 'https://www.zotero.org/',
  },
];


export default function PublicationsPage() {

  const { siteConfig } = useDocusaurusContext();
  const contributeUrl = useBaseUrl('/contribute?current-contribution=publications');
  const { isDarkTheme } = useDocusaurusContext();
  return (
    <Layout title="Publications" description="Ciroh pubs">
      <div className="tw-fixed tw-inset-0 tw-pointer-events-none" style={{ zIndex: 1 }}>
        <ConstellationCanvas isDarkTheme={isDarkTheme} />
      </div>
      <div className="margin-top--lg">
        <Header 
            title="Publications" 
            tagline="Explore a rich selection of publications and papers featuring CIROH and NOAA's collaborative research in hydrology. Discover insights on water management, forecasting, and climate impacts through this comprehensive resource for scholars and professionals." 
            buttons={[
                { label: "Add your Publication", href: contributeUrl, primary: true },
                { label: "Visit Our Library", href: "https://www.zotero.org/groups/5261687/ciroh/library" }
              ]}
        />
      </div>

      <main className="tw-relative tw-z-20">
        
       <Publications 
          apiKey={siteConfig.customFields.zotero_api_key}
          groupId={siteConfig.customFields.zotero_group_id}
       />
       <TechBox items={items} type={"Publications"}  />
      </main>
    
    </Layout>
  );
}

