const db = require("../db");
const format = require("pg-format");

const env = process.env.NODE_ENV || "dev";

exports.selectDay = async (day, username) => {
	return db
		.query(
			format(
				`SELECT * FROM "timesheet-${env}" WHERE day_date=%L AND username=%L`,
				day,
				username
			)
		)
		.then(({ rows }) => rows[0]);
};

exports.selectUsername = async (ip) => {
	return db
		.query(format(`SELECT username FROM "usertable-${env}" WHERE ip LIKE %L`, ip))
		.then(({ rows }) => rows[0].username);
};

exports.insertUsertable = async (ip, username) => {
	try {
		return db.query(
			format(
				`INSERT INTO "usertable-${env}" (ip, username) VALUES (%L, %L)`,
				ip,
				username
			)
		);
	} catch (err) {
		console.log(err);
	}
};

exports.insertClockIn = async (day, username, time) => {
	db.query(
		format(
			`INSERT INTO "timesheet-${env}" (day_date, username, clock_in) VALUES (%L, %L, %L)`,
			day,
			username,
			time
		)
	)
		.then(() => console.log(`Inserted clock in: ${username} ${day} ${time}`))
		.catch((err) => console.log(err));
};

exports.insertBreakStart = async (day, username, time) => {
	db.query(
		format(
			`UPDATE "timesheet-${env}" SET break_in=%L WHERE day_date=%L AND username=%L`,
			time,
			day,
			username
		)
	)
		.then(() => console.log(`Inserted break in: ${username} ${day} ${time}`))
		.catch((err) => console.log(err));
};

exports.insertBreakEnd = async (day, username, time) => {
	db.query(
		format(
			`UPDATE "timesheet-${env}" SET break_out=%L WHERE day_date=%L AND username=%L`,
			time,
			day,
			username
		)
	)
		.then(() => console.log(`Inserted break end: ${username} ${day} ${time}`))
		.catch((err) => console.log(err));
};

exports.insertClockOut = async (day, username, time) => {
	db.query(
		format(
			`UPDATE "timesheet-${env}" SET clock_out=%L WHERE day_date=%L AND username=%L`,
			time,
			day,
			username
		)
	).catch((err) => console.log(err));
};
