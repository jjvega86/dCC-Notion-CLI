const { Client } = require('@notionhq/client');

// Initializing a client
const notion = new Client({
	auth: process.env.NOTION_KEY
});

module.exports = notion;
