const padWithLeadingCharacters = (
  input: any,
  length: number,
  character: string,
): string => {
  return String(input).padStart(length, character);
};

export default {
  padWithLeadingCharacters: padWithLeadingCharacters,
};
