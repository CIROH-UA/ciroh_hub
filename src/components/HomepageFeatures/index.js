import React, { useState, useRef, useEffect } from 'react';
import clsx from "clsx";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./bootstrap.min.css";
import "./cta-2.css";
import "./cta-1.css";
import styles from "./styles.module.css";
import "./whyDocuhub.css";
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ResearcherTestimonials from './testimonial';
import TeamMembers from './teamMembers';
import PrincipalInvestigators from './principalInvestigators';
import HighlightCards from './highlightCards'
import Hyperspeed from '../Reactbits/hyperSpeed'
import CardCarousel from "./CardCarousel";
import CardGridSection from "./cardGrid";
import { cardGridItems } from "./cardGridItems";
// Correct import for Docusaurus — NO alias
import { fetchResourcesBySearch } from "../../api/hydroshareAPI";

async function countByKeyword(keyword) {
  let total = 0;
  let page = 1;

  while (true) {
    // Use fetchResourcesBySearch to match the ResourceBrowser implementation
    const results = await fetchResourcesBySearch(
      keyword,
      "",   // searchText
      false, // ascending
      "modified", // sortBy
      undefined, // author
      page // pageNumber
    );

    if (!Array.isArray(results) || results.length === 0) break;

    total += results.length;

    if (results.length < 40) break; // No more pages
    page++;
  }

  return total;
}

async function fetchStats() {
  const [
    datasets,
    presentations,
    courses,
    products
  ] = await Promise.all([
    countByKeyword("ciroh_portal_data"),
    countByKeyword("ciroh_portal_presentation"),
    countByKeyword("nwm_portal_module"),
    countByKeyword("nwm_portal_app")
  ]);

  return {
    datasets,
    presentations,
    courses,
    products
  };
}

const carouselCards = [
  {
    title: "Documentation",
    image: "img/graphics/documentation.png",
    description: "Dive into our comprehensive documentation to access in-depth information about various CIROH products, including but not limited to NextGen, Snow model, Tethys, and more.",
    link: "/docs/products/intro"
  },
  {
    title: "Cloud Services",
    image: "img/graphics/cloud.png",
    description: "Explore our array of cloud services and offerings, where you can delve into the specifics of CIROH-AWS cloud. Learn how to gain access to this cloud infrastructure and uncover insights into working seamlessly with the 2i2c cloud services.",
    link: "/docs/services/intro"
  },
  {
    title: "Policies",
    image: "img/graphics/tutorial.png",
    description: "Discover recommendations and best practices for CIROH's research, projects, and infrastructure.",
    link: "/docs/policies/intro"
  },
  {
    title: "NextGen In A Box",
    image: "img/logos/ngiab.png",
    description: "Utilize NextGen In A Box (NGIAB) to locally run NextGen framework. Choose specific regions or basins for analysis, control input data, and modify confiurations, all within a containerized environment.",
    link: "/docs/products/ngiab/distributions/ngiab-docker"
  },
  {
    title: "AWS",
    image: "img/logos/corp/aws-circle.png",
    description: "Leverage the power of CIROH AWS Account to elevate your hydrological research. Get access to enterprise-level AWS cloud platform, and utilize AWS computing resources and scalable storage for your research.",
    link: "/docs/services/cloudservices/aws"
  },
  {
    title: "Google Cloud",
    image: "img/logos/corp/google-cloud.jpg",
    description: "Explore different services and tools offered by CIROH Google Cloud. Learn how to access Google Cloud Platform (GCP) and leverage its resources for your research and projects.",
    link: "/docs/services/cloudservices/google-cloud"
  },
  {
    title: "CIROH-2i2c JupyterHub",
    image: "img/logos/corp/jupyterhub.jpg",
    description: "Access cloud-based JupyterHub environment on Google Cloud tailored for hydrological research. Leverage computing power with both CPU and GPU capabilities for advanced computational needs.",
    link: "/docs/services/cloudservices/2i2c"
  },
  {
    title: "Pantarhei",
    image: "img/logos/pantarhei.jpg",
    description: "Access Pantarhei, a high-performance computing (HPC) cluster, to run computationally intensive hydrological models. Utilize Pantarhei to perform large-scale simulations and data processing tasks.",
    link: "/docs/services/on-prem/Pantarhei"
  },
  {
    title: "Hydrofabric",
    image: "img/graphics/ciroh-synergy.jpg",
    description: "Geospatial fabric for hydrological modeling providing standardized catchment and flowline representations for water resource applications.",
    link: "docs/products/Hydrofabric/"
  }
];

const ImpactItem = ({ title, count, imageSrc, users }) => (
  <div className={styles.impactItem}>
    <img src={imageSrc} alt={`${title} icon`} className={styles.impactIcon} />
    <h2 className={styles.impactTitle}>{title}</h2>
    <p className={styles.impactCount}>{count}</p>
    <p className={styles.impactCount}>{users} active users</p>
  </div>
);

const SponsorList = [
  {
    name: "NOAA",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/04/noaa-emblem-rgb-2022-1-150x150.png",
    link: "https://www.noaa.gov/",
    width: "120",
    height: "120",
  },
  {
    name: "USGS",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/04/USGS_logo_green-1.png",
    link: "https://www.usgs.gov/",
    width: "200",
    height: "80",
  },
  {
    name: "2I2C",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/04/2i2c_logo-150x150.png",
    link: "https://2i2c.org/",
    width: "120",
    height: "120",
  },
  {
    name: "Lynker",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/04/Lynker-no-tag.png",
    link: "https://lynker.com/",
    width: "200",
    height: "80",
  },
  {
    name: "OWP",
    logo: "https://portal.ciroh.org/assets/images/owp_logo-cf6a5647bff6e38e14b683fb5ba3299c.png",
    link: "https://water.noaa.gov/",
    width: "300",
    height: "300",
  },
];
const MemberList = [
  {
    name: "Utah State University",
    logo: "https://i.pinimg.com/originals/96/65/d4/9665d4322a25b6a2ff8cc4f31a178749.png",
    link: "https://uwrl.usu.edu/",
    width: "210",
    height: "100",
  },
  {
    name: "The University of Vermont",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/UVMLogoSolid7484stacked-300x124.png",
    link: "https://www.uvm.edu/ciroh/",
    width: "210",
    height: "70",
  },
  {
    name: "University of Utah",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/University_of_Utah_horizontal_logo.svg/1280px-University_of_Utah_horizontal_logo.svg.png",
    link: "https://www.civil.utah.edu/",
    width: "210",
    height: "70",
  },

  {
    name: "The University of Alabama in Huntsville",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/UAH_primary-300x159.png",
    link: "https://www.itsc.uah.edu/home/projects/adapt-precipitation-super-resolution-and-data-fusion-deep-learning-techniques-operational-flood-forecasting",
    width: "190",
    height: "130",
  },
  {
    name: "University of California San Diego",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/UCSD-SIO_Vertical-Color_RGB.png",
    link: "https://cw3e.ucsd.edu/",
    width: "190",
    height: "75",
  },

  {
    name: "University of Arizona",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/ua_stack_rgb_4_0-300x281.png",
    link: "https://www.arizona.edu/",
    width: "105",
    height: "95",
  },
  {
    name: "University of Hawai'i at Mānoa",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/bottom-300x151.png",
    link: "https://manoa.hawaii.edu/",
    width: "190",
    height: "100",
  },

  {
    name: "University of Iowa",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/Block-IOWA-GOLD-ffcd00-1024x512.png",
    link: "https://www.uiowa.edu/",
    width: "160",
    height: "80",
  },

  {
    name: "University of Saskatchewan",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/usask_usask_colour-300x67.png",
    link: "https://water.usask.ca/",
    width: "190",
    height: "50",
  },
  {
    name: "University of Alabama",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/A-Square-Logo-4c_Official-300x300.jpg",
    link: "https://www.ua.edu/",
    width: "70",
    height: "70",
  },

  {
    name: "University of Minnesota",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/UMN_M-wdmk-stack-D2D-maroon-blk-300x237.png",
    link: "https://environment.umn.edu/",
    width: "170",
    height: "120",
  },
  {
    name: "Tuskegee University",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/tu_logo_OPTION-300x225.png",
    link: "https://www.tuskegee.edu/",
    width: "100",
    height: "100",
  },

  {
    name: "Bringham Young University",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/byu-wordmark-blue-300x191.png",
    link: "https://www.byu.edu/",
    width: "180",
    height: "100",
  },
  {
    name: "Colorado School Of Mines",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/Mines-Stacked_1Color-blue-260x300.png",
    link: "https://ciroh.mines.edu/",
    width: "100",
    height: "120",
  },
];

const PartnerList = [
  {
    name: "Baron Weather",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/Baron-Logo_BlackVertical_2022-269x300.png",
    link: "https://baronweather.com/",
    width: "80",
    height: "105",
  },
  {
    name: "Oak Ridge National Laboratory",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/ORNL-Two-line_green-300x72.png",
    link: "https://www.ornl.gov/",
    width: "190",
    height: "50",
  },

  {
    name: "Dauphin Island Sea Lab",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/DISL-centered-logo-Tag-300x183.png",
    link: "https://www.disl.edu/",
    width: "200",
    height: "120",
  },
  {
    name: "Jupiter Intelligence",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/Jupiter_Logo_Color-300x86.png",
    link: "https://www.jupiterintel.com/",
    width: "190",
    height: "50",
  },

  {
    name: "RTI International",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/RTI_logo_rgb_1in-300x188.png",
    link: "https://www.rti.org/centers/rti-center-water-resources",
    width: "190",
    height: "100",
  },
  {
    name: "CUAHSI",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/new-logo-with-black-text-300x79.png",
    link: "https://www.cuahsi.org/",
    width: "190",
    height: "60",
  },
  {
    name: "Stevens Institute Of Technology",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/Stevens-Primary-logo_4C-RGB-262x300.png",
    link: "https://www.stevens.edu/",
    width: "126",
    height: "140",
  },
  {
    name: "Gulf Of Mexico Costal Ocean Observing System",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/GCOOS-logo-01-landscape-colors-300x188.png",
    link: "https://gcoos.org/",
    width: "150",
    height: "100",
  },
  {
    name: "New Mexico State University",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/NMSU_NoU-Crimson-266x300.png",
    link: "https://nmsu.edu/",
    width: "80",
    height: "100",
  },
  {
    name: "Penn State University",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/PS_HOR_PMS_287_284-300x99.png",
    link: "https://www.psu.edu/",
    width: "190",
    height: "70",
  },

  {
    name: "University of Southern California",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/usc_logo_centered_RGB_G-300x147.png",
    link: "https://sc.edu/",
    width: "170",
    height: "80",
  },
  {
    name: "UC Davis",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/ucdavis_logo_blue-300x52.png",
    link: "https://www.ucdavis.edu/",
    width: "190",
    height: "35",
  },
  {
    name: "Coastal Carolina University",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/ccu_stck_cmyk_2clr-300x257.png",
    link: "https://www.coastal.edu/index.php",
    width: "100",
    height: "90",
  },
  {
    name: "University of Illinois Urbana-Champaign",
    logo: "https://ciroh.ua.edu/wp-content/uploads/2023/03/University-Wordmark-Full-Color-RGB-300x78.png",
    link: "https://illinois.edu/",
    width: "180",
    height: "50",
  },
];

const Member = ({ idx, name, logo, link, width, height }) => (
  <div className="col col--6">
    <div className="avatar">
      <div className="avatar__intro">
        <div key={idx} className={styles.imagecontainer}>
          <Link to={link} target="_blank" rel="noreferrer">
            <img
              src={logo}
              alt={name}
              width={width}
              height={height}
              className="img-fluid align-center"
            />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const Card = ({ title, image, description, link }) => (
  <div className="col col--4" style={{ display: "flex", marginBottom: "20px" }}>
    <div className="card" style={{ flex: "1" }}>
      <div className="card__image" style={{ textAlign: "center" }}>
        <img
          src={image}
          alt="Image alt text"
          title="Logo Title Text 1"
          style={{ width: "65%" }}
        />
      </div>
      <div className="card__header" style={{ textAlign: "center" }}>
        <h3>{title}</h3>
      </div>
      <div className="card__body">
        <p>{description}</p>
      </div>
      <div className="card__footer">
        <Link to={link} className="button button--info button--block">
          Learn More
        </Link>
      </div>
    </div>
  </div>
);

const HyperspeedSection = () => {
  const speedRef = useRef(2);
  const [key, setKey] = useState(0);

  const handleMouseEnter = () => {
    speedRef.current = 4;
  };

  const handleMouseLeave = () => {
    speedRef.current = 4;
  };

  return (
    <div className="tw-relative tw-w-full tw-h-full">
      <div
        className="tw-w-full tw-h-full tw-rounded-2xl tw-animate-fadeIn tw-animate-float-slow tw-overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => { },
            onSlowDown: () => { },
            distortion: 'mountainDistortion',
            length: 400,
            roadWidth: 9,
            islandWidth: 2,
            lanesPerRoad: 3,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 50,
            lightPairsPerRoadWay: 50,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],

            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.05, 400 * 0.15],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.2, 0.2],
            carFloorSeparation: [0.05, 1],
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0x131318,
              brokenLines: 0x131318,
              leftCars: [0xff102a, 0xeb383e, 0xff102a],
              rightCars: [0xdadafa, 0xbebae3, 0x8f97e4],
              sticks: 0xdadafa
            }
          }}
        />

        {/* Your content goes here */}
        <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-10">
          <h1 className="tw-text-white tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-center tw-drop-shadow-lg">Your Input Matters.</h1>
        </div>
      </div>
    </div>
  );
};

const impactData = [
  {
    title: "CIROH AWS Projects",
    count: 24,
    imageSrc: "/img/logos/corp/aws-black.svg",
    users: 60,
  },
  {
    title: "CIROH Google Cloud and CIROH-2i2c JupyterHub Projects",
    count: 50,
    imageSrc: "/img/logos/corp/google-cloud.jpg",
    users: 171,
  },
  {
    title: "CIROH On-premise HPC Projects",
    count: 20,
    imageSrc: "/img/logos/pantarhei.jpg",
    users: 50,
  },
  {
    title: "CIROH NSF ACCESS Allocations Projects",
    count: 8,
    imageSrc: "/img/logos/nsf-logo.png",
    users: 27,
  },
];

export default function HomepageFeatures() {
  // ---------- STATS STATE + KEYWORD-BASED FETCHING ----------
  const [stats, setStats] = useState({
    products: 0,
    datasets: 0,
    presentations: 0,
    courses: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Count resources for a single keyword, paging until exhausted
  async function countByKeyword(keyword) {
    let total = 0;
    let page = 1;
    let totalPagesChecked = 0;
    try {
      console.log(`[countByKeyword] Starting count for: ${keyword}`);
      while (true) {
        const results = await fetchResourcesBySearch(
          keyword,
          "",         // searchText
          false,      // ascending
          "modified", // sortBy
          undefined,  // author
          page
        );

        // Support wrappers that return array or { resources: [...] }
        const items = Array.isArray(results) ? results : (results?.resources || []);

        console.log(`[countByKeyword] Page ${page}: ${items.length} items returned for ${keyword}`);
        totalPagesChecked++;

        if (!items || items.length === 0) {
          console.log(`[countByKeyword] No more items on page ${page}, stopping`);
          break;
        }

        total += items.length;

        // stop when a page is short (no more pages)
        if (items.length < 40) {
          console.log(`[countByKeyword] Short page (${items.length} < 40), stopping`);
          break;
        }
        page++;
      }
      console.log(`[countByKeyword] ${keyword}: Total ${total} resources across ${totalPagesChecked} pages`);
    } catch (err) {
      console.error(`[countByKeyword] ${keyword} error after ${totalPagesChecked} pages:`, err);
      throw err;
    }
    return total;
  }

  // Fetch all stats in parallel
  async function loadKeywordStats() {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const [datasets, presentations, courses, products] = await Promise.all([
        countByKeyword("ciroh_portal_data"),
        countByKeyword("ciroh_portal_presentation"),
        countByKeyword("nwm_portal_module"),
        countByKeyword("nwm_portal_app"),
      ]);

      setStats({ products, datasets, presentations, courses });
    } catch (err) {
      setStatsError(err?.message || String(err));
      // reset to safe defaults on error
      setStats({ products: 0, datasets: 0, presentations: 0, courses: 0 });
    } finally {
      setStatsLoading(false);
    }
  }

  // Load on mount
  useEffect(() => {
    loadKeywordStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    <><HighlightCards />
      <section className={styles.homepageContainer}>
        <div className="container">
          <CardCarousel cards={carouselCards} />
        </div>


        <div className="tw-relative tw-z-10 tw-flex tw-justify-center tw-px-6 tw-my-24">

          {/* CARD CONTAINER */}
          <div
            className="
      tw-w-full tw-rounded-3xl
      tw-border-2 tw-shadow-xl tw-transition-all tw-duration-500 tw-backdrop-blur-xl tw-bg-slate-900 tw-border-slate-700"
          >

            {/* INNER GRID */}
            <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-14 tw-items-stretch tw-auto-rows-fr">

              {/* TEXT */}
              <div className="tw-space-y-7 tw-mx-10 tw-my-16">
                <h1
                  className="
            tw-text-4xl tw-font-extrabold tw-leading-tight
            tw-text-white
          "
                >
                  Contribute
                </h1>

                <p
                  className="
            tw-text-lg tw-leading-relaxed
            tw-text-white
          "
                >
                  We welcome CIROH Consortium members to contribute to the CIROH Hub.
                  Add documentation, tutorials, workflows, or conference presentations.
                  The CIROH Hub serves as a shared platform for distributing expertise across
                  the community.{" "}
                  <span className="tw-font-semibold tw-text-yellow-400">
                    Learn how you can contribute and access the CIROH Repository below.
                  </span>
                </p>

                {/* BUTTONS */}
                <div className="tw-flex tw-flex-wrap tw-gap-4 tw-pt-3">

                  {/* BUTTON 1 */}
                  <Link
                    to="/contribute"
                    className="
              tw-inline-block tw-px-7 tw-py-3.5 tw-font-semibold tw-rounded-xl tw-shadow-lg
              tw-transition-all tw-duration-300 tw-text-slate-900 tw-text-sm tw-no-underline

              tw-bg-gradient-to-r tw-bg-slate-50
              hover:tw-bg-white hover:tw-scale-105
            "
                  >
                    How to Contribute?
                  </Link>
                  {/*
                  BUTTON 2 - REINSTATE ONCE MICROSOFT FORMS BACKEND IS FULLY RESTORED
                  <Link
                    to="https://forms.office.com/r/5ww7qRWwwf"
                    target="_blank"
                    className="
              tw-inline-block tw-px-7 tw-py-3.5 tw-font-semibold tw-rounded-xl tw-transition-all tw-duration-300 tw-no-underline
              tw-border-2 tw-bg-transparent tw-border-white tw-text-white
              hover:tw-bg-white hover:tw-text-slate-900
            "
                  >
                    Submit Feedback
                  </Link>
                  */}

                </div>
              </div>

              {/* IMAGE SECTION */}
              <HyperspeedSection />

            </div>
          </div>
        </div>

        <div className="ciroh-cards-section">
          <CardGridSection items={cardGridItems} />
        </div>




        {/* <section className="padded-page-section-feature" id="services">
          <div className="container-feature">
            <h2 className="text-center-feature mt-0">Why CIROH Hub? Elevate Your Research Journey</h2>
            <hr className="divider-feature" />
            <div className="row-feature ">
              <div className="col-lg-3-feature col-md-6-feature text-center">
                <div className="mt-5-feature">
                  <h3 className="h4 mb-2-feature">Knowledge Hub</h3>
                  <img src="img/graphics/why-docuhub-1.png" alt="docuhub image"></img>
                  <p className="text-muted-feature mb-0 mt-2">Access a centralized repository of research and educational resources to enhance your hydrological expertise.</p>
                </div>
              </div>
              <div className="col-lg-3-feature col-md-6-feature text-center">
                <div className="mt-5-feature">
                  <h3 className="h4 mb-2-feature">Research & Growth</h3>
                  <img src="img/graphics/why-docuhub-2.png" alt="docuhub image"></img>
                  <p className="text-muted-feature mb-0 mt-2">Explore cutting-edge research and innovative projects driving innovation in hydrology.</p>
                </div>
              </div>
              <div className="col-lg-3-feature col-md-6-feature text-center">
                <div className="mt-5-feature">
                  <h3 className="h4 mb-2-feature">Blog & News</h3>
                  <img src="img/graphics/why-docuhub-3.png" alt="docuhub image"></img>
                  <p className="text-muted-feature mb-0 mt-2">Stay updated with the latest news, community insights, and updates about CIROH projects.</p>
                </div>
              </div>
              <div className="col-lg-3-feature col-md-6-feature text-center">
                <div className="mt-5-feature">
                  <h3 className="h4 mb-2-feature">Education & Training</h3>
                  <img src="img/graphics/why-docuhub-4.png" alt="docuhub image"></img>
                  <p className="text-muted-feature mb-0 mt-2">Elevate your skills with tutorials, training programs, and educational materials tailored for hydrological research.</p>
                </div>
              </div>
              <div className="col-lg-3-feature col-md-6-feature text-center">
                <div className="mt-5-feature">
                  <h3 className="h4 mb-2-feature">CyberInfrastructure</h3>
                  <img src="img/graphics/why-docuhub-5.png" alt="docuhub image"></img>
                  <p className="text-muted-feature mb-0 mt-2">Leverage cloud infrastuctures, including AWS, GCP, CIROH-2i2c JupyterHub, and on-premises infrastructures tailored to hydrological research needs.</p>
                </div>
              </div>
              <div className="col-lg-3-feature col-md-6-feature text-center">
                <div className="mt-5-feature">
                  <h3 className="h4 mb-2-feature">Global Collaboration</h3>
                  <img src="img/graphics/why-docuhub-6.png" alt="docuhub image"></img>
                  <p className="text-muted-feature mb-0 mt-2">Join a global network of researchers and collaborators to share knowledge, resources, and innovations within the CIROH community.</p>
                </div>
              </div>
            </div>
          </div>
        </section> */}
        <PrincipalInvestigators />
        <TeamMembers />
        <ResearcherTestimonials />

        <section className="tw-relative tw-overflow-hidden tw-py-24 tw-bg-slate-100 dark:tw-bg-slate-900 tw-text-blue-800 dark:tw-text-white tw-rounded-2xl tw-no-underline">
          <div className="tw-container tw-mx-auto tw-flex tw-px-5 tw-items-center tw-justify-center tw-flex-col tw-relative tw-z-10">

            <div className="image-container tw-lg:w-2/6 tw-md:w-3/6 tw-w-5/6 tw-mb-16 tw-rounded-2xl tw-shadow-2xl tw-animate-fade-in-scale">
              <img
                src={useBaseUrl("/img/graphics/OurResearch.png")}
                alt="research hero"
                className="tw-w-full tw-object-cover tw-object-center tw-rounded-2xl"
              />
            </div>

            <div className="tw-text-center tw-lg:w-2/3 tw-w-full">
              <span className="tw-bg-blue-100 dark:tw-bg-blue-900/40 tw-text-blue-800 dark:tw-text-blue-300 
                      tw-text-sm tw-font-semibold tw-px-4 tw-py-1.5 tw-rounded-full">
                Innovation & Discovery
              </span>

              <h2 className="tw-text-5xl md:tw-text-6xl tw-font-extrabold tw-mb-6 tw-mt-4">
                Our Research
              </h2>

              <p className="tw-text-xl tw-max-w-2xl tw-text-slate-700 dark:tw-text-gray-300 tw-mx-auto">
                Our research advances hydrological science through{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">innovation</span>,{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">collaboration</span>, and{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">technology development</span>.
              </p>

              {/* ---------- KEYWORD-BASED STATS ---------- */}
              <div className="tw-mt-12 tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-6 tw-max-w-3xl tw-mx-auto">

                {/* PRODUCTS */}
                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
                  <div className="tw-text-4xl tw-font-bold tw-text-blue-700 dark:tw-text-cyan-300">
                    {statsLoading ? "…" : stats.products}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    PRODUCTS
                  </div>
                </div>

                {/* DATASETS */}
                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
                  <div className="tw-text-4xl tw-font-bold tw-text-blue-700 dark:tw-text-cyan-300">
                    {statsLoading ? "…" : stats.datasets}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    DATASETS
                  </div>
                </div>

                {/* PRESENTATIONS */}
                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
                  <div className="tw-text-4xl tw-font-bold tw-text-blue-700 dark:tw-text-cyan-300">
                    {statsLoading ? "…" : stats.presentations}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    PRESENTATIONS
                  </div>
                </div>

                {/* COURSES */}
                <div className="
  tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 
  tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow
  tw-col-span-2 md:tw-col-span-1 md:tw-col-start-2
">
                  <div className="tw-text-4xl tw-font-bold tw-text-blue-700 dark:tw-text-cyan-300">
                    {statsLoading ? "…" : stats.courses}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    COURSES
                  </div>
                </div>


              </div>

              {/* small error hint */}
              {statsError && (
                <div className="tw-mt-4 tw-text-sm tw-text-red-600">
                  Error loading stats: {statsError}
                </div>
              )}

            </div>
          </div>
        </section>


        <section
          className={`bsb-cta-2 py-5 ${styles.features}`}
          style={{
            width: "100%", // Ensure the section spans the full width
            margin: 0, // Remove default margin
            padding: 0, // Remove default padding if necessary
          }}
        >
          <div
            className="card rounded-3 overflow-hidden text-center bsb-overlay"
            style={{
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('./img/graphics/research-image.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "local",
              width: "100%", // Ensure the card spans the full width
              margin: 0, // Remove default margin
              padding: 0, // Remove default padding if necessary
              "--bsb-overlay-opacity": ".9",
              "--bsb-overlay-bg-color": "var(--bs-primary-rgb)",
            }}
          >
          </div>
        </section>

        <section className="tw-text-blue-800 tw-body-font tw-rounded-2xl tw-py-24 tw-relative tw-overflow-hidden">

          {/* Soft gradient overlay */}
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-blue-50/50 dark:tw-from-slate-800/40 tw-to-transparent tw-pointer-events-none"></div>

          <div className="tw-container tw-mx-auto tw-flex tw-px-5 md:tw-flex-row tw-flex-col tw-items-center tw-relative tw-z-10">

            {/* IMAGE */}
            <div className="lg:tw-max-w-lg lg:tw-w-full md:tw-w-1/2 tw-w-5/6 tw-mb-10 md:tw-mb-0 tw-rounded-2xl tw-shadow-2xl tw-animate-fade-in-scale">
              <img
                className="tw-object-cover tw-object-center tw-rounded-2xl"
                alt="hero"
                src="https://dummyimage.com/720x600/3b82f6/ffffff&text=Research"
              />
            </div>

            {/* TEXT BLOCK */}
            <div className="lg:tw-flex-grow md:tw-w-1/2 lg:tw-pl-24 md:tw-pl-16 tw-flex tw-flex-col md:tw-items-start md:tw-text-left tw-items-center tw-text-center">

              <h1 className="tw-title-font sm:tw-text-4xl tw-text-3xl tw-mb-4 tw-font-extrabold tw-text-blue-800 dark:tw-text-white">
                Cyberinfrastructure &
                <br className="tw-hidden lg:tw-inline-block" />
                Community NextGen Monthly Office Hours
              </h1>

              <p className="tw-mb-8 tw-leading-relaxed tw-text-slate-700 dark:tw-text-gray-300">
                Advancing hydrological science through{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">innovation</span>,{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">collaboration</span>, and{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">technology development</span>.
              </p>

              {/* BUTTONS */}
              <div className="tw-flex tw-justify-center tw-gap-4">
                <Link
                  className={`button tw-inline-flex tw-text-white tw-bg-blue-600 tw-border-0 
                tw-py-3 tw-px-8 tw-rounded-lg tw-text-lg tw-font-semibold
                hover:tw-bg-blue-800 tw-transition-colors
                dark:tw-bg-white dark:tw-text-slate-900 dark:hover:tw-bg-slate-300`}
                  href="/docs/products/ngiab/office-hours"
                  style={{ textDecoration: "none", marginRight: "10px" }}
                >
                  Learn More
                </Link>

              </div>

            </div>
          </div>
        </section>

        <div className="tw-w-full tw-text-blue-800 dark:tw-text-white">
          <div className={`${styles.logoBackground} tw-rounded-xl tw-p-6`}>

            <div className="tw-container tw-mx-auto">

              {/* Consortium Sponsors */}
              <div className="tw-col tw-col--12 tw-mb-10">
                <div className={`${styles.heading} tw-text-blue-800 dark:tw-text-white`}>
                  Consortium Sponsors
                </div>

                <div className={`${styles.flexListContainer} tw-flex tw-flex-wrap tw-gap-4`}>
                  {SponsorList.map((sponsor) => (
                    <Link
                      to={sponsor.link}
                      key={sponsor.name}
                      className={`${styles.sponsorwrapper} tw-bg-slate-100 dark:tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-center tw-shadow-sm`}
                    >
                      <img
                        className={styles.sponsorcontainer}
                        src={sponsor.logo}
                        alt={sponsor.name}
                        width={sponsor.width}
                        height={sponsor.height}
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Consortium Members & Partners */}
              <div className="tw-row tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">

                {/* Members */}
                <div>
                  <div className={`${styles.heading} tw-text-blue-800 dark:tw-text-white`}>
                    Consortium Members
                  </div>

                  <div className={`${styles.flexListContainer} tw-flex tw-flex-wrap tw-gap-4`}>
                    {MemberList.map((member) => (
                      <Link
                        to={member.link}
                        key={member.name}
                        className={`${styles.imagewrapper} tw-bg-slate-100 dark:tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-center tw-shadow-sm`}
                      >
                        <img
                          className={styles.imagecontainer}
                          src={member.logo}
                          alt={member.name}
                          width={member.width}
                          height={member.height}
                        />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Partners */}
                <div>
                  <div className={`${styles.heading} tw-text-blue-800 dark:tw-text-white`}>
                    Consortium Partners
                  </div>

                  <div className={`${styles.flexListContainer} tw-flex tw-flex-wrap tw-gap-4`}>
                    {PartnerList.map((partner) => (
                      <Link
                        to={partner.link}
                        key={partner.name}
                        className={`${styles.imagewrapper} tw-bg-slate-100 dark:tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-center tw-shadow-sm`}
                      >
                        <img
                          className={styles.imagecontainer}
                          src={partner.logo}
                          alt={partner.name}
                          width={partner.width}
                          height={partner.height}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* NOAA + AWI + CIROH Logos */}
              <div className={`${styles.longwrapper} tw-mt-12 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-8 tw-bg-slate-100 dark:tw-bg-white tw-rounded-lg tw-p-6 tw-shadow-sm`}>
                <div className="tw-text-center">
                  <img
                    alt="noaaImage"
                    src="img/logos/noaa.png"
                    style={{ maxHeight: "145px", width: "auto", padding: "1rem" }}
                  />
                </div>

                <div className="tw-text-center">
                  <img
                    alt="awiImage"
                    src="img/logos/awi.png"
                    style={{ maxHeight: "70px", width: "auto", padding: "1rem" }}
                  />
                </div>

                <div className="tw-text-center">
                  <img
                    alt="cirohImage"
                    src="img/logos/ciroh-light.png"
                    style={{ maxHeight: "145px", width: "auto", padding: "1rem" }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

      </section></>
  );
}
