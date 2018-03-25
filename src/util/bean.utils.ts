import { StringUtils } from './string.utils';
import { LangUtils } from './lang.utils';

export class BeanUtils {

  /**
   * Retrieve the property of a object.
   *
   * @param obj of which a property shall be retrieved
   * @param {string} path for the property
   * @returns {any} the value of the found property or undefined
   */
  public static getValueOf(obj: any, path: string): any {
    if (LangUtils.isUndefined(obj)) {
      return null;
    }

    if (StringUtils.isBlank(path)) {
      return obj;
    }

    let tempObj = obj;
    const keys = path.split('.');

    for (const key of keys) {
      tempObj = typeof tempObj[key] !== 'undefined' ? tempObj[key] : null;
      if (LangUtils.isUndefined(tempObj)) {
        return tempObj;
      }
    }

    return tempObj;
  }
}
