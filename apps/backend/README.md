# Backend

Shared API and service layer for KOVA v2.

Planned responsibilities:

- auth/session support
- application APIs
- access control
- tournaments
- notification orchestration
- bot integration endpoints

## Production security notes

Do not expose trusted identity headers directly to browsers. In production,
`x-discord-user-id` is only accepted when a server-side caller also provides
`x-kova-proxy-token` matching `KOVA_BACKEND_PROXY_TOKEN`, or when the caller uses
the internal API token.

Required production hardening env:

- `KOVA_BACKEND_PROXY_TOKEN`: long random shared secret set on backend,
  admin-web, apply-web, and discord-bot.
- `KOVA_CORS_ORIGINS`: comma-separated production web origins allowed to call
  backend, for example `https://kova-esports.com,https://apply.example.com`.
- strong production-only `SESSION_SECRET`, `KOVA_AUTH_SECRET`,
  `INTERNAL_API_TOKEN`, Discord secrets, database URL, and Riot API key.

Preferred hosting shape:

- keep the backend bound to localhost or a private network when possible
- route browser traffic through the web apps and their server-side API proxies
- expose only intentional public read endpoints, such as website public content
  and health checks
