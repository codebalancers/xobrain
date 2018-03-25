/**
 * This class collects static methods that help with typescript/javascript.
 */

export class LangUtils {

  /**
   * Test whether the provided value is defined (value is not null nor undefined).
   *
   * @param val to be checked
   * @return {boolean} true if value is defined
   */
  public static isDefined(val): boolean {
    return val !== null && val !== undefined;
  }

  /**
   * Test whether specified values are undefined.
   *
   * @param val
   * @param otherVals
   * @return {boolean} true if any value is undefined, false otherwise
   */
  public static isUndefined(val, ...otherVals): boolean {
    if (!LangUtils.isDefined(val)) {
      return true;
    }

    if (!LangUtils.isDefined(otherVals)) {
      return false;
    }

    for (const v of otherVals) {
      if (!LangUtils.isDefined(v)) {
        return true;
      }
    }

    return false;
  }

  public static isArray(array: any[]): boolean {
    if (LangUtils.isUndefined(array)) {
      return false;
    }

    return array instanceof Array;
  }
}
