# Archived Main-Web Achievements Page V2

This file keeps the removed `Achievements` page concept so it can be restored or reused later without rebuilding it from scratch.

## Archived Page Component

```tsx
import { MainShell } from "../../components/main-shell";

const spotlight = {
  label: "Spotlight",
  title: "KOVA progress should feel visible, not hidden in the background.",
  copy:
    "This page should work less like an event board and more like a recognition wall: standout results, meaningful milestones, player recognition, and the moments that make KOVA feel like it is moving forward.",
};

const achievementLanes = [
  {
    label: "Competitive Results",
    stat: "12",
    title: "Tracked result moments",
    copy:
      "League finishes, tournament runs, weekly records, and the competitive checkpoints that deserve permanent visibility.",
  },
  {
    label: "Player Recognition",
    stat: "05",
    title: "Recognition layers",
    copy:
      "MVPs, season leaders, most improved players, and short-term standout form that can keep the roster motivated.",
  },
  {
    label: "Org Milestones",
    stat: "03",
    title: "Org growth markers",
    copy:
      "Public launches, structural upgrades, and key internal milestones that show KOVA is becoming more real over time.",
  },
];

const timelineMoments = [
  {
    period: "This Week",
    title: "Premier week sweep placeholder",
    copy:
      "A good home for the strongest current result or the most notable recent improvement spike.",
  },
  {
    period: "This Month",
    title: "Main roster highlight run",
    copy:
      "A monthly layer for broader standout phases, not just one isolated result or one-off good day.",
  },
  {
    period: "This Season",
    title: "Season progress anchor",
    copy:
      "A place to show whether KOVA is climbing, stabilizing, or building toward bigger competitive targets.",
  },
];

const recognitionIdeas = [
  {
    title: "MVP",
    copy:
      "A recent-form badge that changes often enough to stay competitive and meaningful for active players.",
  },
  {
    title: "Season Leader",
    copy:
      "A higher-prestige recognition for the most consistent performer over the broader season window.",
  },
  {
    title: "Monthly Standout",
    copy:
      "A useful bridge into Discord announcements, social posts, and recurring community recognition content.",
  },
];

const archivePreview = [
  "Weekly match records",
  "Tournament placements",
  "Season-leader history",
  "Org milestone archive",
];

export default function AchievementsPage() {
  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">ACHIEVEMENTS</span>
        <h1 className="page-hero__title">KOVA ACHIEVEMENTS</h1>
        <p className="page-hero__copy">
          Achievements should showcase the things that make KOVA feel real:
          results, momentum, player peaks, and the milestones that signal growth.
        </p>
      </section>

      <section className="page-stack page-stack--centered">
        <article className="feature-panel feature-panel--wide feature-panel--centered">
          <span className="panel-chip panel-chip--centered">{spotlight.label}</span>
          <h3>{spotlight.title}</h3>
          <p>{spotlight.copy}</p>
        </article>
      </section>

      <section className="achievement-lane-grid">
        {achievementLanes.map((item) => (
          <article className="feature-panel achievement-lane" key={item.label}>
            <span className="panel-chip panel-chip--centered">{item.label}</span>
            <strong className="achievement-lane__stat">{item.stat}</strong>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </section>

      <section className="achievement-timeline">
        {timelineMoments.map((item) => (
          <article className="feature-panel achievement-timeline__card" key={item.period}>
            <span className="panel-chip panel-chip--centered">{item.period}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </section>

      <section className="page-stack page-stack--centered">
        <article className="feature-panel achievement-recognition">
          <span className="panel-chip panel-chip--centered">Recognition Layers</span>
          <div className="achievement-recognition__grid">
            {recognitionIdeas.map((item) => (
              <div className="about-list__item achievement-recognition__item" key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.copy}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="page-stack page-stack--centered">
        <article className="feature-panel achievement-archive">
          <span className="panel-chip panel-chip--centered">Archive Preview</span>
          <h3>A clean record of progress is part of the product.</h3>
          <p>
            The achievement page can later become the place where KOVA stores
            what matters over time instead of letting every good week disappear.
          </p>
          <div className="detail-pill-grid detail-pill-grid--four">
            {archivePreview.map((item) => (
              <div className="detail-pill" key={item}>
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </MainShell>
  );
}
```

## Archived CSS

```css
.detail-pill-grid--four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.achievement-lane-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.4rem;
}

.achievement-lane {
  text-align: center;
}

.achievement-lane__stat {
  display: block;
  margin: 0 0 0.9rem;
  font-size: clamp(2.2rem, 4vw, 3rem);
  line-height: 1;
  color: #f1d69a;
  letter-spacing: -0.04em;
}

.achievement-timeline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.4rem;
}

.achievement-timeline__card {
  text-align: center;
}

.achievement-recognition {
  width: min(100%, 60rem);
  justify-self: center;
  text-align: center;
}

.achievement-recognition__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  width: 100%;
}

.achievement-recognition__item {
  display: grid;
  gap: 0.5rem;
  text-align: center;
}

.achievement-recognition__item strong {
  color: var(--text);
  font-size: 1rem;
}

.achievement-recognition__item span {
  color: var(--muted);
  line-height: 1.6;
}

.achievement-archive {
  width: min(100%, 62rem);
  justify-self: center;
  text-align: center;
}
```

## Notes

- The page was removed from live navigation because it did not yet feel essential for `main-web` v1.
- If it returns later, the best fit is probably after stronger event data, player recognition systems, and org milestone history exist.
