import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const NWMBigQuery = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem'
    }}>
      <div style={{
        display: 'inline-block',
        padding: '0.375rem 1rem',
        background: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.08)',
        border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.25)'}`,
        borderRadius: '9999px',
        marginBottom: '1rem'
      }}>
        <span style={{
          color: isDark ? '#06b6d4' : '#0891b2',
          fontSize: '0.875rem',
          fontWeight: 500
        }}>
          Data Access
        </span>
      </div>

      <h1 style={{
        fontSize: '3rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
        color: 'var(--ifm-heading-color)',
        lineHeight: 1.2
      }}>
        Accessing NWM BigQuery API
      </h1>

      <p style={{
        fontSize: '1.25rem',
        lineHeight: 1.75,
        marginBottom: '2rem',
        maxWidth: '70rem',
        color: 'var(--ifm-color-emphasis-700)'
      }}>
        To access CIROH's NWM BigQuery API, please submit the form below. For additional details, see the{' '}
        <a href="https://hub.ciroh.org/docs/products/data-management/bigquery-api/" target="_blank" rel="noopener noreferrer">
          BigQuery API documentation
        </a>.
      </p>

      <div style={{
        padding: '2rem',
        background: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.8)',
        border: isDark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(203, 213, 225, 0.7)',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: 'linear-gradient(to bottom right, #06b6d4, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark
                ? '0 10px 15px -3px rgba(6, 182, 212, 0.2)'
                : '0 10px 15px -3px rgba(6, 182, 212, 0.25)'
            }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              margin: 0
            }}>
              Request API Access
            </h3>
          </div>
          <p style={{
            color: 'var(--ifm-color-emphasis-700)',
            margin: 0,
            lineHeight: 1.6
          }}>
            Get access to CIROH's National Water Model (NWM) data through our BigQuery API service.
          </p>
        </div>

        <a
          href="https://github.com/CIROH-UA/r2ohc_platform/issues/new?template=cloud_resources_request.yml"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: isDark ? '#06b6d4' : '#0891b2',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 500,
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            textDecoration: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          NWM BigQuery API Data Access Request Form
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default NWMBigQuery;