export const validateBillInputFE = (standingChargeDays: number, electricityUsage: number, electricityRate: number, electricityStandingChargeRate: number, electricityCharged: number | undefined, electricityCost: number | undefined, gasUsage: number, gasRate: number, gasStandingChargeRate: number, gasCost: number | undefined, gasCharged: number | undefined) => {
  let isValid = true;
  const messages: string[] = [];

  if (standingChargeDays > 100){
    messages.push( "Standing charge days are > 100 - are your dates correct?")
    isValid = false;
  }

  if (electricityUsage > 2500){
    messages.push( "Electricity usage was above 2500kWh - are your readings correct?")
    isValid = false;
  }
  if (electricityRate > 1000){
    messages.push( "Electricity unit rate was above £1/kWh - did you input pence?")
    isValid = false;
  }

  if (electricityStandingChargeRate > 1000){
    messages.push( "Electricity standing charge rate was above £1/day - are you sure?")
    isValid = false;
  }

  if (!electricityCharged || electricityCharged <= 0){
    messages.push( "You didn't input the amount you got charged for electricity")
    isValid = false;
  } else if (!electricityCost){
    messages.push( "You are missing some electricity fields")
    isValid = false;
  } else {
    if (electricityCharged > electricityCost * 1.5 || electricityCharged < electricityCost * 0.5){
      messages.push("Electricity amount charged varies by more than 50% from calculated cost - are you sure?")
      isValid = false;
    }
  }

  if (gasUsage > 2500){
    messages.push( "Gas usage was above 2500kWh - are your readings correct?")
    isValid = false;
  }
  if (gasRate > 1000){
    messages.push( "Gas unit rate was above £1/kWh - did you input pence?")
    isValid = false;
  }

  if (gasStandingChargeRate > 1000){
    messages.push( "Gas standing charge rate was above £1/day - are you sure?")
    isValid = false;
  }

  if (!gasCharged || gasCharged === 0){
    messages.push( "You didn't input the amount you got charged for gas")
    isValid = false;
  } else if (!gasCost){
    messages.push( "You are missing some gas fields")
    isValid = false;
  } else {
    if (gasCharged > gasCost * 1.5 || gasCharged < gasCost * 0.5){
      messages.push("Gas amount charged varies by more than 50% from calculated cost - are you sure?")
      isValid = false;
    }
  }

  return {
    isValid: isValid,
    messages: messages,
  };
}

export const validateBillInputBE = (usage: number, rate: number, standingChargeRate: number, cost: number, charged: number) => {
  let isValid = true;
  const messages: string[] = [];

  if (usage > 2500){
    messages.push( "Usage was above 2500kWh - are your readings correct?")
    isValid = false;
  }
  if (rate > 1000){
    messages.push( "Unit rate was above £1/kWh - did you input pence?")
    isValid = false;
  }

  if (standingChargeRate > 1000){
    messages.push( "Standing charge rate was above £1/day - are you sure?")
    isValid = false;
  }

  if (charged <= 0){
    messages.push( "You didn't input the amount you got charged for electricity")
    isValid = false;
  } else {
    if (charged > cost * 1.5 || charged < cost * 0.5){
      messages.push( "Charged amount varies by more than 50% from calculated cost - are you sure?")
      isValid = false;
    }
  }

  return {
    isValid: isValid,
    messages: messages,
  };
}