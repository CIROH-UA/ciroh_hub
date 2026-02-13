import "./TeamGallery.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function TeamGalleryGenerator({team, text}) {
  return (
    <section className="team-section">
      <h2 className="team-title tw-mt-8">{text}</h2>
      <div className="team-divider"></div>

      <div className="team-grid-list">
        {team.map((person) => (
          <div
            className="profile-card"
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
              <h3 className="profile-name">
                {person.name}
              </h3>

              <p className="profile-role">
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
