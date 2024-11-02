const error = (messages: unknown[] | string) => {
	console.error(`${new Date().toISOString()}: ${messages}`);
};

const info = (messages: unknown[] | string) => {
	console.info(`${new Date().toISOString()}: ${messages}`);
};

const debug = (messages: unknown[] | string) => {
	console.debug(`${new Date().toISOString()}: ${messages}`);
};

const Log = {
	error: error,
	info: info,
	debug: debug,
};
export default Log;
