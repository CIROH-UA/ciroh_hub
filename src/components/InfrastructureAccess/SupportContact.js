import { useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import ModalGeneric from '@site/src/components/Modal/ModalGeneric';

const SupportContact = () => {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const [ modalOpen, setModalOpen ] = useState(false);
  const isDark = colorMode === 'dark';

  function toggleModalOpen() {
    setModalOpen(!modalOpen);
    return false; // For the sake of <a> elements
  }

  const contactUrl = useBaseUrl('/contact');
  const supportEmail = 'ciroh-it-support@ua.edu'
  const feedbackUrl = siteConfig?.customFields?.externalLinks?.feedbackForm || 'https://forms.cloud.microsoft/r/NzA2sLrzeJ';

  const sectionStyle = {
    maxWidth: '1200px',
    margin: '0 auto 1rem',
    padding: '0.5rem'
  };

  const cardStyle = {
    background: isDark
      ? 'linear-gradient(135deg, #0f172a 0%, #0b2545 50%, #0a1f3d 100%)'
      : 'linear-gradient(135deg, #0f3b75 0%, #0d2f5f 50%, #0a2347 100%)',
    border: isDark
      ? '1px solid rgba(56, 189, 248, 0.22)'
      : '1px solid rgba(96, 165, 250, 0.22)',
    borderRadius: '1rem',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: isDark
      ? '0 18px 45px rgba(2, 6, 23, 0.45)'
      : '0 18px 45px rgba(15, 23, 42, 0.2)'
  };

  const titleStyle = {
    fontSize: 'clamp(1.5rem, 2vw, 2rem)',
    fontWeight: 800,
    marginBottom: '1rem',
    color: '#f8fafc',
    lineHeight: 1.15
  };

  const descriptionStyle = {
    fontSize: '1.1rem',
    lineHeight: 1.7,
    color: 'rgba(226, 232, 240, 0.92)',
    maxWidth: '760px',
    margin: '0 auto 2rem'
  };

  const buttonsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center'
  };

  const primaryButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '170px',
    padding: '0.9rem 1.5rem',
    borderRadius: '0.75rem',
    background: 'linear-gradient(135deg, #22c1ee 0%, #0ea5e9 100%)',
    color: '#ffffff',
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 8px 20px rgba(14, 165, 233, 0.28)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const secondaryButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '195px',
    padding: '0.9rem 1.5rem',
    borderRadius: '0.75rem',
    background: 'transparent',
    color: '#38bdf8',
    fontWeight: 700,
    textDecoration: 'none',
    border: '2px solid #0ea5e9',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  return (
    <div style={sectionStyle}>
      <div style={cardStyle}>
        <h3 style={titleStyle}>Already Have Access?</h3>
        <p style={descriptionStyle}>
          Having issues with cyberinfrastructure you already have access to? We're here to help! Contact us at ciroh-it-support@ua.edu.
        </p>
        <div style={buttonsStyle}>
          <a href="#" style={primaryButtonStyle} onClick={toggleModalOpen}>
            Contact Support
          </a>
        </div>
        <ModalGeneric open={modalOpen} onClose={toggleModalOpen}>
          <h2>Contact Support</h2>
          <p>To get support for CIROH R2OHC, contact us at <a href={'mailto:'+supportEmail}>{supportEmail}</a>.</p>
          <Link class="button button--active button--primary" style={{'margin-right':'1.3rem','margin-bottom':'1.3rem'}} href={'mailto:'+supportEmail}>Open in Email Client</Link>
          <Link class="button button--active button--secondary" style={{'margin-right':'1.3rem','margin-bottom':'1.3rem'}} href='#' onClick={toggleModalOpen}>Close</Link>
        </ModalGeneric>
      </div>
    </div>
  );
};

export default SupportContact;
