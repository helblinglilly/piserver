export function leftPad(
	str: string | number,
	len: number,
	ch: string | number,
) {
	str = String(str);
	ch = ch || " ";
	len = len - str.length;
	if (len <= 0) {
		return str;
	}
	var pad = "";
	while (pad.length < len) {
		pad += ch;
	}
	return pad + str;
}

export const toDate = (input: string | Date | number) => {
	if (input instanceof Date) {
		return input;
	}
	const date = new Date(input);
	if (Number.isNaN(date.getTime())) {
		console.error(`${input} is not a valid date`);
	}
	return date;
};