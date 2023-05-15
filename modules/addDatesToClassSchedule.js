const prompt = require('prompt-sync')();
const { getClassSchedule } = require('../api/notionQueries');
const ora = require('ora');

const parseClassScheduleEvents = events => {
	// whittle down raw Notion data into objects with only the necessary properties
	let parsedEvents = events.map(page => {
		return {
			pageId: page.id,
			day: page.properties.Day.number,
			type: page.properties.Type.select.name,
			lastWorkingDay: page.properties['Last Working Day'].number,
			name: page.properties.Name.title[0].text.content
		};
	});
	return parsedEvents;
};

function populateClassDatesMap(date, finalClassDay, formatDate) {
	// takes all days in a course and adds each as a key to the map. Value is the date of that course day.
	let classDates = new Map();
	for (let index = 1; index <= finalClassDay; index++) {
		classDates.set(index, formatDate(date));
		date.setDate(date.getDate() + 1);
		// add day. Then check if day is a weekend or holiday. If either condition is true, keep incrementing days (always checking for both for each day)
		while (isNonSchoolDay(date) || isHoliday(date)) {
			date.setDate(date.getDate() + 1);
		}
	}
	return classDates;
}

function isNonSchoolDay(date) {
	if (date.getDay() === 0 || date.getDay() === 6) {
		return true;
	} else {
		return false;
	}
}

function isHoliday(date) {
	// add any holidays in the year using strings in the below array
	let holidays = ['2023-05-29', '2023-09-04'];
	if (holidays.includes(formatDate(date))) {
		return true;
	} else {
		return false;
	}
}
function formatDate(date) {
	return `${date.getFullYear()}-${
		date.getMonth() + 1 < 10
			? '0' + (date.getMonth() + 1)
			: date.getMonth() + 1
	}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
}

function addDatesToClassEvents(events, classDates) {
	// classDates is Map of key (day number) values (dates of course day as ISO strings)
	// add start and end dates with each event. Add end only if lastWorkingDay is not the same as Day #
	let eventsWithDates = events.map(event => {
		if (event.day !== event.lastWorkingDay) {
			return {
				...event,
				start: classDates.get(event.day),
				end: classDates.get(event.lastWorkingDay)
			};
		} else {
			return { ...event, start: classDates.get(event.day) };
		}
	});
	return eventsWithDates;
}

const updateEvent = async (client, event) => {
	try {
		return await client.pages.update({
			page_id: event.pageId,
			properties: {
				'Date Assigned': {
					date: {
						start: event.start,
						end: event.end ? event.end : null
					}
				}
			}
		});
	} catch (error) {
		console.error(error);
	}
};

const updateClassEvents = async (client, eventsWithDates) => {
	let promises = eventsWithDates.map(event => {
		return updateEvent(client, event);
	});

	await Promise.all(promises);
};

const addDatesToClassSchedule = async client => {
	let userInput = prompt('What date does the class start? <YYYY/MM/DD>');
	let numberOfClassDays = parseInt(
		prompt('How many days are in the course?')
	);

	const spinner = ora('Adding dates to schedule!').start();

	let notionEvents = await getClassSchedule(
		client,
		process.env.NOTION_CLASS_SCHEDULE_ID
	);

	let parsedEvents = parseClassScheduleEvents(notionEvents);
	let classDates = populateClassDatesMap(
		new Date(userInput),
		numberOfClassDays,
		formatDate
	);

	let eventsWithDates = addDatesToClassEvents(parsedEvents, classDates);
	await updateClassEvents(client, eventsWithDates);
	spinner.succeed('Dates added to schedule!');
	process.exit();
};

module.exports = {
	addDatesToClassSchedule,
	isWeekend: isNonSchoolDay
};
