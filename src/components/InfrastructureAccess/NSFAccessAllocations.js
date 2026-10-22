import React from 'react';
import InfrastructureAccessSection from './InfrastructureAccessSection';

const NSFAccessAllocations = () => {
  const steps = [
    {
      title: "Register for ACCESS Allocation",
      description: "If you don't already have an ACCESS Allocation account, register for one using the link below.",
      optional: false,
      buttons: [
        {
          text: "ACCESS Allocation New User Registration",
          link: "https://operations.access-ci.org/identity/new-user"
        }
      ],
      details: "ACCESS Allocation is required for authentication and authorization across NSF-funded resources."
    },
    {
      title: "Submit Infrastructure Request",
      description: "The PI for your project must submit the Infrastructure Request Form below to request team-wide access to a particular resource on ACCESS Allocation.",
      buttons: [
        {
          text: "Infrastructure Request Form",
          link: "https://github.com/CIROH-UA/r2ohc_platform/issues/new?template=on_premise_request.yml&labels=infrastructure%2Cresource-request%2Caccess-allocation&title=%5BACCESS%20Allocation%20Request%5D%3A%20"
        }
      ],
      details: "This form ensures your project is properly registered and your team has the necessary permissions."
    }
  ];

  const description = (
    <>
      In collaboration with <a href="https://allocations.access-ci.org" target="_blank" rel="noopener noreferrer">NSF ACCESS Allocations</a>, CIROH offers access to all the resources that are available through an allocation on the <a href="https://allocations.access-ci.org/resources" target="_blank" rel="noopener noreferrer">Resources</a>. This guide will walk you through the steps necessary to gain access to any resources using your NSF ACCESS allocation. For more information, review the <a href="https://hub.ciroh.org/docs/services/external-resources/nsf-access/" target="_blank" rel="noopener noreferrer">NSF ACCESS documentation</a>.
    </>
  );

  return (
    <InfrastructureAccessSection
      badge="High-Performance Computing"
      title="NSF ACCESS Allocations through CIROH"
      description={description}
      steps={steps}
      successBox={{
        title: "You're All Set!",
        description: "Once you're granted access, you're ready to begin using the resources!",
        link: "https://allocations.access-ci.org/resources",
        linkText: "Visit Your ACCESS Resources Page"
      }}
    />
  );
};

export default NSFAccessAllocations;