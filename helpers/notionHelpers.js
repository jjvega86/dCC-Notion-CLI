const studentValidate = student => {
	for (let property in student) {
		if (!student[property]) {
			student[property] = 'N/A';
		}
	}
};

const formatDatabaseData = data => {
	let formattedData = data.map(page => {
		return {
			id: page.id,
			properties: page.properties
		};
	});

	return formattedData;
};

module.exports = {
	studentValidate,
	formatDatabaseData
};
