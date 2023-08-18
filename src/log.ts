import config from "@/config";
import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({
	token: process.env.AXIOM_TOKEN,
	orgId: process.env.AXIOM_ORG_ID,
});


const error = (messages: unknown[] | string) => {
	if (typeof messages === "string") {
		axiom.ingest(config.axiomDataset, { level: "error", message: messages });
	} else {
		axiom.ingest(config.axiomDataset, { level: "error", ...messages });
	}
	console.error(`${new Date().toISOString()}: ${messages}`);
};

const info = (messages: unknown[] | string) => {
	if (typeof messages === "string") {
		axiom.ingest(config.axiomDataset, { level: "info", message: messages });
	} else {
		axiom.ingest(config.axiomDataset, { level: "info", ...messages });
	}
	console.info(`${new Date().toISOString()}: ${messages}`);
};

const debug = (messages: unknown[] | string) => {
	if (typeof messages === "string") {
		axiom.ingest(config.axiomDataset, { level: "debug", message: messages });
	} else {
		axiom.ingest(config.axiomDataset, { level: "debug", ...messages });
	}
	console.debug(`${new Date().toISOString()}: ${messages}`);
};

const Log = {
	error: error,
	info: info,
	debug: debug,
};
export default Log;