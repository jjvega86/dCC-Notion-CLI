const { addDatesToClassSchedule } = require('./addDatesToClassSchedule.js');
const convertDataToNotionEvents = require('./courseScheduleParse');
const { addEventsToDatabase } = require('../api/notionQueries');
const ora = require('ora');
/*
Process CSV 
Add events to Notion database
Add dates to events
*/
module.exports = async client => {
	const spinnerOne = ora('Converting CSV to Notion events').start();
	let finalData = await convertDataToNotionEvents(
		process.env.ASSET_COURSE_PATH
	);

	spinnerOne.succeed('Events converted!');
	spinnerOne.start('Adding events to database');
	await addEventsToDatabase(
		client,
		process.env.NOTION_CLASS_SCHEDULE_ID,
		finalData
	);
	spinnerOne.succeed('Events added!');

	await addDatesToClassSchedule(client);
};
