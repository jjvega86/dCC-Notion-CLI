const {
	studentValidate,
	formatDatabaseData
} = require('../helpers/notionHelpers');

const getClassSchedule = async (client, databaseId) => {
	// retrieve class schedule from Notion, sorted by day ascending for ease of adding dates
	const results = [];
	let nextCursor = undefined;
	while (true) {
		try {
			let response = await client.databases.query({
				database_id: databaseId,
				sorts: [{ property: 'Day', direction: 'ascending' }],
				start_cursor: nextCursor,
				page_size: 100
			});
			results.push(...response.results);
			nextCursor = response.next_cursor;

			if (!response.has_more) {
				break;
			}
		} catch (error) {
			console.log(error);
		}
	}

	return results;
};

/* Add student objects from .csv to Active Students */

const addStudentsToDatabase = (client, databaseId, data) => {
	data.forEach(student => {
		try {
			studentValidate(student);
			addStudentToActiveStudents(client, databaseId, student);
		} catch (error) {
			console.error(error);
		}
	});
};

const addStudentToActiveStudents = async (client, databaseId, student) => {
	try {
		await client.pages.create({
			parent: {
				database_id: databaseId
			},
			properties: {
				Name: {
					title: [
						{
							text: {
								content: student['Student Name']
							}
						}
					]
				},
				Course: {
					select: {
						name: student['Course']
					}
				},
				Cohort: {
					select: {
						name: student['Cohort']
					}
				},
				'Standup Status': {
					select: {
						name: 'Not Started'
					}
				},
				'Contact Number': {
					phone_number: student['Contact Number']
				},
				'Emergency Contact Number': {
					phone_number: student['Emergency Contact Number']
				},
				'Emergency Contact Name': {
					rich_text: [
						{
							type: 'text',
							text: {
								content: student['Emergency Contact Name']
							}
						}
					]
				},
				'Admissions Notes': {
					rich_text: [
						{
							type: 'text',
							text: {
								content: student['Admissions Notes']
							}
						}
					]
				}
			}
		});
	} catch (error) {
		console.error(error);
	}
};

/* Add custom course events to a Notion database  */

const addEventsToDatabase = async (client, databaseId, data) => {
	await Promise.all(
		data.map(async courseEvent => {
			try {
				await addNotionCourseEventToDatabase(
					client,
					databaseId,
					courseEvent
				);
			} catch (error) {
				console.error(error);
			}
		})
	);
};

const addNotionCourseEventToDatabase = async (client, databaseId, event) => {
	try {
		await client.pages.create({
			parent: {
				database_id: databaseId
			},
			properties: {
				Name: {
					title: [
						{
							text: {
								content: event.name
							}
						}
					]
				},
				Day: {
					number: event.day
				},
				'Last Working Day': {
					number:
						event.lastWorkingDay === ''
							? event.day
							: event.lastWorkingDay
				},
				Type: {
					select: {
						name: event.type
					}
				}
			}
		});
	} catch (error) {
		console.error(error);
	}
};

/* GET database by databaseId and GET database records by databaseId with filtering, plus formatting helper  */

const getDatabaseById = async (notionClient, databaseId) => {
	try {
		const response = await notionClient.databases.query({
			database_id: databaseId
		});
		return formatDatabaseData(response.results);
	} catch (error) {
		console.error(error);
	}
};

/* EXAMPLE FILTER ARG
let filter = {
  property: "Course",
  select: {
    equals: "Full-Time",
  },
}
*/
const queryDatabaseByFilter = async (notionClient, databaseId, filter = {}) => {
	try {
		const response = await notionClient.databases.query({
			database_id: databaseId,
			filter: filter
		});
		return formatDatabaseData(response.results);
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	getClassSchedule,
	addStudentsToDatabase,
	addEventsToDatabase,
	getDatabaseById,
	queryDatabaseByFilter
};
