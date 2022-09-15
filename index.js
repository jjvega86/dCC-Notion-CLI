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
require('dotenv').config();

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);
	//TODO: Import notion from client.js, pass into "factory" menu function for core features

	debug && log(flags);
})();
