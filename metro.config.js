const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Don't add SQL as source extension since we're not importing SQL files
// config.resolver.sourceExts.push("sql"); // Remove this line

module.exports = config;
