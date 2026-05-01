"use client";

import { useMemo, useState } from "react";

type RankTier =
  | "radiant"
  | "immortal-3"
  | "immortal-2"
  | "ascendant-3"
  | "diamond-3";

type Movement = "up" | "down" | "steady";
type TeamName = "Main Team" | "Academy";
type SortDirection = "desc" | "asc";

type Member = {
  overallRank: number;
  riotName: string;
  riotTag: string;
  team: TeamName;
  currentRank: RankTier;
  kd: number;
  win: number;
  matches: number;
  hs: number;
  acs: number;
  peakRank: RankTier;
  movement: Movement;
};

type SortKey =
  | "overallRank"
  | "team"
  | "currentRank"
  | "kd"
  | "win"
  | "matches"
  | "hs"
  | "acs"
  | "peakRank";

const members: Member[] = [
  {
    overallRank: 1,
    riotName: "Vanguard",
    riotTag: "#KOVA",
    team: "Main Team",
    currentRank: "radiant",
    kd: 1.24,
    win: 68,
    matches: 28,
    hs: 31,
    acs: 268,
    peakRank: "radiant",
    movement: "steady",
  },
  {
    overallRank: 2,
    riotName: "Astra",
    riotTag: "#KOVA",
    team: "Main Team",
    currentRank: "immortal-2",
    kd: 1.13,
    win: 60,
    matches: 25,
    hs: 27,
    acs: 231,
    peakRank: "immortal-3",
    movement: "up",
  },
  {
    overallRank: 3,
    riotName: "Nova",
    riotTag: "#KOVA",
    team: "Main Team",
    currentRank: "immortal-3",
    kd: 1.17,
    win: 57,
    matches: 21,
    hs: 29,
    acs: 244,
    peakRank: "immortal-3",
    movement: "down",
  },
  {
    overallRank: 4,
    riotName: "Cipher",
    riotTag: "#KOVA",
    team: "Academy",
    currentRank: "diamond-3",
    kd: 1.08,
    win: 63,
    matches: 22,
    hs: 24,
    acs: 218,
    peakRank: "ascendant-3",
    movement: "up",
  },
  {
    overallRank: 5,
    riotName: "Halo",
    riotTag: "#KOVA",
    team: "Academy",
    currentRank: "ascendant-3",
    kd: 1.04,
    win: 61,
    matches: 24,
    hs: 22,
    acs: 201,
    peakRank: "ascendant-3",
    movement: "steady",
  },
];

const rankOrder: Record<RankTier, number> = {
  radiant: 5,
  "immortal-3": 4,
  "immortal-2": 3,
  "ascendant-3": 2,
  "diamond-3": 1,
};

const rankIcon: Record<RankTier, string> = {
  radiant: "/ranks/radiant.png",
  "immortal-3": "/ranks/immortal-3.png",
  "immortal-2": "/ranks/immortal-2.png",
  "ascendant-3": "/ranks/ascendant-3.png",
  "diamond-3": "/ranks/diamond-3.png",
};

const sortableColumns: {
  key: SortKey;
  label: string;
  className?: string;
}[] = [
  { key: "overallRank", label: "#" },
  { key: "team", label: "Team" },
  { key: "currentRank", label: "Current" },
  { key: "kd", label: "KD" },
  { key: "win", label: "Win" },
  { key: "matches", label: "Matches" },
  { key: "hs", label: "HS%" },
  { key: "acs", label: "ACS" },
  { key: "peakRank", label: "Peak" },
];

function compareTeam(a: Member, b: Member, direction: SortDirection) {
  const teamOrder = direction === "desc" ? ["Main Team", "Academy"] : ["Academy", "Main Team"];
  const teamDelta = teamOrder.indexOf(a.team) - teamOrder.indexOf(b.team);

  if (teamDelta !== 0) {
    return teamDelta;
  }

  return a.overallRank - b.overallRank;
}

export function MembersLeaderboard() {
  const [sortKey, setSortKey] = useState<SortKey>("overallRank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sorted = useMemo(() => {
    const copy = [...members];

    copy.sort((a, b) => {
      switch (sortKey) {
        case "overallRank":
          return a.overallRank - b.overallRank;
        case "team":
          return compareTeam(a, b, sortDirection);
        case "currentRank": {
          const delta = rankOrder[b.currentRank] - rankOrder[a.currentRank];
          return sortDirection === "desc" ? delta : -delta;
        }
        case "peakRank": {
          const delta = rankOrder[b.peakRank] - rankOrder[a.peakRank];
          return sortDirection === "desc" ? delta : -delta;
        }
        case "kd":
        case "win":
        case "matches":
        case "hs":
        case "acs": {
          const delta = b[sortKey] - a[sortKey];
          return sortDirection === "desc" ? delta : -delta;
        }
      }
    });

    return copy;
  }, [sortDirection, sortKey]);

  function handleSort(nextKey: SortKey) {
    if (nextKey === "overallRank") {
      setSortKey("overallRank");
      setSortDirection("desc");
      return;
    }

    if (sortKey === nextKey) {
      if (sortDirection === "desc") {
        setSortDirection("asc");
        return;
      }

      setSortKey("overallRank");
      setSortDirection("desc");
      return;
    }

    setSortKey(nextKey);
    setSortDirection("desc");
  }

  function renderIndicator(columnKey: SortKey) {
    if (columnKey === "overallRank" || sortKey !== columnKey) {
      return null;
    }

    return (
      <span
        className={`sort-indicator sort-indicator--${sortDirection}`}
        aria-hidden="true"
      >
        {"<"}
      </span>
    );
  }

  return (
    <section className="member-board-shell">
      <div className="member-board">
        <div className="member-board__header">
          {sortableColumns[0] ? (
            <button
              type="button"
              className="member-board__col member-board__col--button member-board__col--rank-button"
              onClick={() => handleSort("overallRank")}
            >
              #
            </button>
          ) : null}

          <div className="member-board__col member-board__col--name">Riot ID</div>

          {sortableColumns.slice(1).map((column) => (
            <button
              type="button"
              key={column.key}
              className={`member-board__col member-board__col--button${
                sortKey === column.key ? " member-board__col--active" : ""
              }`}
              onClick={() => handleSort(column.key)}
            >
              <span>{column.label}</span>
              {renderIndicator(column.key)}
            </button>
          ))}

          <div className="member-board__col member-board__col--move">Move</div>
        </div>

        <div className="member-board__body">
          {sorted.map((member, index) => (
            <article className="member-row" key={`${member.riotName}${member.riotTag}`}>
              <div className="member-row__cell member-row__cell--rank">#{member.overallRank}</div>

              <div className="member-row__cell member-row__cell--name">
                <div className="member-row__riot">
                  <strong>{member.riotName}</strong>
                  <span>{member.riotTag}</span>
                </div>
              </div>

              <div className="member-row__cell">{member.team}</div>

              <div className="member-row__cell member-row__cell--icon">
                <img alt="" src={rankIcon[member.currentRank]} />
              </div>

              <div className="member-row__cell">{member.kd.toFixed(2)}</div>
              <div className="member-row__cell">{member.win}%</div>
              <div className="member-row__cell">{member.matches}</div>
              <div className="member-row__cell">{member.hs}%</div>
              <div className="member-row__cell">{member.acs}</div>

              <div className="member-row__cell member-row__cell--icon">
                <img alt="" src={rankIcon[member.peakRank]} />
              </div>

              <div className="member-row__cell member-row__cell--move">
                <span
                  className={`movement movement--${member.movement}`}
                  aria-label={member.movement}
                >
                  {member.movement === "steady" ? "—" : "<"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
