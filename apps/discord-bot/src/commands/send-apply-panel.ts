import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";
import { botEnv } from "../config.js";
import { createKovaEmbed } from "../services/embeds.js";
import type { BotCommand } from "../types.js";

export const sendApplyPanelCommand: BotCommand = {
  requiredAccess: "admin",
  data: new SlashCommandBuilder()
    .setName("sendapplypanel")
    .setDescription("Send the KOVA apply information panel into a channel.")
    .toJSON(),
  async execute(interaction) {
    if (!interaction.channel || !interaction.channel.isSendable()) {
      await interaction.reply({
        content: "This channel does not support sending the apply panel.",
        ephemeral: true,
      });
      return;
    }

    const embed = createKovaEmbed(
      "KOVA Apply",
      "Applications for KOVA are handled through the official apply website. Open the site to view categories, choose the right form, and submit your application.",
    )
      .addFields({
        name: "Apply Website",
        value: botEnv.KOVA_APPLY_URL,
      });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Open Apply Website")
        .setStyle(ButtonStyle.Link)
        .setURL(botEnv.KOVA_APPLY_URL),
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: "Apply panel sent.",
      ephemeral: true,
    });
  },
};
