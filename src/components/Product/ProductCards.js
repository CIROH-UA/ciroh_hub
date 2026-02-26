import React from "react";
import styles from "./ProductCards.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from '@docusaurus/Link';

// Icons for different link types
const LinkIcon = ({ type, url }) => {
  // Map link types to icon filename
  const iconMap = {
    github: "Github_grayscale.svg",
    docs: "Docuhub_grayscale.svg",
    hydroshare: "hydroshare_grayscale.svg",
    zotero: "zotero_grayscale.svg",
  };

  // Map link types to descriptive tooltips
  const tooltipMap = {
    github: "View on GitHub",
    docs: "View Documentation",
    hydroshare: "View on HydroShare",
    zotero: "View on Zotero",
  };

  const iconFilename = iconMap[type] || iconMap.docs;
  const iconSrc = useBaseUrl(`/img/product/${iconFilename}`);
  const tooltip = tooltipMap[type] || "View Resource";

  return (
    <a
      href={url.startsWith("http") ? url : useBaseUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.linkIcon}
      title={tooltip}
      aria-label={tooltip}
    >
      <img
        src={iconSrc}
        alt={`${type} icon`}
        width="20"
        height="20"
        style={{ display: "block" }}
      />
    </a>
  );
};

const CategoryBadge = ({ category }) => {
  return <span className={styles.categoryBadge}>{category}</span>;
};

const ProductCard = ({ product }) => {
  return (
    <div className={styles.productCard}>
      <div className={styles.cardHeader}>
        <div className={styles.productIcon}>
          <img
            src={product.iconUrl}
            alt={`${product.name} icon`}
            className={styles.iconImage}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          <div className={styles.fallbackIcon} style={{ display: "none" }}>
            📦
          </div>
        </div>
        <div className={styles.cardHeaderContent}>
          <Link to={product.links.docs}><h3 className={styles.productName}>{product.name}</h3></Link>
          <CategoryBadge category={product.category} />
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.productDescription}>{product.description}</p>

        <div className={styles.productMeta}>
          <div className={styles.tags}>
            {product.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.productLinks}>
          {Object.entries(product.links).map(([type, url]) => (
            <LinkIcon key={type} type={type} url={url} />
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductCards = ({ productsData }) => {
  // Must call useBaseUrl during render (not inside event handlers)
  const adminAddSoftwareUrl = useBaseUrl('/admin/add-software');

  const handleAddProduct = () => {
    // Send user to the admin add form; the page will trigger GitHub login if needed.
    window.location.href = adminAddSoftwareUrl;
  };

  return (
    <div className={styles.productsContainer}>

      {/* "Add product" form isn't planned for this phase of the launch. Dummying this out for now. */}
      {/*
      <div className={styles.productsHeader}>
        <button className={styles.addProductButton} onClick={handleAddProduct}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
          Add Your Product
        </button>
      </div>
      */}

      <div className={styles.productsGrid}>
        {productsData.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductCards;
