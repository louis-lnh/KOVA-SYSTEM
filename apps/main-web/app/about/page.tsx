import { MainShell } from "../../components/main-shell";
import { getWebsiteSection } from "../../lib/website-content";

const fallbackPillars = [
  {
    title: "Competition",
    copy: "Strong rosters, serious improvement, and a culture that treats progress like a real standard.",
  },
  {
    title: "Identity",
    copy: "A recognizable org presence with premium presentation, clear values, and visual consistency.",
  },
  {
    title: "Growth",
    copy: "A structure that helps players, staff, and the brand itself keep moving forward with purpose.",
  },
];

const fallbackBuildTargets = [
  "Competitive team development",
  "Staff structure and internal systems",
  "Public website and media presence",
  "Long-term org recognition",
];

const fallbackAudience = [
  "Players who want structure, standards, and ambition.",
  "Staff who want responsibility and a real role in building something.",
  "People who care about quality, consistency, and growth over time.",
];

export default async function AboutPage() {
  const content = await getWebsiteSection("about");

  const eyebrow = content?.eyebrow || "ABOUT";
  const headline = content?.headline || "What KOVA Is";
  const intro =
    content?.intro ||
    "KOVA is a competitive esports organization focused on building sharp teams, a strong public identity, and a system that rewards consistency, ambition, and growth.";
  const pillars = (content?.pillars ? content.pillars.split("\n") : []).filter(Boolean);
  const vision =
    content?.vision ||
    "The goal is not just to exist. The goal is to matter.";

  const resolvedPillars =
    pillars.length > 0
      ? pillars.map((pillar) => ({
          title: pillar,
          copy: `${pillar} is part of the public structure KOVA is building right now.`,
        }))
      : fallbackPillars;

  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">{eyebrow}</span>
        <h1 className="page-hero__title">{headline}</h1>
        <p className="page-hero__copy">{intro}</p>
      </section>

      <section className="page-grid page-grid--about">
        {resolvedPillars.map((pillar) => (
          <article className="feature-panel feature-panel--centered" key={pillar.title}>
            <span className="panel-chip panel-chip--centered">{pillar.title}</span>
            <h3>{pillar.title}</h3>
            <p>{pillar.copy}</p>
          </article>
        ))}
      </section>

      <section className="page-stack page-stack--centered">
        <article className="feature-panel feature-panel--wide feature-panel--centered">
          <span className="panel-chip panel-chip--centered">VISION</span>
          <h3>{vision}</h3>
          <p>
            KOVA is not meant to be just another name floating around the
            space. The aim is to build something structured, recognizable, and
            worth taking seriously both inside competition and in public view.
          </p>
          <p>
            That means combining better team standards, stronger presentation,
            and internal systems that give the org real shape instead of just
            surface-level branding.
          </p>
        </article>

        <article className="feature-panel feature-panel--wide feature-panel--centered">
          <span className="panel-chip panel-chip--centered">WHAT KOVA IS BUILDING</span>
          <div className="about-list">
            {fallbackBuildTargets.map((item) => (
              <div className="about-list__item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="feature-panel feature-panel--wide feature-panel--centered">
          <span className="panel-chip panel-chip--centered">WHO KOVA IS FOR</span>
          <div className="about-list">
            {fallbackAudience.map((item) => (
              <div className="about-list__item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="feature-panel feature-panel--wide feature-panel--centered">
          <span className="panel-chip panel-chip--centered">NEXT STEP</span>
          <h3>Want to be part of what KOVA is building?</h3>
          <p>
            The apply platform is the clearest path into the org if you want to
            compete, support, or help shape what comes next.
          </p>
          <div className="main-hero__actions main-hero__actions--compact">
            <a className="button button--primary" href="/apply">
              Open Applications
            </a>
          </div>
        </article>
      </section>
    </MainShell>
  );
}
