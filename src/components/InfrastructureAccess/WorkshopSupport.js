import React from 'react';
import InfrastructureAccessSection from './InfrastructureAccessSection';

const WorkshopSupport = () => {
  const steps = [
    {
      title: "Submit Workshop Requirements",
      description: "Complete our GitHub template with your workshop's technical requirements.",
      buttons: [
        {
          text: "Workshop IT Request Form",
          link: "https://github.com/CIROH-UA/r2ohc_platform/issues/new?template=workshop_IT_request.yml"
        }
      ],
      details: "Our team will process your request and ensure participants have necessary access before your workshop begins."
    }
  ];

  const description = (
    <>
      CIROH Project Leads can request computing resources for workshops using this process. Available infrastructure includes all resources from ACCESS Allocations, CIROH-2i2c JupyterHub, AWS, and Google Cloud - accessible to all consortium members and partners.
    </>
  );

  return (
    <InfrastructureAccessSection
      badge="Workshop & Events"
      title="Requesting Infrastructure Support for Workshops"
      description={description}
      steps={steps}
      helpBox={{
        title: "Available Resources",
        content: (
          <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
            <li style={{marginBottom: '0.5rem'}}>Resources from ACCESS Allocations</li>
            <li style={{marginBottom: '0.5rem'}}>CIROH-2i2c JupyterHub</li>
            <li style={{marginBottom: '0.5rem'}}>AWS Cloud Services</li>
            <li>Google Cloud Services</li>
          </ul>
        )
      }}
    />
  );
};

export default WorkshopSupport; 