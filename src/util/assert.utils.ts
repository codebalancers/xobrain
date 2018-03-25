import { LangUtils } from './lang.utils';

export class AssertUtils {

  /**
   * Ensures that the specified object is neither null nor undefined and throws an error otherwise.
   *
   * @param object to be checked
   * @param {string} errorMessage optional message for the thrown error
   */
  public static isDefined(object: any, errorMessage?: string): void {
    console.assert(LangUtils.isDefined(object), errorMessage);
  }

  public static isTrue(object: boolean, errorMessage?: string): void {
    console.assert(object === true, errorMessage);
  }
}
