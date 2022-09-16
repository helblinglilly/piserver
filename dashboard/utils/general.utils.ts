export const padWithLeadingCharacters = (
  input: any,
  desiredTotalLength: number,
  character: string,
): string => {
  return String(input).padStart(desiredTotalLength, character);
};

export const compareObjectsOnAttribute = (a: object, b: object, key: string): number => {
  if (a[key] < b[key]) {
    return -1;
  }
  if (a[key] > b[key]) {
    return 1;
  }
  return 0;
};
