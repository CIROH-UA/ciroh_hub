import clsx from 'clsx';
import styles from './styles.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';
// export default function Header({ title,image,  tagline, buttons }) {


//   return (
//     <header className={clsx(styles.heroBanner)}>
//       <div className={clsx('container', styles.heroContainer)}>
//         {image && (
//             <img src={image} alt={title} className={styles.heroImage} />
//         )}
//         <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
//           {title}
//         </Heading>

//         <p className={clsx('hero__subtitle', styles.heroSubtitle)}>{tagline}</p>
                
//         {buttons && buttons.length > 0 && (
//           <div className={styles.buttons}>
//             {buttons.map((button, index) => (
//               <a
//                 key={index}
//                 href={button.href}
//                 className={clsx(
//                   'button',
//                   styles.button,
//                   button.primary ? styles.buttonPrimary : styles.buttonSecondary
//                 )}
//               >
//                 {button.label}
//               </a>
//             ))}
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }


export default function Header({ title, tagline, buttons }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  return (
    <header
      className={clsx(
        styles.heroBanner,
        'tw-relative tw-overflow-hidden tw-min-svh tw-flex tw-items-center'
      )}
    >
      {/* Content container */}
      <div className="tw-relative tw-z-20 tw-container tw-mx-auto tw-px-10 lg:tw-pl-28 tw-py-20">
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
                <span className="tw-text-blue-800 dark:tw-text-white">{title}</span>{' '}
                <span className="tw-text-blue-800 dark:tw-text-cyan-400"> Hub</span>
              </h1>


              <h2
                className={clsx(
                  styles.heroSubtitle,
                  'tw-text-xl sm:tw-text-2xl lg:tw-text-2xl tw-font-light tw-mb-6',
                  isDarkTheme ? 'tw-text-slate-200' : 'tw-text-blue-900'
                )}
              >
                {tagline}
              </h2>
            </div>

        {buttons && buttons.length > 0 && (
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-gap-4 tw-pt-4 tw-justify-center">

            {buttons.map((button, index) => (
              <Link
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

