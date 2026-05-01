import { REST, Routes } from "discord.js";
import { botEnv } from "./config.js";
import { commands } from "./commands/index.js";

export async function deployCommands() {
  const rest = new REST({ version: "10" }).setToken(botEnv.DISCORD_BOT_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      botEnv.DISCORD_APPLICATION_ID,
      botEnv.DISCORD_GUILD_ID,
    ),
    {
      body: commands.map((command) => command.data),
    },
  );
}

