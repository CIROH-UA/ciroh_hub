import React from "react";
import "./teamMembers.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";

const team = [
  {
    name: "Arpita Patel",
    role: "Assistant Director of DevOps and IT",
    image: "/img/profiles/Arpita_Patel.png",
    linkedin: "https://www.linkedin.com/in/arpita0911patel/"
  },
  {
    name: "Benjamin Lee",
    role: "DevOps Engineer",
    image: "/img/profiles/Ben_Lee.png",
    linkedin: "https://www.linkedin.com/in/seungchanlee/"
  },
  {
    name: "Giovanni Romero",
    role: "HydroInfomatics Engineer",
    image: "/img/profiles/Giovanni_Romero.png",
    linkedin: "https://www.linkedin.com/in/elkin-giovanni-romero-bustamante-b834b5a8/"
  },
  {
    name: "Nathan Swain",
    role: "Project Engineer at Aquaveo",
    image: "/img/profiles/Nathan_Swain.jpeg",
    linkedin: "https://www.linkedin.com/in/nathanswain/"
  },
  {
    name: "Manjila Singh",
    role: "Graduate Research Assistant",
    image: "/img/profiles/Manjila_Singh.png",
    linkedin: "https://www.linkedin.com/in/manjilasingh/"
  },
  {
    name: "Prajwal Halalae",
    role: "Undergraduate Research Intern",
    image: "/img/profiles/Prajwal_Halalae.jpg",
    linkedin: "https://www.linkedin.com/in/prajwal-nh/"
  },
  {
    name: "Nia Minor",
    role: "Graduate Research Assistant",
    image: null,
    initial: "NM",
    github: "https://github.com/sheargrub"
  },
  {
    name: "James Dolinar",
    role: "Software Engineer at Aquaveo",
    image: null,
    initial: "JD",
  }, 
  {
    name: "Zimuzo Ernest-Eze",
    role: "Undergraduate Student Assistant",
    image: "/img/profiles/Zimuzo_Ernest.png",
    linkedin: "https://www.linkedin.com/in/zimuzoernesteze/"
  }, 
  
];

function SocialButton({href, imgLight, imgDark, alt}) {
  if (href != null) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="tw-inline-flex tw-items-center tw-justify-center tw-mt-3"
      >
        {/* Light mode: Blue icon */}
        <img
          src={imgLight}
          alt={alt}
          className="tw-w-8 tw-h-8 tw-block dark:tw-hidden"
        />

        {/* Dark mode: White icon */}
        <img
          src={imgDark}
          alt={alt}
          className="tw-w-8 tw-h-8 tw-hidden dark:tw-block"
        />
      </a>
    )
  }
  else return null;
}

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

              <SocialButton
                href={member.linkedin}
                imgLight={useBaseUrl("/img/socials/linkedin_blue.svg")}
                imgDark={useBaseUrl("/img/socials/linkedin_light.svg")}
                alt="LinkedIn"
              />

              <SocialButton
                href={member.github}
                imgLight={useBaseUrl("/img/socials/github_dark.svg")}
                imgDark={useBaseUrl("/img/socials/github_light.svg")}
                alt="GitHub"
              />
              
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
