import { LangUtils } from './lang.utils';

export class StringUtils {

  public static isEmpty(str: string): boolean {
    return !StringUtils.isNotEmpty(str);
  }

  public static isNotEmpty(str: string): boolean {
    return LangUtils.isDefined(str) && str.length !== 0;
  }

  public static isBlank(str: string): boolean {
    return !StringUtils.isNotBlank(str);
  }

  public static isNotBlank(str: string): boolean {
    return LangUtils.isDefined(str) && !/^\s*$/.test(str);
  }

  public static capitalizeFirstLetter(str: string): string {
    if (StringUtils.isBlank(str)) {
      return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public static prepend(str: string, prependString: string): string {
    if (LangUtils.isDefined(str) && StringUtils.isNotBlank(prependString)) {
      return prependString + str;
    }
    return str;
  }

  public static fallbackIfBlank(value: string, ...fallbacks: string[]): string {
    if (StringUtils.isNotBlank(value)) {
      return value;
    }

    if (!LangUtils.isArray(fallbacks)) {
      return null;
    }

    for (const f of fallbacks) {
      if (StringUtils.isNotBlank(f)) {
        return f;
      }
    }

    return null;
  }

  public static trimToNull(value: any): string {
    if (this.isBlank(value)) {
      return null;
    }
    return value;
  }
}
