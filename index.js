#!/usr/bin/env node

/**
 * dcc-notion
 * Perform common administration tasks for maintaining the devCodeCamp Notion workspace.
 *
 * @author JJ Vega <https://github.com/jjvega86>
 */
const prompt = require('prompt-sync')();
const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);
})();
