import Link from "@docusaurus/Link";
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

function ProfileCard({ profile }) {
  const imageSrc = profile.imagePath?.startsWith('http')
    ? profile.imagePath
    : useBaseUrl(profile.imagePath || '/img/profiles/placeholder.jpg');

  return (
    <article className={styles.card}>
      <img
        className={styles.avatar}
        src={imageSrc}
        alt={profile.imageAlt || `${profile.name || 'Team member'} profile photo`}
        loading="lazy"
      />
      <div className={styles.content}>
        <h3 className={styles.name}>{profile.name || 'First Last'}</h3>
        {profile.title ? <p className={styles.title}>{profile.title}</p> : null}
        {profile.organization ? <p className={styles.organization}>{profile.organization}</p> : null}
        {profile.email ? (
          <Link className={styles.email} to={`mailto:${profile.email}`}>
            {profile.email}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default function ProfileCards({ profiles = [] }) {
  if (!profiles.length) {
    return null;
  }

  return (
    <section className={styles.grid} aria-label="Author profiles">
      {profiles.map((profile, index) => (
        <ProfileCard key={`${profile.name || 'profile'}-${index}`} profile={profile} />
      ))}
    </section>
  );
}
