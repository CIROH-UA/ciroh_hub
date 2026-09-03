import React, { useCallback } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from "./styles.module.css";

const DEFAULT_POWERED_BY = [
  {
    name: 'Tethys Platform',
    href: 'https://www.tethysplatform.org/',
    className: styles.link,
  },
  {
    name: 'HydroShare',
    href: 'https://hydroshare.org/',
    className: styles.link,
  },
];

export default function TechBox({ items=DEFAULT_POWERED_BY,type }) {
  const { colorMode } = useColorMode();

  const renderPoweredBy = useCallback(() => {
    if (!items || items.length === 0) return null;
    return items.map((item, index) => {
      const isFirst = index === 0;
      const isLast = index === items.length - 1;
      const separator = isFirst ? ' ' : isLast ? ' and ' : ', ';

      return (
        <React.Fragment key={`${item.name}-${index}`}>
          {separator}
          <a href={item.href} className={item.className || styles.link}>
            {item.name}
          </a>
        </React.Fragment>
      );
    });
  }, [items]);

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
