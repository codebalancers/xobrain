/**
 * This class collects static methods that help with arrays
 */
import { LangUtils } from './lang.utils';

export class ArrayUtils {

  /**
   * Remove all occurrences of the specified value from the specified array. If the value cannot be found in the array,
   * the array remains unchanged.
   *
   * @param {T[]} array the is going to be changed
   * @param {T} value that is removed from the array
   * @return {number} number of removed elements
   */
  public static removeElement<T>(array: T[], value: T): number {
    if (LangUtils.isUndefined(array, value)) {
      return 0;
    }

    let ret = 0;

    let index: number;
    while ((index = array.indexOf(value)) !== -1) {
      array.splice(index, 1);
      ret++;
    }

    return ret;
  }

  public static removeElementAtPosition<T>(array: T[], index: number): void {
    if (LangUtils.isUndefined(array)) {
      return;
    }

    array.splice(index, 1);
  }

  public static removeLastElement<T>(array: T[]): void {
    array.splice(array.length - 1, 1);
  }

  public static getFirstElement<T>(array: T[]): T {
    if (LangUtils.isDefined(array) && array.length > 0) {
      return array[ 0 ];
    }
  }

  public static getLastElement<T>(array: T[]): T {
    if (LangUtils.isDefined(array) && array.length > 0) {
      return array[ array.length - 1 ];
    }
  }

  public static getElement<T>(array: T[], index: number, infinite: boolean = false): T {
    if (LangUtils.isDefined(array) && array.length > 0) {
      if (infinite === true) {
        if (index < 0) {
          return array[ index % array.length + array.length ];
        } else {
          return array[ index % array.length ];
        }
      }

      if (index >= 0 && index < array.length) {
        return array[ index ];
      }
    }
  }

  public static pushIfNotPresent<T>(array: T[],
                                    predicate: (addValue: T, arrayElem: T) => boolean,
                                    ...elems: T[]): void {
    if (LangUtils.isUndefined(array)) {
      return;
    }

    elems.forEach(elem => {
      let existing;

      if (LangUtils.isUndefined(predicate)) {
        existing = array.find(e => e === elem);
      } else {
        existing = array.find(e => predicate(elem, e));
      }

      if (LangUtils.isUndefined(existing)) {
        array.push(elem);
      }
    });
  }

  public static contains<T>(array: T[], testValue: any, equalsPredicate?: (arrayElem: T, testValue: any) => boolean): boolean {
    let found: T;

    if (LangUtils.isDefined(equalsPredicate)) {
      found = array.find(a => equalsPredicate(a, testValue));
    } else {
      found = array.find(a => a === testValue);
    }

    return LangUtils.isDefined(found);
  }

  public static containsNot<T>(array: T[], testValue: any, equalsPredicate?: (arrayElem: T, testValue: any) => boolean): boolean {
    return !this.contains(array, testValue, equalsPredicate);
  }
}
