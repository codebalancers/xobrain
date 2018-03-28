import { LangUtils } from './lang.utils';

export class AssertUtils {

  /**
   * Ensures that the specified object is neither null nor undefined and throws an error otherwise.
   *
   * @param object to be checked
   * @param {string} errorMessage optional message for the thrown error
   */
  public static isDefined(object: any, errorMessage?: string): void {
    if (LangUtils.isUndefined(object)) {
      throw new Error(errorMessage);
    }
  }

  public static isTrue(object: boolean, errorMessage?: string): void {
    if (object !== true) {
      throw new Error(errorMessage);
    }
  }
}
