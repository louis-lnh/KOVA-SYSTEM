# Discord OAuth Setup

This document covers the real Discord login flow used by the KOVA apply website.

## Required Environment Variables

For `apps/apply-web`:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `KOVA_AUTH_SECRET`
- `NEXT_PUBLIC_KOVA_BACKEND_URL`

The example file is:

- `apps/apply-web/.env.example`

## Discord Developer Portal

Create or use a Discord application and configure its OAuth settings.

Required redirect URI format:

- local development: `http://localhost:3000/api/auth/discord/callback`
- production: `https://<your-apply-domain>/api/auth/discord/callback`

The current flow uses the `identify` scope.

## What The Login Flow Does

1. User clicks `Login with Discord`
2. The app creates an OAuth `state` value
3. The user is redirected to Discord
4. Discord returns to `/api/auth/discord/callback`
5. The app exchanges the code for a Discord access token
6. The app fetches the Discord user identity
7. The app stores a signed session cookie for KOVA Apply

## Current Files

- `apps/apply-web/lib/auth-session.ts`
- `apps/apply-web/app/api/auth/discord/route.ts`
- `apps/apply-web/app/api/auth/discord/callback/route.ts`
- `apps/apply-web/app/api/auth/session/route.ts`
- `apps/apply-web/app/api/auth/logout/route.ts`

## Notes

- The apply website currently manages its own signed Discord session cookie.
- The backend still receives the Discord user identity through the apply app's request layer.
- Before production launch, make sure the final apply domain is added to the Discord application's redirect URI list.
