export default class Log {
	caller = "";

	constructor(caller: string) {
		this.caller = caller;
	}

	info(message: string) {
		console.log(`${new Date().toISOString()} INFO ${this.caller} : ${message}`);
	}

	error(message: string) {
		console.error(`${new Date().toISOString()} INFO ${this.caller} : ${message}`);
	}
}
