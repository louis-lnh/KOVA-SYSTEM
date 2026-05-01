import type {
  ChatInputCommandInteraction,
  Client,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

export type BotAccessLevel = "none" | "mod" | "admin" | "full";

export interface BotCommand {
  data: RESTPostAPIChatInputApplicationCommandsJSONBody;
  requiredAccess?: Exclude<BotAccessLevel, "none">;
  execute: (
    interaction: ChatInputCommandInteraction,
    client: Client,
  ) => Promise<void>;
}
