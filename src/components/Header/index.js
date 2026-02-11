import clsx from 'clsx';
import styles from './styles.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';

export default function Header({ title, tagline, buttons }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  return (
    <header
      className={clsx(
        styles.heroBanner,
        'tw-relative tw-overflow-hidden tw-flex tw-items-center'
      )}
    >
      {/* Content container */}
      <div className="tw-relative tw-z-10 tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8">
         <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 sm:tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-12 tw-items-center">
          <div className="tw-flex tw-flex-col tw-justify-center tw-order-2 md:tw-order-1 lg:tw-order-1">
            <div>
              <h1
                className={clsx(
                  styles.heroTitle,
                  'tw-text-5xl tw-text-center md:tw-text-left  sm:tw-text-6xl lg:tw-text-7xl tw-font-bold tw-mb-4'
                )}
              >
                <span className="tw-mt-6 tw-text-5xl sm:tw-text-6xl lg:tw-text-7xl tw-font-bold tw-leading-tight tw-text-cyan-700 dark:tw-text-cyan-300">
                  {title}
                </span>
              </h1>

              <p
                className={clsx(
                  'tw-mt-6 tw-max-w-2xl tw-text-center md:tw-text-left sm:tw-text-lg tw-leading-relaxed',
                  styles.heroSubtitle,
                )}
              >
                {tagline}
              </p>
            </div>

        {buttons && buttons.length > 0 && (
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-gap-4 tw-pt-4 tw-justify-center md:tw-justify-start">

            {buttons.map((button, index) => (
              <Link
                key={index}
                index={index}
                className="tw-no-underline lg:tw-text-xl tw-inline-flex tw-items-center tw-justify-center tw-px-6 tw-py-3 tw-rounded-lg tw-font-semibold tw-transition-all tw-duration-300 tw-bg-blue-700 dark:tw-bg-cyan-500 tw-text-white dark:hover:tw-bg-cyan-700 hover:tw-bg-blue-800"
                to={button.href}
              >
                {button.label}
              </Link>

            ))}
          </div>
        )}

          </div>

          {/* RIGHT SIDE - LOGO */}
          <div className="tw-flex tw-items-center tw-justify-center tw-order-1 md:tw-order-2 lg:tw-order-2">
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

