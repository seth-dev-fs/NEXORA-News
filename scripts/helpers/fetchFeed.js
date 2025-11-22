const Parser = require("rss-parser");
const { log } = require("./logger");

const parser = new Parser();

async function fetchFeed(feedUrl) {
    try {
        const feed = await parser.parseURL(feedUrl);
        return feed.items;
    } catch (error) {
        log(`[WARN] Failed to fetch feed ${feedUrl}: ${error.message}`, "warn");
        return [];
    }
}

module.exports = { fetchFeed };