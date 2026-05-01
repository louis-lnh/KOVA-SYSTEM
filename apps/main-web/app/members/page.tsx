import { MainShell } from "../../components/main-shell";
import { MembersLeaderboard } from "../../components/members-leaderboard";
import { getWebsiteSection } from "../../lib/website-content";

function splitLines(value?: string | null) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function MembersPage() {
  const content = await getWebsiteSection("members");

  const eyebrow = content?.eyebrow || "MEMBERS";
  const headline = content?.headline || "KOVA MEMBERS";
  const intro =
    content?.intro ||
    "A full leaderboard-style roster view built to become the deeper member page once real synced data is connected.";
  const futureSections = splitLines(content?.futureSections);

  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">{eyebrow}</span>
        <h1 className="page-hero__title">{headline}</h1>
        <p className="page-hero__copy">{intro}</p>
      </section>

      <MembersLeaderboard />

      {futureSections.length > 0 ? (
        <section className="page-stack page-stack--centered">
          <article className="feature-panel feature-panel--wide feature-panel--centered">
            <span className="panel-chip panel-chip--centered">FUTURE LAYERS</span>
            <div className="about-list">
              {futureSections.map((item) => (
                <div className="about-list__item" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </MainShell>
  );
}
