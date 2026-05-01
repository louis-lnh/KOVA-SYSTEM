# KOVA VALORANT Data Blueprint

## Purpose

This document captures the current plan for bringing VALORANT player and team data into KOVA with as little daily manual work as possible.

It focuses on:

- player onboarding and opt-in
- Riot API feasibility
- Tracker.gg limitations
- what data we can store directly
- what stats we can derive ourselves
- custom match and tournament risks
- a realistic implementation roadmap for this repo

## Executive Summary

- Tracker.gg is not a safe foundation for VALORANT data integration.
- Riot's official VALORANT APIs are the correct long-term path.
- Player-specific VALORANT stats require player opt-in through Riot Sign On (RSO).
- The best KOVA workflow is:
  - collect Riot-linked player accounts
  - store stable Riot identifiers
  - sync match history automatically
  - compute KOVA-owned stats from synced data
  - render player cards and "Top 5" cards from KOVA's own database
- Ranked and normal match support is the safer part of the build.
- Custom tournament support is possible only if those matches appear reliably in Riot match history for opted-in players.

## Key Constraints

### Tracker.gg

- Tracker Network's public developer APIs do not currently include VALORANT.
- Internal Tracker endpoints and scraping should not be used as a production strategy.
- Tracker URLs can still be collected as reference links for roster pages or application review.

### Riot Games Policy

- VALORANT player stats require explicit player opt-in.
- Riot expects player identity and data access to flow through RSO.
- Riot does not document a dedicated VALORANT tournament/custom-lobby API comparable to the League of Legends tournament callback system.
- We should not design around any undocumented Riot behavior.

## Recommended KOVA Workflow

### Join Flow

Each player should provide:

- Riot account connection via RSO
- Riot ID
- region / shard
- optional Tracker URL for reference only

After onboarding:

- resolve and store the player's stable `puuid`
- store consent / linked-account status
- schedule automatic match sync jobs
- attach computed stats to that player profile

### Public Website Flow

The website should never fetch Riot directly from the browser.

Instead:

1. backend syncs Riot data on a schedule
2. backend stores normalized data in KOVA database
3. main website reads only from KOVA-owned API/database
4. homepage, roster pages, and featured cards use cached internal data

This gives:

- better performance
- API key safety
- stable rendering
- custom ranking logic
- easier debugging

## Riot API Surface Relevant To KOVA

Current official VALORANT API areas discussed:

- account identity through RSO
- `val-match-v1`
  - get match by ID
  - get matchlist by `puuid`
  - get recent matches by queue
- `val-ranked-v1`
  - leaderboard by act
- `val-content-v1`
  - agents, maps, acts, localized metadata
- `val-status-v1`
  - platform/service status

## What Data We Can Safely Build Around

### Core Identity

- player name / display label
- Riot ID
- region / shard
- `puuid`
- linked-at / consent state
- optional Tracker URL

### Match History Layer

For each synced player:

- list of recent match IDs
- full match payloads for stored matches
- queue type
- match timestamp
- map
- agent
- win / loss
- scoreline
- player-level combat and round stats when present

### Static Metadata

- map names
- agent names
- act / episode labels
- queue labels
- icons / artwork references where available

## Most Useful Stats For KOVA

These are the highest-value stats to prioritize for player cards and featured sections.

### Player Overview

- matches played
- wins
- losses
- win rate
- current streak
- best streak
- last active date

### Combat Performance

- kills
- deaths
- assists
- KDA
- K/D
- average kills per match
- average deaths per match
- average assists per match
- headshot percentage if present in match data
- average combat score if present
- damage dealt per match if present

### Agent and Map Performance

- most played agent
- top 3 agents
- win rate by agent
- KDA by agent
- most played map
- best map
- worst map
- win rate by map

### Time-Based Form

- last 5 matches
- last 10 matches
- last 20 matches
- last 30 days
- current act form

### Website-Friendly Featured Metrics

- featured player score
- hot streak badge
- best recent performer
- most active player
- most consistent player

## Advanced Stats We May Be Able To Derive

These are good goals, but should only be promised after testing real Riot match payloads.

- clutch count and clutch rate
- first blood rate
- first death rate
- multikill count
- ace count
- plant count
- defuse count
- side split performance
  - attack-side win rate
  - defense-side win rate
- overtime record
- pistol round performance
- economy-related metrics if spend/loadout data is available
- entry success rate
- trade kill rate

## Stats We Should Not Promise Early

- exact Tracker-style lifetime profile replication
- exact Riot rank / RR / MMR visibility for every player at all times
- fully accurate all-time historical stats before KOVA starts collecting data
- opponent scouting style views
- automatic custom tournament analytics without first validating the underlying data

## Custom Matches And Tournaments

### What We Know

- Riot exposes general VALORANT match history endpoints.
- Riot does not document a separate VALORANT tournament/custom-lobby callback system like League of Legends.
- Because of that, custom match support depends heavily on whether those matches appear in the normal match history of opted-in players.

### Practical Risk

Custom tournament automation is a proof-of-concept risk area.

Possible outcomes:

- best case:
  - custom matches appear normally
  - we can ingest them and compute tournament stats
- middle case:
  - custom matches appear inconsistently or with limited detail
  - we can support partial automation with some admin tagging
- worst case:
  - custom matches are not reliably accessible
  - we need manual event records or lightweight admin entry for tournament summaries

### Recommended Validation Step

Before promising custom tournament automation:

1. link 2-4 internal test players through RSO
2. run one real custom match
3. sync each linked player's history
4. verify whether the custom match appears
5. inspect the returned fields
6. decide whether tournament-grade automation is viable

## Suggested KOVA Data Model

This repo already has a backend app and Prisma package, so the clean approach is to extend the existing system rather than bolt data into the frontend.

Recommended new entities:

- `ValorantAccount`
  - userId
  - puuid
  - riotGameName
  - riotTagLine
  - region
  - trackerUrl
  - rsoLinkedAt
  - syncEnabled
  - lastSyncedAt
- `ValorantMatch`
  - riotMatchId
  - queue
  - map
  - season / act
  - startedAt
  - rawPayload
- `ValorantPlayerMatchStat`
  - matchId
  - userId or valorantAccountId
  - agent
  - team
  - win
  - kills
  - deaths
  - assists
  - headshots if available
  - bodyshots if available
  - legshots if available
  - score / combat score if available
  - plants / defuses if available
- `ValorantPlayerAggregate`
  - accountId
  - scope such as `last10`, `last20`, `act`, `all_collected`
  - winRate
  - kd
  - kda
  - avgKills
  - headshotPct
  - featuredScore
  - lastComputedAt
- optional `ValorantEventTag`
  - matchId
  - eventType such as `scrim`, `tournament`, `custom`
  - eventSlug

## Suggested API / Service Architecture

### Backend Responsibilities

- RSO link flow
- Riot identity lookup
- scheduled sync jobs
- match normalization
- aggregate stat computation
- public read endpoints for website consumption
- admin endpoints for manual resync or account repair

### Main Website Responsibilities

- render roster cards
- render featured player cards
- render top 5 player section
- render event and team snapshots
- consume KOVA backend data only

### Sync Strategy

- on account link:
  - initial profile sync
  - initial recent-match sync
- scheduled sync:
  - every 30-60 minutes for active players
- compute aggregates after every successful sync
- cache website-facing outputs aggressively

## Top 5 Player Cards

KOVA should use its own ranking formula instead of trying to clone Tracker.

Example inputs:

- win rate
- K/D
- KDA
- average kills
- headshot percentage
- recent form
- minimum match threshold

Example score idea:

`featuredScore = 35% winRate + 25% kd + 15% kda + 10% avgKills + 10% hsPct + 5% recentForm`

This formula should be tuned after real data is collected.

## Phased Delivery Plan

### Phase 1: Foundation

- Riot application planning
- RSO design
- database schema additions
- backend Riot service scaffolding
- internal API contracts

### Phase 2: MVP Automation

- account linking
- player sync jobs
- match storage
- aggregate stat computation
- roster cards on main web
- top 5 featured cards

### Phase 3: Quality and Admin Tooling

- force resync tools
- bad account relink flow
- sync health monitoring
- stale profile warnings
- profile visibility controls if needed

### Phase 4: Custom Match Validation

- run internal POC on real custom matches
- inspect whether custom matches are returned reliably
- tag and separate custom/tournament matches from ranked
- decide whether tournament stats can be automated fully or need fallback workflows

## Rough Effort Estimate

These are intentionally rough and assume reuse of the existing backend and Prisma setup.

### Basic Foundation

- around 3-5 working days

Includes:

- schema work
- Riot service wiring
- sync architecture
- basic internal endpoints

### Usable V1

- around 5-10 working days

Includes:

- account linking
- match sync
- aggregate stats
- player cards
- top 5 section
- admin repair/resync basics

### Tournament / Custom Support

- add roughly 3-7 or more working days

This depends heavily on real custom match visibility and data quality.

### Overall

- around 1-2 weeks for a strong automated V1
- around 2-3 weeks for a more polished and robust version with custom-match exploration

## Recommended Scope For A Safe V1

Build now:

- Riot-linked member accounts
- automated recent-match sync
- roster player cards
- top 5 featured player cards
- KOVA-owned aggregate stats

Postpone until validated:

- full tournament analytics
- deep custom lobby automation
- very advanced event-derived metrics
- exact Tracker-style profile cloning

## Decisions From This Discussion

- Do not build VALORANT player data around Tracker.gg.
- Use Riot + RSO as the official data source.
- Keep Tracker URLs only as optional reference links.
- Store player data in KOVA database and compute KOVA's own stats.
- Treat custom tournament automation as a validation phase, not a guaranteed outcome.
- Ship a ranked/recent-match-based V1 first.

## Repo Fit

Relevant current repo pieces:

- `apps/main-web`
- `apps/backend`
- `packages/database`

This means the work should be implemented as:

- schema changes in `packages/database`
- Riot integration and sync logic in `apps/backend`
- website rendering in `apps/main-web`

## Final Recommendation

KOVA should pursue an automated VALORANT data system, but with disciplined scope:

- start with official Riot-linked player sync
- compute your own stats
- make the public site read from your own backend
- validate custom/tournament data with a small real-world test before promising it publicly

That path gives the best balance of:

- legality
- reliability
- maintainability
- low daily manual overhead
