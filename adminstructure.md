admin-panel/
├── package.json
├── tsconfig.json
├── next.config.js
├── public/
│   └── assets/          # Logo, Icons
└── src/
    ├── pages/
    │   ├── index.tsx           # Landing Page + Discord OAuth Button
    │   ├── dashboard.tsx       # Dashboard Übersicht
    │   ├── apply.tsx           # Apply Management
    │   ├── notifications.tsx   # Premier Notifications + Scheduler
    │   ├── bot-commands.tsx    # Bot Commands Trigger
    │   ├── admin-accounts.tsx  # Admin Account Management
    │   └── apply-editor.tsx    # Apply Form Editor
    │
    ├── components/
    │   ├── ui/            # Buttons, Inputs, Layouts
    │   ├── tables/        # Tabellen für Apply / Logs
    │   └── forms/         # Apply Forms & Notifications Forms
    │
    └── lib/
        ├── api.ts         # API Call Helper
        ├── auth.ts        # OAuth Helper & Admin Check
        └── types.ts       # TS Interfaces / Types