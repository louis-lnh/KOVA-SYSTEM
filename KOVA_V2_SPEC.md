# KOVA System v2 Specification

## 1. Purpose

KOVA System v2 is the internal and public digital ecosystem for the KOVA Valorant organization.

The system is split into four products:

1. Main website
2. Apply website
3. Admin panel
4. Discord bot

The first build focus is:

1. Backend API + database
2. Discord bot
3. Apply website
4. Admin panel
5. Main website later

The old `discord bot version 1` and `kova-apply` folders remain reference-only and are not the production foundation for v2.

## 2. Product Goals

### Main Website

The main website is the official public website for KOVA.

Initial direction:

- represent the KOVA Valorant team professionally
- present the brand, roster, and current activity
- show featured player cards for the five best main-team players
- support future content such as standings, upcoming events, Premier match history, streams, and highlights
- optionally integrate external stats sources later, such as Tracker Network

The main website is intentionally deferred until the core internal systems are stable.

### Apply Website

The apply website is the public member-facing application platform.

Core goals:

- Discord OAuth login
- submit forms for different KOVA opportunities
- keep a reusable player/member profile
- unlock or restrict certain forms based on status
- provide a clean, official KOVA application experience

### Admin Panel

The admin panel is a separate website on its own domain.

Core goals:

- protected access by permission level
- manage applications and statuses
- review applicant data and notes
- manage tournaments and future notifications
- act as the main control surface for KOVA staff

### Discord Bot

The Discord bot is the central automation system for the KOVA Discord guild.

Core goals:

- member verification
- review-required verification handling
- apply access synchronization
- application event logging
- Premier and match announcements
- moderation and utility actions
- communication with the backend API

## 3. Hosting Strategy

### Vercel

The following products are hosted on Vercel:

- main website
- apply website
- admin panel

### VPS

The following services are hosted on a VPS:

- backend API
- Discord bot
- database if self-hosted

Reason:

- the Discord bot requires an always-on process and should not be deployed as a standard Vercel app
- the backend and bot should live together because they share verification, application, logging, scheduling, and Discord integrations

## 4. Recommended Architecture

KOVA v2 should be built as a monorepo.

Recommended top-level structure:

```text
kova-system/
  apps/
    apply-web/
    admin-web/
    backend/
    discord-bot/
    main-web/
  packages/
    config/
    database/
    shared/
    ui/
  docs/
```

### Why this structure

- keeps product boundaries clear
- allows shared types and utilities
- avoids duplicating validation and access logic
- makes deployment targets clearer
- scales better than mixing websites and bot logic in one app

## 5. Core Platform Rules

### Single Source of Truth

The backend API and database are the source of truth for:

- users
- Discord identities
- profiles
- applications
- access permissions
- verification states
- tournaments
- notifications
- logs

The websites and bot should read and write through backend services instead of keeping separate JSON state in production.

### Shared Identity

All user identity is centered on Discord OAuth and Discord user IDs.

Each platform user is linked to:

- Discord ID
- Discord username/display data
- optional profile information for applications

### Access Control

Access must be role-based and enforced on both:

- frontend visibility
- backend authorization

Frontend hiding alone is not enough.

## 6. User Roles and Access Levels

There are two different role systems in KOVA v2.

### A. Discord Verification Status

Used for guild entry and member verification flow.

Statuses:

- `verified`
- `review_required`
- `denied_once`
- `denied_twice`
- `banned`
- `bot_banned`

### B. Apply/Admin Access Level

Used for panel permissions and elevated KOVA tools.

Levels:

- `none`
- `mod`
- `admin`
- `full`

Rules:

- one elevated access level per user
- assigning a higher level removes lower elevated access
- removing access returns the user to `none`
- backend and bot must stay synchronized

### Initial permission direction

This still needs final confirmation, but the initial matrix should be:

#### `mod`

- review applications
- change application status in allowed scopes
- add internal notes
- view applicant details
- view logs needed for moderation/review
- no destructive system configuration

#### `admin`

- everything `mod` can do
- manage more application categories
- manage tournaments
- trigger more operational actions
- manage more bot-related admin tools

#### `full`

- full system control
- manage staff access levels
- manage sensitive settings
- manage all admin actions and future configuration modules

Final permission mapping should be locked during implementation of the admin panel and backend auth layer.

## 7. Apply Website Requirements

### Auth UX

The apply site should support Discord login/logout in the same top-corner area.

Desired presentation:

- profile image
- optional username next to profile image
- no large "logged in as" block

### Apply Categories

Current known top-level categories:

- `competitive`
- `staff`
- `community`
- `creative`

### Known Competitive Subtypes

- `main_team_or_academy`
- `premier`
- `tournament`

These names may later be normalized in code as enums or slugs.

### Known Missing Subtypes

Subtypes still need to be defined for:

- staff
- community
- creative

These can be added after the remaining notes are found.

### Reusable Profile Concept

The apply site should support a reusable user profile for common fields such as:

- Riot ID
- tracker link
- current rank
- peak rank
- main agents
- region
- social links

This profile can be reused across forms instead of asking users to re-enter the same data every time.

### Eligibility Logic

The system should support conditional form access.

Known example:

- Premier application only unlocks after a user has an accepted main-team or academy-team application

This logic should live in backend services and not only in the frontend.

## 8. Admin Panel Requirements

The admin panel is a separate website and should not be mixed into the public apply experience.

Core modules for v2:

- dashboard overview
- application management
- application detail view
- internal notes
- duplicate detection
- tournament management
- notification management later
- staff access management later

Minimum application review capabilities:

- filter by category
- filter by subtype
- filter by status
- search by Discord identity and player data
- archive and unarchive entries
- view duplicate applications
- assign team outcome where applicable
- write internal review notes
- track who reviewed an application and when

## 9. Discord Bot Requirements

The v1 reference already confirms several core flows to keep in v2.

### Verification

Auto-verify when:

- user is not a bot/app
- Discord account age is at least the configured minimum
- member role is configured
- role assignment succeeds
- user is not already verified

Direct fail:

- bot/app attempts verification -> automatic ban

Review required when:

- account age is below threshold
- role assignment fails
- member role is missing or invalid

Manual review commands:

- approve verify
- deny verify

Deny flow:

- first deny -> kick
- second deny after rejoin -> ban

### Apply Access Commands

The bot manages exclusive elevated access:

- add mod
- add admin
- add full
- remove mod
- remove admin
- remove full

These commands should write to the shared backend instead of isolated local config files.

### Panels

The bot should support:

- verification panel
- apply info panel

### Announcements

Known announcement areas:

- Premier announcements
- match reminders

Future integrations may include:

- tournament data from the backend
- external stats or schedule sources

## 10. Backend Requirements

The backend should expose authenticated APIs for:

- auth/session support for websites
- user profile CRUD
- application submission
- application review and admin updates
- access-level management
- verification state sync
- tournament CRUD
- notification scheduling and dispatch
- bot-only internal operations

Recommended design:

- API routes grouped by domain
- strict validation on all input
- separate public, authenticated-user, admin, and bot/internal endpoints

## 11. Data Model Direction

The final schema can evolve, but v2 should plan for these main entities:

### User

- id
- Discord ID
- Discord username/display info
- avatar
- created at
- updated at

### User Profile

- user id
- Riot ID
- tracker link
- current rank
- peak rank
- agents
- region
- social links
- updated at

### Application

- id
- user id
- category
- subtype
- title
- status
- archived flag
- structured submission payload
- internal notes
- reviewer identity
- reviewed at
- created at
- updated at

### Access Assignment

- user id
- access level
- assigned by
- assigned at

### Verification Record

- user id or Discord ID
- verification status
- review reason
- attempt count
- verified at
- verified by

### Tournament

- id
- title
- status
- schedule data
- metadata for public/apply visibility

### Notification / Match Event

- type
- target channels
- payload
- scheduled time
- sent status

### Audit Log

- actor
- action
- target type
- target id
- timestamp
- metadata

## 12. External Integration Direction

### Discord

Required now:

- OAuth login for websites
- guild member verification and role updates
- slash commands
- embeds/panels/logs

### Tracker Network

Possible future integration only.

Potential use cases:

- featured player cards on main website
- team/player stats
- maybe support for richer Premier-related displays

This should be treated as optional until confirmed useful and technically viable.

## 13. Build Order

### Phase 1

- monorepo scaffold
- shared config
- backend foundation
- database schema
- auth foundation

### Phase 2

- Discord bot rebuild on top of backend
- verification system
- access management
- logging

### Phase 3

- apply website rebuild
- category selection
- reusable profile
- application forms
- eligibility logic

### Phase 4

- admin panel rebuild
- review workflows
- notes
- duplicate handling
- tournament management

### Phase 5

- main website design and build
- optional stats integrations
- public content modules

## 14. Open Questions

These items are still not fully defined:

- exact subtypes for `staff`
- exact subtypes for `community`
- exact subtypes for `creative`
- final permission matrix for `mod`, `admin`, and `full`
- exact main website content structure
- whether Tracker Network should be used and for which data
- whether the database should be self-hosted on the VPS or use a managed provider

## 15. Immediate Next Action

Proceed with scaffolding the v2 monorepo structure and begin implementation with:

- backend
- Discord bot
- apply website
- admin panel

The main website remains intentionally deferred until the internal system foundation is complete.
