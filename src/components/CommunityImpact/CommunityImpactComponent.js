import React from 'react';
import styles from './CommunityImpact.module.css';
import BlogFilter from '../BlogFilter';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CardSwap, { Card } from './cardSwap'
import Particles from './particleBG';
import CloudInfraDashboard from "./cloudInfraDashboard";
import Link from '@docusaurus/Link';
import { communityImpactData } from '@site/src/data/communityImpactData';


const ImpactItem = ({ title, count, imageSrc, users }) => (
  <div className={clsx(styles.impactItem, 'card')}>
    <img src={imageSrc} alt={`${title} icon`} className={styles.impactIcon} />
    <h3 className={styles.impactTitle}>{title}</h3>
    <p className={styles.impactCount}>{count} ongoing projects</p>
    <p className={styles.impactCount}>{users} active users</p>
  </div>
);

export default function CommunityImpactComponent() {
  const cards = [
  {
    accent: "aws",
    title: "Amazon Web Services",
    color: "#FF9900",
    svg: <img src={useBaseUrl("/img/logos/corp/aws-black.svg")} alt="AWS Logo" />,
    stats: [
      { value: communityImpactData.aws.projects, bar: communityImpactData.aws.projectsBar, label: "Ongoing Projects" },
      { value: communityImpactData.aws.users, bar: communityImpactData.aws.usersBar, label: "Active Users" },
    ],
  },
  {
    accent: "gcp",
    title: "GCP + 2i2c JupyterHub",
    color: "#4285F4",
    svg: <img src={useBaseUrl("/img/logos/corp/google-cloud.jpg")} alt="GCP Logo" />,
    stats: [
      { value: communityImpactData.gcp.projects, bar: communityImpactData.gcp.projectsBar, label: "Ongoing Projects" },
      { value: communityImpactData.gcp.users, bar: communityImpactData.gcp.usersBar, label: "Active Users" },
    ],
  },
  {
    accent: "hpc",
    title: "On-Premise HPC",
    color: "#10B981",
    svg: <img src={useBaseUrl("/img/logos/pantarhei.jpg")} alt="HPC Logo" />,
    stats: [
      { value: communityImpactData.nsf.projects, bar: communityImpactData.nsf.projectsBar, label: "Ongoing Projects" },
      { value: communityImpactData.nsf.users, bar: communityImpactData.nsf.usersBar, label: "Active Users" },
    ],
  },
  {
    accent: "nsf",
    title: "NSF ACCESS Allocations",
    color: "#8B5CF6",
    svg: <img src={useBaseUrl("/img/logos/nsf-logo.png")} alt="NSF Logo" />,
    stats: [
      { value: communityImpactData.nsf.projects, bar: communityImpactData.nsf.projectsBar, label: "Ongoing Projects" },
      { value: communityImpactData.nsf.users, bar: communityImpactData.nsf.usersBar, label: "Active Users" },
    ],
  },
];

  return (
    <div>
      <section className="tw-text-black dark:tw-text-white tw-body-font tw-relative tw-overflow-hidden">

        {/* PARTICLES BACKGROUND (receives mouse events) */}
        <div className="tw-absolute tw-inset-0 tw--z-10 tw-pointer-events-auto">
          <Particles
            particleColors={['#ffffff', '#ffffff']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        {/* HERO CONTENT (ignores pointer events EXCEPT buttons/card components) */}
        <div className="tw-container tw-mx-auto tw-flex tw-px-5 tw-py-16 md:tw-flex-row tw-flex-col tw-items-center tw-relative tw-z-10 tw-pointer-events-none">

          <div className="lg:tw-flex-grow md:tw-w-1/2 lg:tw-pr-24 md:tw-pr-16 tw-flex tw-flex-col md:tw-items-start md:tw-text-left tw-mb-16 md:tw-mb-0 tw-items-center tw-text-center">

            <h1
              className={clsx(
                styles.heroTitle,
                "tw-text-5xl sm:tw-text-6xl lg:tw-text-7xl tw-font-bold tw-mb-4"
              )}
            >
              <span className="tw-text-black dark:tw-text-white">Community </span>
              <span className="tw-text-black dark:tw-text-cyan-300">Impact</span>
            </h1>

            <p className="tw-mb-8 tw-leading-relaxed tw-text-lg">
              We are committed to providing infrastructure support to CIROH consortium partners and members to advance their research. Our impact spans across various cloud platforms and resources. Here's an overview of our contributions:
            </p>

            {/* BUTTONS (re-enable pointer events) */}
            <div className="tw-flex tw-justify-center tw-pointer-events-auto">

              <Link
                                className={`tw-no-underline lg:tw-text-xl tw-inline-flex tw-items-center tw-justify-center tw-px-6 tw-py-3 tw-rounded-lg tw-font-semibold tw-transition-all tw-duration-300 tw-border-2 tw-outline tw-outline-cyan-500 tw-text-cyan-600 hover:tw-bg-cyan-500 hover:tw-text-black dark:tw-outline-cyan-500 dark:tw-text-cyan-300 dark:hover:tw-bg-cyan-500 dark:hover:tw-text-black`}
                                href="/docs/products/ngiab/office-hours"
                                style={{ textDecoration: "none", marginRight: "10px" }}
                              >
                                Get Involved
                              </Link>
            </div>
          </div>

          {/* CARD SWAP SECTION (also restored pointer events) */}
          <div className="lg:tw-max-w-xl lg:tw-w-full md:tw-w-1/2 tw-w-5/6 tw-pointer-events-auto">
            <div className="tw-relative tw-h-[600px]">
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={true}
              >
                <Card>
                  <h3 className="tw-text-white">💧Transforming Water Prediction</h3>
                  <p>
                    CIROH is building the next generation of operational hydrologic models used
                    across the nation. By integrating research-grade science into deployable tools,
                    we help agencies and communities make faster, more informed decisions about water resources.
                    Our work ensures that flood, drought, and streamflow predictions are more accurate,
                    accessible, and actionable than ever before.
                  </p>
                </Card>

                <Card>
                  <h3 className="tw-text-white">🤝 Powered by Collaborative Science</h3>
                  <p>
                    CIROH connects leading universities, federal agencies, and scientists to tackle
                    the nation’s most pressing water challenges. Our collaborative framework enables
                    shared data, open models, and scalable breakthroughs. Instead of working in isolation,
                    researchers innovate as part of a unified national hydrology community.
                  </p>
                </Card>

                <Card>
                  <h3 className="tw-text-white">💻 Data, Cloud & Cyberinfrastructure</h3>
                  <p>
                    Modern water research demands advanced computing - and CIROH delivers. Through
                    cloud-ready workflows, curated datasets, HPC resources, and the CIROH-2i2c JupyterHub,
                    we eliminate barriers to scientific experimentation. Researchers can run complex
                    hydrologic models at scale, collaborate instantly, and accelerate time-to-discovery.
                  </p>
                </Card>

                <Card>
                  <h3 className="tw-text-white">🌍 Community Impact & Resilience</h3>
                  <p>
                    Our mission goes far beyond research - CIROH helps communities better understand
                    and prepare for water-related risks. By partnering with local agencies and
                    practitioners, we bring advanced prediction tools into real-world decision making.
                    This work strengthens resilience, protects infrastructure, and safeguards lives.
                  </p>
                </Card>

              </CardSwap>
            </div>
          </div>

        </div>
      </section>

      <CloudInfraDashboard cards={cards} />

      {/* <hr className={styles.sectionDivider} /> */}
      <BlogFilter />
    </div>
  );
}