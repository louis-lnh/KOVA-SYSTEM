import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";
import { createKovaEmbed } from "../services/embeds.js";
import type { BotCommand } from "../types.js";

export const sendVerifyPanelCommand: BotCommand = {
  requiredAccess: "admin",
  data: new SlashCommandBuilder()
    .setName("sendverifypanel")
    .setDescription("Send the KOVA verification panel into a channel.")
    .toJSON(),
  async execute(interaction) {
    if (!interaction.channel || !interaction.channel.isSendable()) {
      await interaction.reply({
        content: "This channel does not support sending a verification panel.",
        ephemeral: true,
      });
      return;
    }

    const embed = createKovaEmbed(
      "Welcome to KOVA",
      "Before accessing the server you must read the rules. Click verify to confirm you agree.",
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("verify_button")
        .setLabel("Verify")
        .setStyle(ButtonStyle.Success),
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: "Verification panel sent.",
      ephemeral: true,
    });
  },
};
