export const padWithLeadingCharacters = (
  input: any,
  desiredTotalLength: number,
  character: string,
): string => {
  return String(input).padStart(desiredTotalLength, character);
};
