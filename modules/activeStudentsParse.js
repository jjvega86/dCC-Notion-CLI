const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const __dirname = path.resolve();

// returns a Promise with the parsed data resolved or an error. Be sure to await the function call when importing.
/*
 * @param {String} courseType - "Full-Time" or "Part-Time"
 * @param {String} cohortName
 * @returns {Promise}
 */
async function parseActiveStudentsCSV(courseType, cohortName, csvPath) {
	let data = [];
	return new Promise((resolve, reject) => {
		fs.createReadStream(path.join(__dirname, csvPath))
			.pipe(csv.parse({ headers: true }))
			.on('error', error => reject(error))
			.on('data', row => {
				row['Cohort'] = cohortName;
				row['Course'] = courseType;
				data.push(row);
			})
			.on('end', () => {
				resolve(data);
			});
	});
}

module.exports = parseActiveStudentsCSV;
