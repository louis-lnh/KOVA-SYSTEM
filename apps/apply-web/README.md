# Apply Web

Public KOVA application website.

Planned responsibilities:

- Discord OAuth user entry
- reusable profile flow
- category and subtype application forms
- eligibility-aware form access

## OAuth Setup

Real Discord OAuth is wired through the apply app routes.

Setup reference:

- `docs/DISCORD_OAUTH_SETUP.md`

Required variables in `apps/apply-web/.env`:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `KOVA_AUTH_SECRET`
- `NEXT_PUBLIC_KOVA_BACKEND_URL`
