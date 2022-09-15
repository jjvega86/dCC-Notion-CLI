const getClassSchedule = async (client, databaseId) => {
	// retrieve class schedule from Notion, sorted by day ascending for ease of adding dates
	try {
		let response = await client.databases.query({
			database_id: databaseId,
			sorts: [{ property: 'Day', direction: 'ascending' }]
		});
		return response.results;
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	getClassSchedule
};
