const prompt = require('prompt-sync')();
const { getClassSchedule } = require('../api/notionQueries');

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
	let holidays = [
		'2021-11-25',
		'2021-11-26',
		'2021-12-24',
		'2021-12-25',
		'2021-12-26',
		'2021-12-27',
		'2021-12-28',
		'2021-12-29',
		'2021-12-30',
		'2021-12-31',
		'2022-01-01',
		'2022-01-02',
		'2022-05-30',
		'2022-07-04',
		'2022-09-05'
	];
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

const updateClassEvents = async (client, eventsWithDates) => {
	await Promise.all(
		eventsWithDates.map(async event => {
			try {
				await client.pages.update({
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
		})
	);
};

const addDatesToClassSchedule = async client => {
	let userInput = prompt('What date does the class start? <YYYY/MM/DD>');
	let numberOfClassDays = parseInt(
		prompt('How many days are in the course?')
	);

	//TODO: ???? -> updateClassEvents timing out + not getting all events
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
	process.on('exit', () => console.log('Dates added to class schedule!'));
};

module.exports = {
	addDatesToClassSchedule,
	isWeekend: isNonSchoolDay
};
