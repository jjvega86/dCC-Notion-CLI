const { isWeekend } = require('../modules/addDatesToClassSchedule');

describe('Date helper function tests', () => {
	test('Returns true when date is a Saturday (6)', () => {
		// arrange
		let date = new Date('2021/10/30');

		// act
		let result = isWeekend(date);

		// assert
		expect(result).toBe(true);
	});
});
