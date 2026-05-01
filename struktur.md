kova-system/
│
├── frontend/                 # Main Website + Apply
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── public/
│   │   └── assets/           # Bilder, Icons, Fonts
│   └── src/
│       ├── pages/
│       │   ├── index.tsx     # Landing Page
│       │   ├── login.tsx
│       │   ├── dashboard.tsx # User Dashboard / Stats
│       │   └── apply/
│       │       ├── index.tsx       # Apply Auswahl
│       │       └── [type].tsx      # Dynamische Formulare (mod, admin, etc.)
│       ├── components/
│       │   ├── ui/           # Buttons, Inputs, Layouts
│       │   ├── forms/        # Wiederverwendbare Form-Komponenten
│       │   └── layout/       # Header/Footer/Layout Wrapper
│       └── lib/
│           ├── api.ts        # API Call Helpers
│           └── auth.ts       # Auth Helper
│
├── admin-panel/             # Admin Panel (eigene Domain)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── public/
│   │   └── assets/
│   └── src/
│       ├── pages/
│       │   ├── index.tsx     # Admin Dashboard / Overview
│       │   ├── apply.tsx     # Apply Management
│       │   ├── logs.tsx      # Logs & History
│       │   └── notifications.tsx # Premier Notification Management
│       ├── components/
│       │   ├── ui/
│       │   ├── tables/
│       │   └── forms/
│       └── lib/
│           ├── api.ts        # API Call Helpers für Admin Aktionen
│
├── backend/                 # API + Discord Bot
│   ├── package.json
│   ├── tsconfig.json
│   ├── server.js             # Express / Fastify API Entry
│   ├── bot/                  # Discord Bot
│   │   ├── index.js          # Bot Init & Login
│   │   ├── commands/
│   │   │   ├── verify.js
│   │   │   ├── applyNotify.js
│   │   │   └── premier.js    # Premier Notifications Commands
│   │   └── events/
│   │       ├── ready.js
│   │       └── messageCreate.js
│   ├── api/
│   │   ├── routes/
│   │   │   ├── apply.js
│   │   │   ├── verify.js
│   │   │   ├── auth.js
│   │   │   └── notifications.js
│   │   ├── controllers/
│   │   │   ├── applyController.js
│   │   │   ├── verifyController.js
│   │   │   └── notificationsController.js
│   │   └── middleware/
│   │       └── authMiddleware.js
│   └── db/
│       ├── schema.prisma
│       └── client.js
│
├── shared/                 # Shared Code zwischen Frontend/Admin
│   └── types/              # TypeScript Interfaces / Types
│       ├── apply.d.ts
│       ├── user.d.ts
│       └── notification.d.ts
│
└── README.md