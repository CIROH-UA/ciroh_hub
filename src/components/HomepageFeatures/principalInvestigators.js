import React from "react";
import "./teamMembers.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

const investigators = [
  {
    name: "Steven Burian",
    role: "Community Water Model Infrastructure, Stewardship, and Integration",
    image: "https://eng.ua.edu/wp-content/uploads/2021/12/2201001_BH_054_Steve_Burian.jpg",
    initial: "SB",
    link: "https://eng.ua.edu/eng-directory/dr-steven-burian/",
    orgName: "The University of Alabama",
    orgLogo: "/img/logos/uni/UAlogo.png",
  },
  {
    name: "Purushotham Bangalore",
    role: "Community Accessible Development: Nextgen Water Resources Modeling Framework in the CIROH Research to Operations Hybrid Cloud",
    image: "https://eng.ua.edu/wp-content/uploads/2021/09/2209032_BH_117_Purushotham_Bangalore-e1666793083411.jpg",
    initial: "PB",
    link: "https://eng.ua.edu/eng-directory/dr-purushotham-bangalore/",
    orgName: "The University of Alabama",
    orgLogo: "/img/logos/uni/UAlogo.png",
  },
  {
    name: "Arpita Patel",
    role: "Advancing Community NextGen and NextGen In A Box (NGIAB) - Paving the Pathway to Operations",
    image: "/img/teamMember1.png",
    initial: "AP",
    link: "https://awi.ua.edu/directory/arpita-patel/",
    orgName: "The University of Alabama",
    orgLogo: "/img/logos/uni/UAlogo.png",
  },
  {
    name: "Dan Ames",
    role: "Turning Research into Actionable Information for Operational Impact by Advancing NOAA's National Cyberinfrastructure, CIROH Portal, and Web and Mobile Apps",
    image: "https://ciroh.ua.edu/wp-content/uploads/2023/02/Dan-Ames-photo.jpg",
    initial: "DA",
    link: "https://cce.byu.edu/directory/dan-ames",
    orgName: "Brigham Young University",
    orgLogo: "https://th.bing.com/th/id/R.f1cb7dee44fd82870c0e58ba859a078e?rik=opVcBH5Lqtyl9w&riu=http%3a%2f%2flogonoid.com%2fimages%2fbyu-logo.png&ehk=9Ob%2bcxsV7xRkYYmzuKx0ac0w3A3TELDo4ETKBjdbhiI%3d&risl=&pid=ImgRaw&r=0",
  },
];

export default function PrincipalInvestigators() {
  return (
    <section className="team-section">
      <h2 className="team-title tw-mt-8">Principle Investigators</h2>
      <div className="team-divider"></div>

      <div className="team-grid-list">
        {investigators.map((person) => (
          <div
            className="tw-bg-slate-100 tw-text-black dark:tw-bg-slate-900 dark:tw-text-blue-800 profile-card"
            key={person.name}
          >
            <div className="profile-img-wrapper">
              {person.image ? (
                <img
                  src={useBaseUrl(person.image)}
                  alt={person.name}
                  className="profile-img"
                />
              ) : (
                <div className="profile-placeholder">{person.initial}</div>
              )}
            </div>

            <div className="card-content">
              <h3 className="tw-text-blue-900 dark:tw-text-cyan-400 profile-name">
                {person.name}
              </h3>

              <p className="tw-text-blue-700 dark:tw-text-white profile-role">
                {person.role}
              </p>

              <a
                href={person.link}
                target="_blank"
                rel="noopener noreferrer"
                className="tw-inline-flex tw-items-center tw-justify-center tw-mt-3"
                aria-label={person.orgName || person.role}
                title={person.orgName || person.role}
              >
                <img
                  src={useBaseUrl(person.orgLogo || "/img/logos/uni/UAlogo.png")}
                  alt={person.orgName || person.role}
                  className="tw-w-8 tw-h-8"
                  onError={(e) => {
                    // Avoid a broken-image icon if BYU logo asset isn't present yet.
                    e.currentTarget.src = useBaseUrl("/img/logos/uni/UAlogo.png");
                  }}
                />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
