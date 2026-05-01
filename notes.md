# KOVA System - Master Notes

This document consolidates all notes and plans we've gathered about the KOVA system, including bot structure, verification, apply system, access levels, and future considerations.

---

## 1. General Overview

* KOVA is a Discord bot system designed for verification, access control, and project management.
* The bot interacts with a website (`Apply Website`) for user verification.
* The bot is planned to have future integrations with dashboards, APIs, and internal tools.

## 2. Verification System

* Users must verify to gain access to certain areas (admin, mod, full access).
* Verification panel UI exists; logic and interaction timing are being implemented.
* Verified users have levels; apply system decides access based on these levels.
* Verification system is planned to be robust, comparable to security bots.
* Data considered for verification: Discord ID, username, optional email.

## 3. Apply System

* Web-based form for users to apply for access.
* Form must collect information relevant to access levels.
* Access assignment:

  * Admin
  * Mod
  * Full access
* Apply logs include timestamps.
* Verification logic integrates with the bot to grant proper roles.
* KOVA handles exclusive access: if a user is upgraded or downgraded, access is automatically updated.
* `setRoAnChannel` command is no longer needed.

## 4. Access Levels Management

* Exclusive by level:

  * Admin access removes users from mod/full if upgraded.
  * Mod access removes users from full if downgraded.
* Apply commands for removing access are included.
* Logging is timestamped for audit purposes.

## 5. Discord OAuth / Auth

* OAuth login is used for the apply website.
* Only users in JSON config as admin can access admin panel.
* Regular users are redirected to the main/apply site.
* Pre-login landing page shows Discord login, no admin hints.

## 6. Bot Structure Notes

* Commands are modular and structured.
* Apply system and verification are integrated.
* Future plans: custom CLI, dashboards, project generator.
* Hosted preferably on Hetzner for reliability; front-end website hosted separately (Vercel).

## 7. Future Considerations

* Custom online status/presence system for bot.
* Dashboard integration for viewing and managing verified users.
* Cloud sync for user stats or progress tracking.
* Potential idle game integration in dashboard (personal project).
* CLI tools for scaffolding new projects in the ecosystem.
* Webhooks/API calls for automated data transfer to internal systems.

## 8. Security & Data Handling

* Stored data: Discord ID, username, optional email.
* No IP addresses or passwords stored.
* Admin decisions are final; strong moderation system planned.
* Logs for audit and verification are timestamped.
* Sensitive areas are hidden from non-admins at all stages.

## 9. Miscellaneous Notes

* Apply system web forms must be fully populated with required fields.
* Config files drive access rights.
* All systems should maintain modularity and minimal inline scripts.
* Future updates will include better verification logic and timing fixes.

---

This file serves as a master reference to KOVA system planning, bot structure, apply/verification workflows, and access control mechanisms.
