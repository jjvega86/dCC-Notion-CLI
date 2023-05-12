const { addDatesToClassSchedule } = require('./addDatesToClassSchedule.js');
const convertDataToNotionEvents = require('./courseScheduleParse');
const { addEventsToDatabase } = require('../api/notionQueries');
/*
Process CSV 
Add events to Notion database
Add dates to events
*/
module.exports = async client => {
	let finalData = await convertDataToNotionEvents(
		process.env.ASSET_COURSE_PATH
	);
	//? What if I add the dates to the events BEFORE I add them to the database? Just POST requests, no PUT
	await addEventsToDatabase(
		client,
		process.env.NOTION_CLASS_SCHEDULE_ID,
		finalData
	);

	await addDatesToClassSchedule(client);
};
