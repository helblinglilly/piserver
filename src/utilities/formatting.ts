/**
 * Pads a given character to the left of an input string to achieve a certain length
 * @param input The original input
 * @param padChar The character that should be used to pad up to the given length
 * @param targetLength The length to aim for
 * @returns
 */
export const padLeft = (
	input: string | number,
	padChar: string,
	targetLength: number,
): string => {
	let inputCopy = input.toString();
	while (inputCopy.length < targetLength) {
		inputCopy = `${padChar}${inputCopy}`;
	}
	return inputCopy;
};

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
