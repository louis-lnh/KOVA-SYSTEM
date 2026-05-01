require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits,
    Collection,
    MessageFlags
} = require("discord.js");

const {
    loadConfig,
    saveConfig,
    ensureVerificationRecord
} = require("./utils/configUtils");

const {
    sendSuccessLog,
    sendReviewLog,
    updateVerificationSnapshot
} = require("./utils/verifyUtils");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (!command.data || !command.execute) continue;
    client.commands.set(command.data.name, command);
}

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Bot User ID: ${client.user.id}`);
    console.log(`Application ID: ${client.application.id}`);
});

client.on("interactionCreate", async interaction => {
    try {
        if (interaction.isButton()) {
            if (interaction.customId === "verify_button") {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                await handleVerifyButton(interaction);
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction, client);
    } catch (error) {
        console.error("❌ Interaction error:", error);

        if (error?.code === 10062 || error?.code === 40060) {
            return;
        }

        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.editReply({
                    content: "❌ There was an error while executing this interaction.",
                    flags: MessageFlags.Ephemeral
                });
            } else if (interaction.deferred && !interaction.replied) {
                await interaction.editReply({
                    content: "❌ There was an error while executing this interaction."
                });
            } else {
                await interaction.followUp({
                    content: "❌ There was an error while executing this interaction.",
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (responseError) {
            console.error("❌ Failed to send error response:", responseError);
        }
    }
});

async function handleVerifyButton(interaction) {
    const config = loadConfig();

    if (!interaction.inGuild()) {
        return interaction.editReply({
            content: "❌ This button can only be used inside the server.",
            flags: MessageFlags.Ephemeral
        });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

    if (!member) {
        return interaction.editReply({
            content: "❌ Could not find your member profile in this server.",
            flags: MessageFlags.Ephemeral
        });
    }

    const record = ensureVerificationRecord(config, member.user);
    updateVerificationSnapshot(record, member);

    if (member.user.bot) {
        record.verifyStatus = "bot_banned";
        record.reviewReason = "Confirmed bot/app tried to verify.";
        record.verified = false;
        record.memberRoleGranted = false;
        saveConfig(config);

        await interaction.guild.members.ban(member.id, {
            reason: "Confirmed bot/app attempted verification."
        }).catch(() => null);

        return interaction.editReply({
            content: "❌ Bots/apps cannot be verified.",
            flags: MessageFlags.Ephemeral
        });
    }

    if (!config.memberRoleId) {
        record.verifyStatus = "review_required";
        record.reviewReason = "Member role is not configured.";
        record.verified = false;
        record.memberRoleGranted = false;
        saveConfig(config);

        await sendReviewLog(interaction.guild, config, member, "Member role is not configured.");

        return interaction.editReply({
            content: "⚠️ Verification requires manual review.",
            flags: MessageFlags.Ephemeral
        });
    }

    const memberRole = await interaction.guild.roles.fetch(config.memberRoleId).catch(() => null);

    if (!memberRole) {
        record.verifyStatus = "review_required";
        record.reviewReason = "Configured member role could not be found.";
        record.verified = false;
        record.memberRoleGranted = false;
        saveConfig(config);

        await sendReviewLog(interaction.guild, config, member, "Configured member role could not be found.");

        return interaction.editReply({
            content: "⚠️ Verification requires manual review.",
            flags: MessageFlags.Ephemeral
        });
    }

    if (record.verified || member.roles.cache.has(memberRole.id)) {
        record.verified = true;
        record.verifyStatus = "verified";
        record.memberRoleGranted = true;
        if (!record.verifiedAt) record.verifiedAt = new Date().toISOString();
        saveConfig(config);

        const redirectText = config.redirectChannelId
            ? ` Go to <#${config.redirectChannelId}>.`
            : "";

        return interaction.editReply({
            content: `✅ You are already verified.${redirectText}`,
            flags: MessageFlags.Ephemeral
        });
    }

    const accountAgeMs = Date.now() - member.user.createdTimestamp;
    const minAgeMs = (config.minimumAccountAgeDays || 7) * 24 * 60 * 60 * 1000;

    if (accountAgeMs < minAgeMs) {
        record.verifyStatus = "review_required";
        record.reviewReason = `Account is younger than ${config.minimumAccountAgeDays || 7} days.`;
        record.verified = false;
        record.memberRoleGranted = false;
        saveConfig(config);

        await sendReviewLog(
            interaction.guild,
            config,
            member,
            `Account is younger than ${config.minimumAccountAgeDays || 7} days.`
        );

        return interaction.editReply({
            content: "⚠️ Verification requires manual review.",
            flags: MessageFlags.Ephemeral
        });
    }

    try {
        await member.roles.add(memberRole);

        record.verified = true;
        record.verifiedAt = new Date().toISOString();
        record.verifyStatus = "verified";
        record.reviewReason = null;
        record.memberRoleGranted = true;
        record.verifiedBy = "system";
        saveConfig(config);

        await sendSuccessLog(interaction.guild, config, member, memberRole);

        const redirectText = config.redirectChannelId
            ? ` Go to <#${config.redirectChannelId}>.`
            : "";

        return interaction.editReply({
            content: `✅ Verification successful.${redirectText}`,
            flags: MessageFlags.Ephemeral
        });
    } catch (error) {
        console.error("❌ Failed to add verification role:", error);

        record.verifyStatus = "review_required";
        record.reviewReason = "Role could not be added automatically.";
        record.verified = false;
        record.memberRoleGranted = false;
        saveConfig(config);

        await sendReviewLog(interaction.guild, config, member, "Role could not be added automatically.");

        return interaction.editReply({
            content: "⚠️ Verification requires manual review.",
            flags: MessageFlags.Ephemeral
        });
    }
}

process.on("unhandledRejection", error => {
    console.error("❌ Unhandled promise rejection:", error);
});

process.on("uncaughtException", error => {
    console.error("❌ Uncaught exception:", error);
});

client.login(process.env.DISCORD_TOKEN);