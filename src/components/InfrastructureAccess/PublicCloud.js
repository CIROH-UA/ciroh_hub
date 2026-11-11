import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import InfrastructureAccessSection from './InfrastructureAccessSection';
import { useColorMode } from '@docusaurus/theme-common';

const PublicCloud = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const awsLogo = useBaseUrl('/img/logos/corp/aws-black.svg');
  const gcpLogo = useBaseUrl('/img/logos/corp/google-cloud.jpg');

  const awsRequestLink = 'https://github.com/CIROH-UA/r2ohc_platform/issues/new?template=cloud_resources_request.yml&labels=infrastructure%2Cresource-request%2Caws&title=%5BAWS%20Resource%20Request%5D%3A%20';
  const gcpRequestLink = 'https://github.com/CIROH-UA/r2ohc_platform/issues/new?template=cloud_resources_request.yml&labels=infrastructure%2Cresource-request%2Cgoogle&title=%5BGCP%20Resource%20Request%5D%3A%20';

  const providerCardBaseStyle = {
    padding: '1.5rem',
    borderRadius: '0.875rem',
    border: isDark ? '1px solid rgba(71, 85, 105, 0.65)' : '1px solid rgba(148, 163, 184, 0.4)',
    background: isDark ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.92)',
    boxShadow: isDark ? '0 10px 24px rgba(2, 6, 23, 0.28)' : '0 10px 24px rgba(15, 23, 42, 0.08)'
  };

  const steps = [
    {
      title: "Requesting Project Access",
      description: "Primary Investigators (PIs) or Workshop Leads leading CIROH projects or workshops can request public cloud resources through the provider-specific forms below. Choose AWS or Google Cloud based on where you want the resource provisioned.",
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={providerCardBaseStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.12)', overflow: 'hidden', padding: '0.45rem' }}>
                <img src={awsLogo} alt="AWS logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--ifm-heading-color)' }}>AWS Resource</h4>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--ifm-color-emphasis-600)', fontSize: '0.92rem' }}>Provision CIROH AWS resources for your project.</p>
              </div>
            </div>

            <p style={{ margin: '0 0 1rem', color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.6 }}>
              Use this form when you need AWS services such as EC2, S3, EBS, RDS, VPC, or other AWS-managed infrastructure.
            </p>

            <a
              href={awsRequestLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.8rem 1rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', fontWeight: 600, textDecoration: 'none', borderRadius: '0.625rem' }}
            >
              Create AWS Request
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          <div style={providerCardBaseStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.1)', overflow: 'hidden', padding: '0.2rem' }}>
                <img src={gcpLogo} alt="Google Cloud logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--ifm-heading-color)' }}>GCP Resource</h4>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--ifm-color-emphasis-600)', fontSize: '0.92rem' }}>Provision CIROH Google Cloud resources for your project.</p>
              </div>
            </div>

            <p style={{ margin: '0 0 1rem', color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.6 }}>
              Use this form when you need Google Cloud services such as Compute Engine, Cloud Storage, BigQuery, GKE, VPC, IAM, or related tooling.
            </p>

            <a
              href={gcpRequestLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.8rem 1rem', background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)', color: '#ffffff', fontWeight: 600, textDecoration: 'none', borderRadius: '0.625rem' }}
            >
              Create GCP Request
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      ),
      details: (
        <>
          <p style={{marginBottom: '0.75rem'}}>1. Select the provider card that matches the environment you want provisioned for your project.</p>
          <p style={{marginBottom: '0.75rem'}}>2. Complete the cloud resource request form with your project details, required services, timeline, and estimated cost.</p>
          <p style={{marginBottom: '0.75rem'}}>3. Our team will review the request, coordinate provisioning, and follow up if more information is needed.</p>
          <p style={{marginBottom: '0.75rem'}}>
            <strong>Reference:</strong> Please refer to{' '}
            <a 
              href="https://github.com/CIROH-UA/r2ohc_platform/issues/new" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{color: '#06b6d4', textDecoration: 'underline'}}
            >
              the issue tracker
            </a>
            {' '}for examples of previous requests.
          </p>
        </>
      )
    }
  ];

  const description = (
    <div>
      <p style={{marginBottom: '1.5rem'}}>
        CIROH has partnered with{' '}
        <Link to="/docs/services/cloudservices/aws/#requesting-ciroh-aws-accounts" style={{ fontWeight: 600 }}>AWS</Link>
        {' '}and{' '}
        <Link to="/docs/services/cloudservices/google-cloud/#requesting-ciroh-google-cloud-accounts" style={{ fontWeight: 600 }}>Google Cloud</Link>
        {' '}to provide access to their cloud computing services. Review the linked documentation for account request steps and guidance.
      </p>
      
      
    </div>
  );

  const criticalInfoStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  };

  const cardStyle = {
    padding: '2rem',
    background: isDark ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' : 'linear-gradient(135deg, rgba(191, 219, 254, 0.3) 0%, rgba(165, 243, 252, 0.3) 100%)',
    border: isDark ? '2px solid rgba(6, 182, 212, 0.3)' : '2px solid rgba(6, 182, 212, 0.4)',
    borderRadius: '1rem',
    boxShadow: isDark ? '0 8px 24px rgba(6, 182, 212, 0.15)' : '0 8px 24px rgba(6, 182, 212, 0.2)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleIconStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem'
  };

  const iconStyle = {
    width: '2rem',
    height: '2rem',
    padding: '0.5rem',
    background: isDark ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.15)',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <>
      <InfrastructureAccessSection
        badge="Public Cloud"
        title="Accessing Public Cloud Services"
        description={description}
        steps={steps}
      />
      
      <div style={criticalInfoStyle}>
        {/* Responsibilities Card */}
        <div style={cardStyle}>
          <div style={titleIconStyle}>
            <div style={iconStyle}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--ifm-heading-color)'
            }}>
              Your Responsibilities
            </h3>
          </div>
          
          <p style={{
            marginBottom: '1rem',
            color: 'var(--ifm-color-emphasis-700)',
            fontSize: '0.95rem'
          }}>
            CIROH Consortium members or partners are responsible for:
          </p>
          
          <ul style={{
            margin: 0,
            paddingLeft: '1.5rem',
            listStyleType: 'none'
          }}>
            <li style={{
              marginBottom: '0.75rem',
              paddingLeft: '1.5rem',
              position: 'relative',
              color: 'var(--ifm-color-emphasis-800)'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: '#06b6d4',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>✓</span>
              Management of CIROH subaccounts assigned to them
            </li>
            <li style={{
              marginBottom: '0.75rem',
              paddingLeft: '1.5rem',
              position: 'relative',
              color: 'var(--ifm-color-emphasis-800)'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: '#06b6d4',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>✓</span>
              Project-specific software and environment configuration
            </li>
            <li style={{
              paddingLeft: '1.5rem',
              position: 'relative',
              color: 'var(--ifm-color-emphasis-800)'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: '#06b6d4',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>✓</span>
              Handling account creation and/or access for project contacts
            </li>
          </ul>
        </div>

        {/* Cost of Use Card */}
        <div style={cardStyle}>
          <div style={titleIconStyle}>
            <div style={iconStyle}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--ifm-heading-color)'
            }}>
              Cost of Use
            </h3>
          </div>
          
          <ul style={{
            margin: 0,
            marginBottom: '1.5rem',
            paddingLeft: '1.5rem',
            listStyleType: 'none'
          }}>
            <li style={{
              marginBottom: '0.75rem',
              paddingLeft: '1.5rem',
              position: 'relative',
              color: 'var(--ifm-color-emphasis-800)'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: '#10b981',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>★</span>
              Use of CIROH-2i2c JupyterHub is <strong>free</strong> for all consortium projects
            </li>
            <li style={{
              marginBottom: '0.75rem',
              paddingLeft: '1.5rem',
              position: 'relative',
              color: 'var(--ifm-color-emphasis-800)'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: '#06b6d4',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>$</span>
              Individual projects are allotted <strong>$500 monthly</strong> for AWS and Google Cloud
            </li>
            <li style={{
              paddingLeft: '1.5rem',
              position: 'relative',
              color: 'var(--ifm-color-emphasis-800)'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: '#f59e0b',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>⚠</span>
              Projects exceeding budget may request additional funds below
            </li>
          </ul>

          <a 
            href="https://github.com/CIROH-UA/r2ohc_platform/issues/new?template=exceeding_budget_request.yml"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.75rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              width: '100%',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            Request Additional Budget
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
};

export default PublicCloud;