const log = (message, level = 'INFO') => console.log(`[${new Date().toISOString()}] [${level}] ${message}`);

module.exports = { log };
