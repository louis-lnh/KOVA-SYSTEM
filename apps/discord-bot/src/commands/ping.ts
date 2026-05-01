import { SlashCommandBuilder } from "discord.js";
import { createKovaEmbed } from "../services/embeds.js";
import type { BotCommand } from "../types.js";

export const pingCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the KOVA bot is online.")
    .toJSON(),
  async execute(interaction) {
    await interaction.reply({
      embeds: [
        createKovaEmbed(
          "KOVA Bot Online",
          "The KOVA bot is online and connected to the current guild command set.",
        ),
      ],
      ephemeral: true,
    });
  },
};
