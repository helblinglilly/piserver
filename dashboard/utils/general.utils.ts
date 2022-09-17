export class GeneralUtils {
  static padWithLeadingCharacters = (
    input: any,
    desiredTotalLength: number,
    character: string,
  ): string => {
    return String(input).padStart(desiredTotalLength, character);
  };

  static compareObjectsOnAttribute = (a: object, b: object, key: string): number => {
    if (a[key] < b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
    return 0;
  };

  static replaceNewlineTabWithSpace = (input: string): string => {
    return input.replace(/  |\r\n|\n|\r/gm, "");
  };
}

export default GeneralUtils;
