import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './NewsComponent.module.css';

const NewsComponent = ({ data, isLatest }) => {
  const [isExpanded, setIsExpanded] = useState(isLatest);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const logoSafeUrl = useBaseUrl("/img/logos/ciroh-bgsafe.png");
  const sidelineDarkUrl = useBaseUrl("/img/graphics/news/sideline-dark.png");
  const sidelineLightUrl = useBaseUrl("/img/graphics/news/sideline-light.png");
  const underlinesDarkUrl = useBaseUrl("/img/graphics/news/underlines-dark.png");
  const underlinesLightUrl = useBaseUrl("/img/graphics/news/underlines-light.png");

  return (
    <div className={`${styles.newsContainer} tw-rounded-2xl tw-overflow-hidden tw-shadow-lg tw-bg-white dark:tw-bg-gray-800 tw-transition-all tw-duration-300`}>
      <div 
        className="tw-flex tw-items-center tw-justify-between tw-p-8 tw-bg-gradient-to-br tw-from-slate-900 tw-to-slate-800 dark:tw-from-cyan-500 dark:tw-to-cyan-700 tw-relative tw-overflow-hidden tw-cursor-pointer tw-transition-all tw-duration-300 hover:tw-shadow-xl"
        onClick={toggleExpand}
      >
        <div className={`${styles.logoSection} tw-mr-8`}>
          <img className={`${styles.darkImage} ${styles.logo} tw-max-h-32 tw-max-w-32 tw-drop-shadow-lg tw-transition-transform tw-duration-300 hover:tw-scale-110`} alt="CIROH logo" src={logoSafeUrl} />
          <img className={`${styles.lightImage} ${styles.logo} tw-max-h-32 tw-max-w-32 tw-drop-shadow-lg tw-transition-transform tw-duration-300 hover:tw-scale-110`} alt="CIROH logo" src={logoSafeUrl} />
        </div>
        
        <div className={`${styles.titleSection} tw-flex tw-flex-col tw-items-center tw-relative tw-z-10 tw-flex-1`}>
          <div className={`${styles.titleRow} tw-flex tw-items-center tw-gap-4 tw-mb-2`}>
            <img className={`${styles.darkImage} ${styles.waveIcon} tw-max-h-8 tw-filter tw-brightness-0 tw-invert tw-opacity-80`} alt="Wave graphic" src={sidelineDarkUrl} />
            <img className={`${styles.lightImage} ${styles.waveIcon} tw-max-h-8 tw-filter tw-brightness-0 tw-invert tw-opacity-80`} alt="Wave graphic" src={sidelineLightUrl} />
            <span className={`${styles.titleText} tw-text-2xl tw-font-semibold tw-text-white tw-drop-shadow-lg tw-tracking-wider`}>News</span>
            <img className={`${styles.darkImage} ${styles.waveIcon} tw-max-h-8 tw-filter tw-brightness-0 tw-invert tw-opacity-80`} alt="Wave graphic" src={sidelineDarkUrl} />
            <img className={`${styles.lightImage} ${styles.waveIcon} tw-max-h-8 tw-filter tw-brightness-0 tw-invert tw-opacity-80`} alt="Wave graphic" src={sidelineLightUrl} />
          </div>
          <h2 className={`${styles.dateTitle} tw-text-4xl tw-font-bold tw-text-white tw-m-2 tw-drop-shadow-xl tw-tracking-wide`}>{data.date}s</h2>
          <div className={`${styles.underlineSection} tw-mt-2`}>
            <img className={`${styles.darkImage} ${styles.underline} tw-max-h-12 tw-filter tw-brightness-0 tw-invert tw-opacity-90`} alt="Wave graphic" src={underlinesDarkUrl} />
            <img className={`${styles.lightImage} ${styles.underline} tw-max-h-12 tw-filter tw-brightness-0 tw-invert tw-opacity-90`} alt="Wave graphic" src={underlinesLightUrl} />
          </div>
        </div>

        <div className={`${styles.expandIndicator} tw-flex tw-flex-col tw-items-center tw-gap-1 tw-relative tw-z-10 tw-ml-8`}>
          <span className={`${styles.expandIcon} tw-text-3xl tw-font-light tw-text-white tw-drop-shadow-lg tw-transition-all tw-duration-300 tw-leading-none ${isExpanded ? 'tw-scale-110 tw-font-normal' : ''}`}>
            {isExpanded ? '−' : '+'}
          </span>
          <span className={`${styles.expandText} tw-text-sm tw-text-white tw-drop-shadow-md tw-opacity-90 tw-text-center tw-max-w-32 tw-leading-tight`}>
            {isExpanded ? 'Click to collapse' : 'Click to expand'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className={`${styles.newsContent} tw-bg-white dark:tw-bg-gray-800 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 tw-p-6`}>
          {data.items.map((item, index) => (
            <div key={index} className={`${styles.newsItem} tw-m-0 tw-p-6 tw-rounded-xl tw-bg-gradient-to-br tw-from-gray-50 tw-to-gray-100 dark:tw-from-gray-700 dark:tw-to-gray-600 tw-border-l-4 tw-border-gray-400 dark:tw-border-cyan-400 tw-shadow-md tw-transition-all tw-duration-300 hover:tw-shadow-lg`}>
              <div className={`${styles.itemHeader} tw-flex tw-items-center tw-gap-4 tw-mb-4 tw-flex-wrap`}>
                <span className={`${styles.badge} ${styles[`badge--${getBadgeClass(item.type)}`]}`}>
                  {item.type}
                </span>
                <h3 className={`${styles.itemTitle} tw-text-xl tw-font-bold tw-m-0 tw-leading-tight tw-text-gray-900 dark:tw-text-gray-100`}>{item.title}</h3>
              </div>
              
              <div className={`${styles.itemDescription} tw-mb-6 tw-leading-relaxed tw-text-gray-700 dark:tw-text-gray-300`}>
                {renderDescription(item.description)}
              </div>
              
              {item.link && (
                <div className={`${styles.itemLink} tw-mt-4`}>
                  <Link 
                    to={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${styles.readMoreLink} tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-bg-blue-700 dark:tw-bg-cyan-600 tw-text-white tw-no-underline tw-rounded-lg tw-font-semibold tw-transition-all tw-duration-300 tw-shadow-md hover:tw--translate-y-1 hover:tw-bg-blue-800 dark:hover:tw-bg-cyan-700 hover:tw-shadow-lg`}
                  >
                    <span>Read more</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Function to determine the badge class based on item.type
function getBadgeClass(type) {
  switch (type) {
    case "bug":
      return "danger";
    case "note":
      return "info";
    case "feature":
      return "success";
    case "news":
      return "info";
    case "update":
      return "warning";
    case "NGIAB":
      return "success";
    case "NRDS":
      return "primary";
    case "blog":  
      return "info";
    default:
      return "primary";
  }
}

// Function to render the description with links
function renderDescription(description) {
  return (
    <ReactMarkdown
      children={description}
      components={{
        a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className={styles.markdownLink} {...props} />
      }}
      urlTransform={safelyUseBaseUrl}
    />
  );
}

// Function to check if a part is a web link
function isWebLink(part) {
  return part.startsWith("http://") || part.startsWith("https://");
}

// Function to safely handle internal links
function safelyUseBaseUrl(link) {
  if (isWebLink(link)) return link;
  else return useBaseUrl(link);
}

export default NewsComponent;