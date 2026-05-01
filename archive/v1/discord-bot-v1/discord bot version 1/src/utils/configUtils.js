const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "..", "config", "config.json");

const defaultConfig = {
    guildId: "",
    memberRoleId: "",
    redirectChannelId: "",
    verifyChannelId: "",
    successLogChannelId: "",
    reviewLogChannelId: "",
    premAnChannelId: "",
    applyInfoChannelId: "",
    applyLogChannelId: "",
    matchChannelId: "",
    applyWebsiteUrl: "https://kova-esports-apply.com",
    minimumAccountAgeDays: 7,
    applyAccess: {
        admin: [],
        mod: [],
        fullAccess: []
    },
    verification: {
        users: {}
    }
};

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function normalizeConfig(parsed = {}) {
    return {
        ...clone(defaultConfig),
        ...parsed,
        applyAccess: {
            ...clone(defaultConfig.applyAccess),
            ...(parsed.applyAccess || {})
        },
        verification: {
            ...clone(defaultConfig.verification),
            ...(parsed.verification || {})
        }
    };
}

function ensureConfigFile() {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf8");
    }
}

function loadConfig() {
    ensureConfigFile();

    try {
        const raw = fs.readFileSync(configPath, "utf8").trim();

        if (!raw) {
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf8");
            return clone(defaultConfig);
        }

        return normalizeConfig(JSON.parse(raw));
    } catch (error) {
        console.error("❌ Failed to load config, restoring defaults:", error);
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf8");
        return clone(defaultConfig);
    }
}

function saveConfig(config) {
    ensureConfigFile();

    const safeConfig = normalizeConfig(config);
    const tempPath = `${configPath}.tmp`;

    fs.writeFileSync(tempPath, JSON.stringify(safeConfig, null, 2), "utf8");
    fs.renameSync(tempPath, configPath);
}

function removeUserFromAllApplyLevels(config, userId) {
    config.applyAccess.admin = config.applyAccess.admin.filter(id => id !== userId);
    config.applyAccess.mod = config.applyAccess.mod.filter(id => id !== userId);
    config.applyAccess.fullAccess = config.applyAccess.fullAccess.filter(id => id !== userId);
}

function ensureVerificationRecord(config, user) {
    if (!config.verification) config.verification = { users: {} };
    if (!config.verification.users) config.verification.users = {};

    if (!config.verification.users[user.id]) {
        config.verification.users[user.id] = {
            discordUserId: user.id,
            username: user.username ?? null,
            globalName: user.globalName ?? null,
            avatarUrl: user.displayAvatarURL?.() ?? null,
            isBot: user.bot ?? false,
            accountCreatedAt: user.createdAt ? user.createdAt.toISOString() : null,
            guildJoinedAt: null,
            verified: false,
            verifiedAt: null,
            verifyStatus: null,
            reviewReason: null,
            memberRoleGranted: false,
            verifiedBy: null,
            lastVerificationAttemptAt: null,
            denyCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    return config.verification.users[user.id];
}

function discordTimestamp(date = new Date(), style = "F") {
    const unix = Math.floor(new Date(date).getTime() / 1000);
    return `<t:${unix}:${style}>`;
}

module.exports = {
    loadConfig,
    saveConfig,
    ensureVerificationRecord,
    discordTimestamp
};