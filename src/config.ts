const config = {
	timesheet: {
		hours: 7,
		minutes: 30,
		lunch: {
			hours: 1,
			minutes: 0,
		},
		workDays: 5,
	},
	energy: {
		moveInDate: process.env.MOVE_IN_DATE
			? new Date(process.env.MOVE_IN_DATE)
			: new Date(0),
	},
	axiomDataset: "piserver",
};

export default config;
