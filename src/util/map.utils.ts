import { LangUtils } from './lang.utils';

export class MapUtils {

  public static buildMap<V>(obj): Map<string, V> {
    if (LangUtils.isUndefined(obj)) {
      return;
    }

    const map = new Map<string, V>();

    Object.keys(obj).forEach(key => {
      map.set(key, obj[key]);
    });

    return map;
  }
}
