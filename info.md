# KOVA SYSTEM 2.0

Informations about the new System for KOVA.
This system is build only for KOVA and therefore only used by KOVA.

Github Repository:
Discord Bot:
Website 1: https://kova-esports.com
Website 2: https://kova-esports-apply.com
Website 3: https://shd-esports.com
Hosting: 
    - Websites Frontend:
    - API:
    - Bot:
Monthly Cost:
Admin Access:

## ABOUT

## Website 1 - MAIN
## Website 2 - APPLY
## Website 3 - ADMIN (shd-esports - temporary)
## Discord Bot
The KOVA Bot is the central Discord automation and verification system for the KOVA Esports system.
### Overview
It is responsible for:
- Member verification
- Staff review workflows
- Application access synchronization with both KOVA Websites
- Match and Premier announcments
- Logging aand moderation utilities
- API communication with both KOVA Websites and TRN

The Bot is designed to only work for KOVA - on their main Discord Server.

---

### Verification System

#### Auto Verify Conditions

User is automatically verified if:

- User is not a bot/app
- Discord account age ≥ 7 days
- Member role is configured
- Role can be assigned succesfully

- User is not already verified

#### Direct Fail

- If user is confirmed to be a bot or an app -> automatic ban

#### Review Required

Triggered if:

- Account age < 7 days
- Role couldnt be assigned


-> A Staff Member has to manually verify this User

##### Manual Review Commands

- /approveVerify user
- /denyVerify user reason

Logic:
- First deny -> Server Kick
- If user rejoins -> attempts verify -> review again -> second deny -> Ban

#### Verification Status Values

- verified
- review_required
- denied_once
- denied_twice
- banned
- bot_banned

---

### Apply Access System

Commands:

- /addAdminApply user
- /addModApply user
- /addFullAccApply user
- /removeAdminApply user
- /removeModApply user
- /removeFullAccApply user

Rules:

- Only one access level per user
- Setting a new level removes previous one
- Used by Apply Website via Discord OAuth

---

### Apply Logs (API Driven)

Trigger:

- New application submitted

Discord Preview includes:

- Username
- Discord ID
- Application Category
- Subtype
- Status (pending / archived / accepted)
- Created timestamp
- Link to full application

---

### Panels

#### Verify Panel

Welcome to KOVA  
Before accessing the server you must read the rules.  
Click verify to confirm you agree.

#### Apply Info Panel

Explains what the Apply Website is and includes link:

https://kova-esports-apply.com

---

### Announcement Systems

#### Premier Announcement Channel

Command:

- sendPremAnnouncement

Manual input includes:

- Team (Main / Academy)
- Opponent
- Players
- Stats
- Result
- Map
- League (optional)
- Standing (optional)
- Timestamp

---

#### Match Channel

Used for reminders:

- Premier → 1 hour before
- Tournaments → 24h + 1h before

Data sources:

- Manual match list input
- Apply Website tournament creation API
- Future integrations possible

---

### Logging

#### Success Log

Triggered on successful verification:

- User mention
- User ID
- Role added
- Timestamp

#### Review Log

Triggered when verification requires staff action:

- User mention
- User ID
- Reason
- Timestamp

---

### Website Integration

#### Apply Website

- Reads ApplyAccess users
- Sends application events via API
- Provides tournament schedule data

---

### Hosting Strategy

Recommended:

- VPS (Hetzner / similar)
- PM2 process manager
- Node environment
- Express API endpoint for website communication

---

## CREDITS
KOVA SYSTEM BUILT BY LUIGI
All rights reserverd by KOVA

## CONTACT
Dev Email: luigi@kova.com
Support Email: support@kova.com
Owner Email: basura@kova.com