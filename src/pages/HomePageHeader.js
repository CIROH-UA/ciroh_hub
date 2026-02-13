import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './index.module.css';


function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  return (
    <header
      className={clsx(
        styles.heroBanner,
        'tw-relative tw-overflow-hidden tw-min-h-screen tw-flex tw-items-center'
      )}
    >
      {/* Content container */}
      <div className="tw-relative tw-z-20 tw-container tw-mx-auto tw-px-10 lg:tw-pl-28 tw-py-16">
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-20 lg:tw-gap-28 tw-items-center">

          {/* LEFT SIDE — TEXT */}
          <div className="tw-flex tw-flex-col tw-justify-center tw-space-y-6 tw-order-2 lg:tw-order-1">
            <div>
              <h1
                className={clsx(
                  styles.heroTitle,
                  'tw-text-5xl sm:tw-text-6xl lg:tw-text-7xl tw-font-bold tw-mb-4'
                )}
              >
                <span className="tw-text-blue-800 dark:tw-text-white">CIROH</span>{' '}
                <span className="tw-text-blue-800 dark:tw-text-cyan-400"> Hub</span>
              </h1>


              <h2
                className={clsx(
                  styles.heroSubtitle,
                  'tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-light tw-mb-6',
                  isDarkTheme ? 'tw-text-slate-200' : 'tw-text-blue-900'
                )}
              >
                {siteConfig.tagline}
              </h2>
            </div>

            <p
              className={clsx(
                styles.heroDescription,
                'tw-text-sm sm:tw-text-base lg:tw-text-xl tw-leading-relaxed tw-max-w-lg',
                isDarkTheme ? 'tw-text-white' : 'tw-text-blue-700'
              )}
            >
             Research data, software, tools, documentation, and other resources of the <span className={clsx('tw-font-semibold', isDarkTheme ? 'tw-text-white' : 'tw-text-blue-600')}>NOAA-supported Cooperative Institute for Research to Operations in Hydrology."</span> 
            </p>

            {/* CTA Buttons */}
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-gap-4 tw-pt-4">
              <Link
                className="tw-no-underline lg:tw-text-xl tw-inline-flex tw-items-center tw-justify-center tw-px-6 tw-py-3 tw-rounded-lg tw-font-semibold tw-transition-all tw-duration-300 tw-bg-blue-700 dark:tw-bg-cyan-500 tw-text-white dark:hover:tw-bg-cyan-700 hover:tw-bg-blue-800"
                to="/publications"
              >
                Publications
              </Link>

              <Link
                className={clsx(
                  'tw-no-underline lg:tw-text-xl tw-inline-flex tw-items-center tw-justify-center tw-px-6 tw-py-3 tw-rounded-lg tw-font-semibold tw-transition-all tw-duration-300 tw-border-2 tw-outline tw-outline-blue-600 tw-text-blue-700 hover:tw-bg-blue-600 hover:tw-text-white dark:tw-outline-white dark:tw-text-white dark:hover:tw-bg-white dark:hover:tw-text-cyan-700',

                  // colorMode === "dark"
                  //   ? 'tw-border-slate-300 tw-text-white hover:tw-border-white hover:tw-text-white'
                  //   : 'tw-border-slate-400 tw-text-blue-700 hover:tw-border-blue-600 hover:tw-text-blue-600'
                )}
                to="/docs/services/access"
              >

                IT Services
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE — LOGO */}
          <div className="tw-flex tw-items-center tw-justify-center tw-order-1 lg:tw-order-2">
            <div className="tw-relative">

              {/* DROPLET GLOW */}
              <div
                className={clsx(
                  styles.glowCircle,
                  'tw-absolute -tw-inset-24 tw-rounded-full tw-opacity-30 tw-blur-3xl',
                  isDarkTheme
                    ? 'tw-bg-gradient-to-br tw-from-cyan-500 tw-to-blue-500'
                    : 'tw-bg-gradient-to-br tw-from-blue-400 tw-to-cyan-400'
                )}
              />

              {/* LOGO CIRCLE */}
              <div
                className={clsx(
                  styles.logoBg,
                  'tw-relative tw-w-72 sm:tw-w-80 lg:tw-w-[26rem] tw-h-72 sm:tw-h-80 lg:tw-h-[26rem] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-2xl tw-animate-float',
                  isDarkTheme
                    ? 'tw-bg-white tw-shadow-blue-500/30'
                    : 'tw-bg-blue-900 tw-shadow-blue-700/40'
                )}
              >
                <img
                  src={isDarkTheme ? "img/logos/ciroh-bgsafe.png" : "img/logos/ciroh-dark.png"}
                  alt="CIROH Logo"
                  className="tw-w-48 sm:tw-w-56 lg:tw-w-64 tw-h-auto tw-drop-shadow-xl"
                />


                <div className="tw-absolute tw-inset-0 tw-rounded-full tw-border-4 tw-border-blue-300/30 tw-animate-ping-slow" />
                <div className="tw-absolute tw-inset-0 tw-rounded-full tw-border-2 tw-border-blue-400/50" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

export default HomepageHeader;