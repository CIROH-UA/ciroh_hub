import Layout from '@theme/Layout';
import styles from './confluence26.module.css';
import clsx from 'clsx';

import WJKrajewski from '@site/static/img/calendar/subpages/confluence/wfkrajewski.jpg';
import JASmith from '@site/static/img/calendar/subpages/confluence/jasmith.jpg';
import AWILogoDark from '@site/static/img/logos/awi-white.png';
import AWILogoLight from '@site/static/img/logos/awi.png';

{/*
  Adapted from a standalone HTML file,
  which is why this page has its own styling and some raw SVGs.
*/}

export function submitApp() {
  var v=function(id){var e=document.getElementById(id);return (e&&e.value)||'—';};
  var d=document.querySelector('input[name="apply-date"]:checked');
  var subject=encodeURIComponent('Confluence — Operational Hydrology Advances Webinar Series · PI Engagement Session');
  var body=encodeURIComponent('Name: '+v('apply-name')+'\nAffiliation: '+v('apply-affiliation')+'\nPreferred session: '+((d&&d.value)||'—')+'\n\nProposed topic:\n'+v('apply-topic'));
  window.location.href='mailto:ciroh@ua.edu?bcc=spaul5%40ua.edu&subject='+subject+'&body='+body;
};

export default function Confluence26() {
  return (
    <Layout
      title="Confluence — CIROH Seminar Series"
      description="The CIROH seminar series — hydrologic research and forecast operations in one room, alternating monthly between CIROH science and partner operations. Formerly the R2O2R webinar series."
    >
      <ConfluenceContent />
    </Layout>
  );
}

function ConfluenceContent() {
  return (
    <main>
      <div className={styles.confluence_outer}>
        <div className={styles.hero_outer}>
          <svg viewBox="0 0 920 518" preserveAspectRatio="xMidYMid slice" className={styles.hero_decoration}>
            <path d="M-20,20 C260,40 480,180 700,324 S920,358 1000,358" fill="none" stroke="#8fd0e8" stroke-width="1.2" opacity="0.5"></path>
            <path d="M-20,38 C260,54 480,192 700,332 S920,365 1000,365" fill="none" stroke="#7fa8c9" stroke-width="1" opacity="0.38"></path>
            <path d="M-20,56 C260,68 480,204 700,340 S920,372 1000,372" fill="none" stroke="#3a75ad" stroke-width="1" opacity="0.5"></path>
            <path d="M-20,500 C260,480 500,432 710,388 S920,380 1000,380" fill="none" stroke="#8fd0e8" stroke-width="1.2" opacity="0.5"></path>
            <path d="M-20,485 C260,468 500,424 710,383 S920,374 1000,374" fill="none" stroke="#7fa8c9" stroke-width="1" opacity="0.38"></path>
            <path d="M-20,470 C260,456 500,416 710,378 S920,368 1000,368" fill="none" stroke="#3a75ad" stroke-width="1" opacity="0.5"></path>
          </svg>
          <div className={styles.hero_gradient}></div>
          <div className={clsx(styles.m_pad, styles.hero_inner)}>
            <div className={clsx(styles.m_hero, styles.hero_title)}><svg width="66" height="66" viewBox="0 0 120 120"><path d="M96,26 A46,46 0 1 0 96,94" fill="none" stroke="#8fd0e8" stroke-width="5" stroke-linecap="round"></path><path d="M24,42 C48,44 66,56 104,60" fill="none" stroke="#8fd0e8" stroke-width="3" stroke-linecap="round"></path><path d="M24,78 C48,76 66,64 104,60" fill="none" stroke="#3a75ad" stroke-width="3" stroke-linecap="round"></path></svg>Confluence</div>
            <div className={styles.hero_subtitle}>Operational Hydrology Advances Webinar Series</div>
            <p className={styles.hero_description}>The CIROH seminar series — hydrologic research and forecast operations in one room, alternating monthly between CIROH science and partner operations. Formerly the R2O2R webinar series.</p>
            <div className={styles.hero_hotlinks}>
              <a href="#schedule">Season schedule</a>
              ·
              <a href="#about">About</a>
            </div>
            <div className={styles.hero_row}>
              <a href="https://ua-edu.zoom.us/meeting/register/ajhLtchTQfSxIxqpIizpsg" className={clsx(styles.hero_button, styles.button_l)}>Register for the series</a>
              <span className={styles.hero_date}>Fourth Thursday · 2:00 PM Central · Zoom</span>
            </div>
          </div>
        </div>

        <div className={clsx(styles.m_pad, styles.session_outer)}>
          <div className={clsx(styles.section_subtitle, styles.margin_bl)}>Next session</div>
          <div className={clsx(styles.m_card, styles.m_stack, styles.session_card)}>
            <div style={{ flex: 1 }}>
              <div className={styles.session_date_outer}>
                <span className={styles.session_date_main}>Thursday, August 27, 2026 <span className={styles.session_date_sub}>· 2:00–3:00 PM Central</span></span>
              </div>
              <div className={styles.session_title}>How Can We Improve the NEXRAD Network to Benefit Flood Prediction?</div>
              <p className={styles.section_description}>Where should the nation deploy its next radars, and why does radar rainfall estimation fail in the storms that kill? Krajewski and Smith present hydrologically centric analyses of the WSR-88D network that identify the highest-priority regions for new radar deployment and characterize the uncertainty in radar rainfall estimates from a drainage-network perspective.</p>
              <p className={styles.section_description}>Drawing on catastrophic flash floods in the Texas Hill Country, the Appalachians, and the Intermountain West, they show how vertical motion in storm downdrafts leads radar to underestimate exactly the rainfall that matters most, and they recommend developing dedicated radar QPE techniques for storms that produce catastrophic flash floods.</p>
            </div>
            <div class="m-side" className={clsx(styles.m_side, styles.session_bios_outer)}>
              <a href="https://engineering.uiowa.edu/directory/witold-f-krajewski" target="_blank" rel="noopener" className={styles.session_bios_inner}>
                <img className={styles.session_bios_img} alt="Witold Krajewski" src={WJKrajewski}></img>
                <div>
                  <div className={styles.session_bios_name}>Witold (Witek) F. Krajewski</div>
                  <div className={styles.session_bios_title}>Professor Emeritus, University of Iowa</div>
                </div>
              </a>
              <a href="https://cee.princeton.edu/people/james-smith" target="_blank" rel="noopener" className={styles.session_bios_inner}>
                <img className={styles.session_bios_img} alt="Jim Smith" src={JASmith}></img>
                <div>
                  <div className={styles.session_bios_name}>James (Jim) A. Smith</div>
                  <div className={styles.session_bios_title}>Professor Emeritus, Princeton University</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div id="schedule" className={clsx(styles.m_pad, styles.schedule_outer)}>
          <div className={styles.section_subtitle}>Season schedule · 2026–27</div>
          <div className={clsx(styles.section_title, styles.margin_bl)}>Two currents, one series</div>
            <div className={clsx(styles.m_row, styles.schedule_entry)}>
              <span className={styles.schedule_entry_date}>Aug 27</span>
              <span className={styles.schedule_entry_title}>How Can We Improve the NEXRAD Network to Benefit Flood Prediction?</span>
              <span className={styles.schedule_entry_speaker}>Witek Krajewski &amp; Jim Smith</span>
            </div>
            <div className={clsx(styles.m_row, styles.schedule_entry)}>
              <span className={styles.schedule_entry_date}>Sep 24</span>
              <span className={styles.schedule_entry_title}>Operational Partner Session — Topic to Be Announced</span>
              <span className={styles.schedule_entry_speaker}>Speaker to be announced</span>
            </div>
            <div className={clsx(styles.m_row, styles.schedule_entry)}>
              <span className={styles.schedule_entry_date}>Oct 22</span>
              <span className={styles.schedule_entry_title}>CIROH PI Engagement Session</span>
              <a href="#apply" className={styles.schedule_entry_speaker_link}>Nominate to present ↓</a>
            </div>
            <div className={clsx(styles.m_row, styles.schedule_entry)}>
              <span className={styles.schedule_entry_date}>Nov 19</span>
              <span className={styles.schedule_entry_title}>Operational Partner Session — Topic to Be Announced</span>
              <span className={styles.schedule_entry_speaker}>Speaker to be announced</span>
            </div>
            <div className={clsx(styles.m_row, styles.schedule_entry)}>
              <span className={styles.schedule_entry_date}>Jan 28</span>
              <span className={styles.schedule_entry_title}>FIRO — the CIROH–CW3E research and operations partnership</span>
              <span className={styles.schedule_entry_speaker}>F. Martin Ralph</span>
            </div>
            <div className={clsx(styles.m_row, styles.schedule_entry)}>
              <span className={styles.schedule_entry_date}>Feb 25</span>
              <span className={styles.schedule_entry_title}>Operational Partner Session — Topic to Be Announced</span>
              <span className={styles.schedule_entry_speaker}>Speaker to be announced</span>
            </div>
            <div className={clsx(styles.m_row, styles.schedule_entry)}>
              <span className={styles.schedule_entry_date}>Mar 25</span>
              <span className={styles.schedule_entry_title}>CIROH PI Engagement Session</span>
              <a href="#apply" className={styles.schedule_entry_speaker_link}>Nominate to present ↓</a>
            </div>
            <div className={clsx(styles.m_row, styles.schedule_entry)}>
              <span className={styles.schedule_entry_date}>Apr 22</span>
              <span className={styles.schedule_entry_title}>Operational Partner Session — Topic to Be Announced</span>
              <span className={styles.schedule_entry_speaker}>Speaker to be announced</span>
            </div>
          <div className={styles.schedule_disclaimer}>No December session — AGU Fall Meeting and holidays.&nbsp;</div>

          <div id="apply" className={styles.m_card, styles.m_stack, styles.application_outer}>
            <div style={{ flex: 1 }}>
              <div className={styles.section_subtitle}>CIROH PI Engagement Sessions</div>
              <div className={styles.section_title}>Nominate a presenter</div>
              <p className={styles.section_description}>The Oct 22 and Mar 25 sessions are open to CIROH principal investigators. Nominate yourself or a CIROH colleague you think should present — tell us about the project and what it would bring to the operational community, and we'll follow up.</p>
            </div>
            <div className={styles.m_full, styles.application_form_outer}>
              <input id="apply-name" placeholder="Name" className={styles.application_field_text} />
              <input id="apply-affiliation" placeholder="Affiliation" className={styles.application_field_text} />
              <div className={styles.application_column}>
                <span className={styles.application_subheader}>PREFERRED SESSION</span>
                <div className={styles.application_row}>
                  <label className={styles.application_field_choice}><input type="radio" name="apply-date" value="Oct 22, 2026" />Oct 22, 2026</label>
                  <label className={styles.application_field_choice}><input type="radio" name="apply-date" value="Mar 25, 2027" />Mar 25, 2027</label>
                  <label className={styles.application_field_choice}><input type="radio" name="apply-date" value="Either" />Either</label>
                </div>
              </div>
              <textarea id="apply-topic" placeholder="Proposed topic" rows="3" className={styles.application_field_text} style={{ resize: "vertical" }}></textarea>
              <a href="mailto:ciroh@ua.edu?bcc=spaul5%40ua.edu&subject=Confluence%20%E2%80%94%20Operational%20Hydrology%20Advances%20Webinar%20Series%20%C2%B7%20PI%20Engagement%20Session" onclick={submitApp} className={styles.button_l}>Submit nomination</a>
              <div className={styles.application_disclaimer}>Opens your email client with the nomination addressed to ciroh@ua.edu.</div>
            </div>
          </div>
        </div>

        <div id="about" className={clsx(styles.m_pad, styles.m_stack, styles.about_outer)}>
          <div style={{ flex: 1 }}>
            <div className={styles.section_subtitle}>About the series</div>
            <div className={styles.section_title}>Research → Operations → Research</div>
            <p className={styles.section_description}>Confluence brings CIROH's research community and NOAA's operational water enterprise into the same hour. Sessions alternate between CIROH-funded science headed for operations, and operational perspectives from NOAA and partner agencies — so research is shaped by the people who will run it.</p>
          </div>
          <div className={clsx(styles.m_side, styles.m_full, styles.about_specs_outer)}>
            <div className={styles.about_specs_entry}><b>Cadence</b><br />Fourth Thursday of the month, 2:00–3:00 PM Central</div>
            <div className={styles.about_specs_entry}><b>Format</b><br />45-minute talk + 15-minute Q&amp;A, on Zoom, recorded</div>
            <div className={styles.about_specs_entry}><b>Audience</b><br />CIROH researchers, operational partners, and broader research communities</div>
          </div>
        </div>

        <div id="register" className={clsx(styles.m_pad, styles.register_outer)}>
          <div className={clsx(styles.m_card, styles.m_stack, styles.register_inner)}>
            <div style={{ flex: 1 }}>
              <div className={styles.section_title}>Join us for the upcoming session</div>
              <p className={(styles.section_description, styles.margin_bs)}>One registration covers the whole season — register once and the Zoom link arrives by email.</p>
            </div>
            <div className={clsx(styles.m_full, styles.register_submit_outer)}>
              <a href="https://ua-edu.zoom.us/meeting/register/ajhLtchTQfSxIxqpIizpsg" className={styles.button_l}>Register for the series</a>
            </div>
          </div>
        </div>

        <div className={styles.pseudo_footer_outer}>
          <div className={styles.m_pad, styles.pseudo_footer_row}>
            <img className={styles.pseudo_footer_logo} alt="The University of Alabama — Alabama Water Institute" src={AWILogoDark}></img>
            <a href="https://ciroh.ua.edu/" className={styles.pseudo_footer_link}>ciroh.ua.edu</a>
          </div>
        </div>
      </div>
    </main>
  )
}