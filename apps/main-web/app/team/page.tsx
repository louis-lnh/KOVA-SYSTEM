import { MainShell } from "../../components/main-shell";
import { getWebsiteSection } from "../../lib/website-content";

const players: [
  {
    slot: string;
    name: string;
    note: string;
    ingameRole?: string;
    stats: { label: string; value: string }[];
    rankImage: string;
  },
  {
    slot: string;
    name: string;
    note: string;
    ingameRole?: string;
    stats: { label: string; value: string }[];
    rankImage: string;
  },
  {
    slot: string;
    name: string;
    note: string;
    ingameRole?: string;
    stats: { label: string; value: string }[];
    rankImage: string;
  },
  {
    slot: string;
    name: string;
    note: string;
    ingameRole?: string;
    stats: { label: string; value: string }[];
    rankImage: string;
  },
  {
    slot: string;
    name: string;
    note: string;
    ingameRole?: string;
    stats: { label: string; value: string }[];
    rankImage: string;
  },
] = [
  {
    slot: "Support",
    name: "Cipher",
    note: "Reliable utility timing and calm structure around slower setups.",
    stats: [
      { label: "Matches", value: "22" },
      { label: "K/D Ratio", value: "1.08" },
      { label: "Win Rate", value: "63%" },
      { label: "KAST", value: "74%" },
    ],
    rankImage: "/ranks/diamond-3.png",
  },
  {
    slot: "Flex",
    name: "Astra",
    note: "High-pressure adaptability with clean role balance and adjustments.",
    stats: [
      { label: "Matches", value: "25" },
      { label: "K/D Ratio", value: "1.13" },
      { label: "Win Rate", value: "60%" },
      { label: "KAST", value: "72%" },
    ],
    rankImage: "/ranks/immortal-2.png",
  },
  {
    slot: "Featured",
    name: "Vanguard",
    note: "The centerpiece profile card for the current lead player, mixing tracked performance with standout form notes.",
    ingameRole: "Duelist",
    stats: [
      { label: "Matches", value: "28" },
      { label: "K/D Ratio", value: "1.24" },
      { label: "Win Rate", value: "68%" },
      { label: "KAST", value: "77%" },
    ],
    rankImage: "/ranks/radiant.png",
  },
  {
    slot: "Duelist",
    name: "Nova",
    note: "Explosive space-taking with strong entry confidence and momentum.",
    stats: [
      { label: "Matches", value: "21" },
      { label: "K/D Ratio", value: "1.17" },
      { label: "Win Rate", value: "57%" },
      { label: "KAST", value: "70%" },
    ],
    rankImage: "/ranks/immortal-3.png",
  },
  {
    slot: "Controller",
    name: "Halo",
    note: "Anchor discipline, map control, and late-round patience.",
    stats: [
      { label: "Matches", value: "24" },
      { label: "K/D Ratio", value: "1.04" },
      { label: "Win Rate", value: "61%" },
      { label: "KAST", value: "76%" },
    ],
    rankImage: "/ranks/ascendant-3.png",
  },
];

const [leftOuter, leftInner, featuredPlayer, rightInner, rightOuter] = players;

const fallbackExtras: Array<{ title: string; copy: string }> = [
  {
    title: "Current Roster Focus",
    copy:
      "This section can later hold recent form, current role identities, and matchup-focused notes around the team.",
  },
  {
    title: "Stats And Highlights",
    copy:
      "Tracker data, Premier results, tournament notes, and standout series can live here once the dynamic layer is ready.",
  },
  {
    title: "Other Team Paths",
    copy:
      "Academy, Premier, or tournament-specific roster blocks can be added below the featured main lineup without crowding the first impression.",
  },
];

export default async function TeamPage() {
  const content = await getWebsiteSection("team");
  const eyebrow = content?.eyebrow || "TEAM";
  const headline = content?.headline || "Our Team";
  const intro =
    content?.intro ||
    "A centered first look at the main KOVA lineup, with the featured player in the middle and the rest of the roster arranged around that core identity.";
  const featuredRule =
    content?.featured || "Recent MVP based on weighted last-5-match form.";
  const sectionChip = content?.sectionChip || "NEXT LAYER";
  const [fallbackOne, fallbackTwo, fallbackThree] = fallbackExtras;

  const extras = [
    {
      title: content?.sectionOneTitle || fallbackOne!.title,
      copy: content?.sectionOneCopy || fallbackOne!.copy,
    },
    {
      title: content?.sectionTwoTitle || fallbackTwo!.title,
      copy: content?.sectionTwoCopy || fallbackTwo!.copy,
    },
    {
      title: content?.sectionThreeTitle || fallbackThree!.title,
      copy: content?.sectionThreeCopy || fallbackThree!.copy,
    },
  ];

  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">{eyebrow}</span>
        <h1 className="page-hero__title">{headline}</h1>
        <p className="page-hero__copy">{intro}</p>
        <p className="team-featured-rule">{featuredRule}</p>
      </section>

      <section className="team-stage">
        <PlayerCard player={leftOuter} variant="side" />
        <PlayerCard player={leftInner} variant="mid" />
        <PlayerCard player={featuredPlayer} variant="featured" />
        <PlayerCard player={rightInner} variant="mid" />
        <PlayerCard player={rightOuter} variant="side" />
      </section>
      <section className="page-stack page-stack--centered">
        {extras.map((item, index) => (
          <article
            className={`feature-panel feature-panel--wide ${
              index % 2 === 1 ? "feature-panel--offset" : ""
            }`}
            key={item.title}
          >
            <span className="panel-chip">{sectionChip}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </section>
    </MainShell>
  );
}

function PlayerCard({
  player,
  variant,
}: {
  player: (typeof players)[number];
  variant: "side" | "mid" | "featured";
}) {
  return (
    <article className={`team-stage__card team-stage__card--${variant}`}>
      <div className="player-card__rank-mark" aria-hidden="true">
        <img alt="" src={player.rankImage} />
      </div>

      <div className="player-card__identity">
        <div className="player-card__role">{player.slot}</div>
        <h2>{player.name}</h2>
        <p>{player.note}</p>
        {player.ingameRole ? (
          <div className="player-card__ingame-role">INGAME ROLE: {player.ingameRole}</div>
        ) : null}
      </div>

      {variant === "featured" ? (
        <div className="player-card__feature-mark" aria-hidden="true">
          MVP
        </div>
      ) : null}

      <div className="player-card__content">
        <div className={`player-card__stats-grid player-card__stats-grid--${variant}`}>
          {player.stats.map((stat) => (
            <div className="player-card__stat" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
