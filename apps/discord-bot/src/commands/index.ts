import type { BotCommand } from "../types.js";
import { checkAccessCommand } from "./check-access.js";
import { botConfigCommand } from "./bot-config.js";
import { approveVerifyCommand } from "./approve-verify.js";
import { denyVerifyCommand } from "./deny-verify.js";
import { pingCommand } from "./ping.js";
import { sendApplyPanelCommand } from "./send-apply-panel.js";
import { sendVerifyPanelCommand } from "./send-verify-panel.js";
import { setAccessCommand } from "./set-access.js";
import { verificationStatusCommand } from "./verification-status.js";

export const commands: BotCommand[] = [
  pingCommand,
  botConfigCommand,
  checkAccessCommand,
  approveVerifyCommand,
  denyVerifyCommand,
  setAccessCommand,
  sendApplyPanelCommand,
  sendVerifyPanelCommand,
  verificationStatusCommand,
];
