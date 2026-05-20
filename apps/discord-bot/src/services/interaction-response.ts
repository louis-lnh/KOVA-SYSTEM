import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  MessageCreateOptions,
  RepliableInteraction,
  InteractionEditReplyOptions,
} from "discord.js";
import { MessageFlags } from "discord.js";

type SupportedInteraction = RepliableInteraction | ChatInputCommandInteraction | ButtonInteraction;
type InteractionResponse = Pick<
  MessageCreateOptions,
  "content" | "components" | "embeds" | "allowedMentions"
>;

export async function sendEphemeralResponse(
  interaction: SupportedInteraction,
  options: string | InteractionResponse,
) {
  const payload =
    typeof options === "string" ? ({ content: options } satisfies InteractionResponse) : options;

  if (interaction.deferred) {
    await interaction.editReply(payload as InteractionEditReplyOptions);
    return;
  }

  if (interaction.replied) {
    await interaction.followUp({
      ...payload,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply({
    ...payload,
    flags: MessageFlags.Ephemeral,
  });
}
