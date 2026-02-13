import styles from "../styles.module.css";
import Link from '@docusaurus/Link';
import SponsorList from "./SponsorList";
import MemberList from "./MemberList";
import PartnerList from "./PartnerList";
import ParentsPanel from "./ParentsPanel";

export default function OrgGallery() {
    return (
        <div className="tw-w-full tw-text-blue-800 dark:tw-text-white">
          <div className={`${styles.logoBackground} tw-rounded-xl tw-p-6`}>

            <div className="tw-container tw-mx-auto">

              {/* Consortium Sponsors */}
              <div className="tw-col tw-col--12 tw-mb-10">
                <div className={`${styles.heading} tw-text-black dark:tw-text-white`}>
                  Consortium Sponsors
                </div>

                <div className={`${styles.flexListContainer} tw-flex tw-flex-wrap tw-gap-4`}>
                  {SponsorList.map((sponsor) => (
                    <Link
                      to={sponsor.link}
                      key={sponsor.name}
                      className={`${styles.sponsorwrapper} tw-bg-slate-100 dark:tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-center tw-shadow-sm`}
                    >
                      <img
                        className={styles.sponsorcontainer}
                        src={sponsor.logo}
                        alt={sponsor.name}
                        width={sponsor.width}
                        height={sponsor.height}
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Consortium Members & Partners */}
              <div className="tw-row tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">

                {/* Members */}
                <div>
                  <div className={`${styles.heading} tw-text-blue-800 dark:tw-text-white`}>
                    Consortium Members
                  </div>

                  <div className={`${styles.flexListContainer} tw-flex tw-flex-wrap tw-gap-4`}>
                    {MemberList.map((member) => (
                      <Link
                        to={member.link}
                        key={member.name}
                        className={`${styles.imagewrapper} tw-bg-slate-100 dark:tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-center tw-shadow-sm`}
                      >
                        <img
                          className={styles.imagecontainer}
                          src={member.logo}
                          alt={member.name}
                          width={member.width}
                          height={member.height}
                        />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Partners */}
                <div>
                  <div className={`${styles.heading} tw-text-blue-800 dark:tw-text-white`}>
                    Consortium Partners
                  </div>

                  <div className={`${styles.flexListContainer} tw-flex tw-flex-wrap tw-gap-4`}>
                    {PartnerList.map((partner) => (
                      <Link
                        to={partner.link}
                        key={partner.name}
                        className={`${styles.imagewrapper} tw-bg-slate-100 dark:tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-center tw-shadow-sm`}
                      >
                        <img
                          className={styles.imagecontainer}
                          src={partner.logo}
                          alt={partner.name}
                          width={partner.width}
                          height={partner.height}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* NOAA + AWI + CIROH Logos */}
              <ParentsPanel />

            </div>
          </div>
        </div>
    )
}