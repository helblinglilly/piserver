export interface IValidationInput {
	standingChargeDays: number;
	usage: number;
	rate: number;
	standingChargeRate: number;
	cost: number | undefined;
	charged: number | undefined;
	type?: string;
}
export const validateBillInput = ({
	standingChargeDays,
	usage,
	rate,
	standingChargeRate,
	cost,
	charged,
	type,
}: IValidationInput,
) => {
	let isValid = true;
	const messages: string[] = [];

	const prefix = type ? `${type}: ` : "";

	if (standingChargeDays >= 93) {
		messages.push(`${prefix}Standing charge days were above 93 days (3 months)`);
		isValid = false;
	}
	if (usage >= 2500) {
		messages.push(`${prefix}Usage was above 2500kWh - are your readings correct?`);
		isValid = false;
	}
	if (rate >= 100) {
		messages.push(`${prefix}Unit rate was above £1/kWh - did you input pence?`);
		isValid = false;
	}

	if (standingChargeRate >= 100) {
		messages.push(`${prefix}Standing charge rate was above £1/day - are you sure?`);
		isValid = false;
	}

	if (!charged || charged <= 0) {
		messages.push(`${prefix}You didn't input the amount you got charged`);
		isValid = false;
	} else if (!cost) {
		messages.push(
			`${prefix}No cost provided`,
		);
		isValid = false;
	} else {
		if (charged >= cost * 1.5 || charged <= cost * 0.5) {
			messages.push(
				`${prefix}Charged amount varies by more than 50% from calculated cost - are you sure?`,
			);
			isValid = false;
		}
	}

	return {
		isValid: isValid,
		messages: messages,
	};
};
