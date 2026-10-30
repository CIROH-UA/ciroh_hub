import React from 'react';
import InfrastructureAccessSection from './InfrastructureAccessSection';

const OnPremises = () => {
  const steps = [
    {
      title: "Submit Project Access Request",
      description: "Primary Investigators (PIs) leading CIROH projects may use this form to request CIROH on-premise resources for their teams, including Pantarhei and Wukong.",
      buttons: [
        {
          text: "On-premises Infrastructure Request Form",
          link: "https://github.com/CIROH-UA/r2ohc_platform/issues/new?template=on_premise_request.yml"
        }
      ],
      details: "Note: The On-Premises Infrastructure Request Form must be submitted by the PI of the project."
    },
    {
      title: "Request Individual Access",
      description: "Non-UA users should complete the VPN Access Request section of the form before proceeding to the On-Premise Access Request section.",
      buttons: [
        {
          text: "On-Premise Access Request Form",
          link: "https://forms.office.com/Pages/ResponsePage.aspx?id=jnIAKtDwtECk6M5DPz-8p4IIpHdEnmhNgjOa9FjrwGtUMzdTOUpKVU5UWFNCU0ZQUlowS0cxV0xFRy4u"
        }
      ],
      details: "Before requesting individual access, the On-Premises Infrastructure Request Form above must be completed by your PI."
    }
  ];

  const description = (
    <>
      CIROH operates an on-premises infrastructure that includes high-performance computing (HPC) resources and specialized software via the Pantarhei and Wukong systems. See the <a href="https://hub.ciroh.org/docs/services/on-prem/Pantarhei/sysinfo" target="_blank" rel="noopener noreferrer">Pantarhei documentation</a> for system details.
    </>
  );

  return (
    <InfrastructureAccessSection
      badge="On-Premises HPC"
      title="Accessing On-Premises Infrastructure"
      description={description}
      steps={steps}
      
    />
  );
};

export default OnPremises;