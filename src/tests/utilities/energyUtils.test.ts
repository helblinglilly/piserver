import { IValidationInput, validateBillInput } from "@/utilities/energyUtils";


describe("validateBillInput", () => {
  const validInput: IValidationInput = {
    standingChargeDays: 31,
    usage: 135.5,
    rate: 47.39,
    standingChargeRate: 51.39,
    cost: 80.1,
    charged: 60.55,
  }

  it("Accepts valid input", () => {
    expect(validateBillInput(validInput)).toMatchObject({ isValid: true })
  })

  it("Standing charge days cover more than 3 months", () => {
    const input = { ...validInput, standingChargeDays: 94 }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  });

  it("Usage is over 2500kWh", () => {
    const input = { ...validInput, usage: 2500 }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  })

  it("Unit rate is over £1/kWh", () => {
    const input = { ...validInput, rate: 100 }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  });

  it("Standing charge rate over £1/day", () => {
    const input = { ...validInput, standingChargeRate: 100 }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  })

  it("Cost is missing", () => {
    const input = { ...validInput, cost: undefined }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  })

  it("Cost is negative", () => {
    const input = { ...validInput, cost: -1 }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  })

  it("Amount charged is missing", () => {
    const input = { ...validInput, charged: undefined }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  })

  it("Amount charged is negative", () => {
    const input = { ...validInput, charged: -1 }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  })

  it("Amount charged is higher than 50% the cost", () => {
    const input = { ...validInput, charged: 150, cost: 100 }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  })

  it("Amount charged is less than 50% the cost", () => {
    const input = { ...validInput, charged: 50, cost: 100 }
    const output = validateBillInput(input)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(1);
  })

  it("Message length covers every failure", () => {
    const invalidInput: IValidationInput = {
      standingChargeDays: 100,
      usage: 2500,
      rate: 100,
      standingChargeRate: 100,
      cost: 100,
      charged: 150,
    }

    const output = validateBillInput(invalidInput)
    expect(output).toMatchObject({
      isValid: false
    })
    expect(output.messages.length).toBe(5);
  })

  it("Message output contains type", () => {
    const input = { ...validInput, charged: -1 }
    expect(validateBillInput(input).messages[0]).not.toContain(":");

    input.type = "Gas"
    expect(validateBillInput(input).messages[0]).toContain("Gas: ");

    input.type = "Electricity"
    expect(validateBillInput(input).messages[0]).toContain("Electricity: ");
  })
})