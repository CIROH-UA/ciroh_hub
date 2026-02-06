import React from "react";
import "./teamMembers.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";

const team = [
  {
    name: "Arpita Patel",
    role: "Assistant Director of DevOps and IT",
    image: "/img/teamMember1.png",
    linkedin: "https://www.linkedin.com/in/example-arpita"
  },
  {
    name: "Benjamin Lee",
    role: "DevOps Engineer",
    image: "/img/teamMember2.png",
    linkedin: "https://www.linkedin.com/in/example-benjamin"
  },
  {
    name: "Manjila Singh",
    role: "Graduate Research Assistant",
    image: "/img/teamMember4.png",
    linkedin: "https://www.linkedin.com/in/example-manjila"
  },
  {
    name: "Prajwal Halalae",
    role: "Undergraduate Research Intern",
    image: "/img/PrajwalHalalae.jpg",
    linkedin: "https://www.linkedin.com/in/prajwal-nh/"
  },
  {
    name: "Nia Minor",
    role: "Graduate Research Assistant",
    image: null,
    initial: "NM",
    linkedin: "https://www.linkedin.com/in/example-nia"
  },
  {
    name: "Zimuzo Ernest-Eze",
    role: "Undergraduate Student Assistant",
    image: "/img/teamMember6.png",
    linkedin: "https://www.linkedin.com/in/example-zimuzo"
  }, 
  {
    name: "Giovanni Romero",
    role: "HydroInfomatics Engineer",
    image: "/img/Giovanni-Romero.png",
    linkedin: "https://www.linkedin.com/in/elkin-giovanni-romero-bustamante-b834b5a8/"
  },
];

export default function TeamMembers() {
  return (
    <section className="team-section">
      <h2 className="team-title">Meet CIROH Hub Team</h2>
      <div className="team-divider"></div>

      <div className="team-grid-list">
        {team.map((member, index) => (
          <div className="tw-bg-slate-100 tw-text-black dark:tw-bg-slate-900 dark:tw-text-blue-800 profile-card" key={index}>
            <div className="profile-img-wrapper">
              {member.image ? (
                <img
                  src={useBaseUrl(member.image)}
                  alt={member.name}
                  className="profile-img"
                />
              ) : (
                <div className="profile-placeholder">{member.initial}</div>
              )}
            </div>

            <div className="card-content">
              <h3 className="tw-text-blue-900 dark:tw-text-cyan-400 profile-name">
                {member.name}
              </h3>

              <p className="tw-text-blue-700 dark:tw-text-white profile-role">
                {member.role}
              </p>

              {/* LINKEDIN BUTTON */}
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="tw-inline-flex tw-items-center tw-justify-center tw-mt-3"
              >
                {/* Light mode: Blue icon */}
                <img
                  src="/img/socials/linkedin_blue.svg"
                  alt="LinkedIn"
                  className="tw-w-8 tw-h-8 tw-block dark:tw-hidden"
                />

                {/* Dark mode: White icon */}
                <img
                  src="/img/socials/linkedin_light.svg"
                  alt="LinkedIn"
                  className="tw-w-8 tw-h-8 tw-hidden dark:tw-block"
                />


              </a>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
