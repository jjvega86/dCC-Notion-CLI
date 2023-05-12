#!/usr/bin/env node

/**
 * dcc-notion
 * Perform common administration tasks for maintaining the devCodeCamp Notion workspace.
 *
 * @author JJ Vega <https://github.com/jjvega86>
 */
const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const { Client } = require('@notionhq/client');
const addClassSchedule = require('./modules/addClassSchedule');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_KEY });

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

// To run commands, type 'dcc + command below' 👇
// Ex. 'dcc schedule' will run the schedule utility
// Quick Tutorial: https://www.youtube.com/watch?v=dfTpFFZwazI&ab_channel=JamesQQuick

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);
	debug && log(flags);
	input.includes(`schedule`) && addClassSchedule(notion);
})();
