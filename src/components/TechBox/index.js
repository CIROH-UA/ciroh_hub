import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from "./styles.module.css";

export default function TechBox({ items, type, poweredByItems }) {
  const { colorMode } = useColorMode();

  const renderPoweredBy = () => {
    if (!poweredByItems || poweredByItems.length === 0) return null;
    
    return poweredByItems.map((item, index) => (
      <React.Fragment key={item.name}>
        {index > 0 && index === poweredByItems.length - 1 ? ' and ' : ', '}
        <a 
          href={item.href} 
          className={item.className || styles.link}
        >
          {item.name}
        </a>
      </React.Fragment>
    )).slice(1); // Remove leading comma
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.devBox}>
        <h4 className={styles.heading}>
          CIROH {type} are powered by{renderPoweredBy()}
        </h4>
        <div className={styles.imagesContainer}>
          {items.map((item, index) => (
            <img
              key={index}
              src={colorMode === 'dark' ? item.darkIcon : item.lightIcon}
              alt={item.alt}
              className={styles.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

TechBox.defaultProps = {
  poweredByItems: [
    {
      name: 'Tethys Platform',
      href: 'https://www.tethysplatform.org/',
      className: styles.link
    },
    {
      name: 'HydroShare',
      href: 'https://hydroshare.org/',
      className: styles.link
    }
  ]
};