import { Injectable } from '@angular/core';
import { CacheableEntity } from '../entity/cacheable-entity';
import { LangUtils } from '../../util/lang.utils';
import { AssertUtils } from '../../util/assert.utils';

@Injectable()
export class DbCacheService {
  private cache = new Map<string, any>();

  public hasObject(entityName: string, id: number): any {
    return LangUtils.isDefined(this.cache.get(`${entityName}_${id}`));
  }

  public getObject(entityName: string, id: number): any {
    return this.cache.get(`${entityName}_${id}`);
  }

  public setObject(object: CacheableEntity): any {
    AssertUtils.isTrue(object.id > 0, 'cannot cache non-persisted objects');
    this.cache.set(`${object.entityName}_${object.id}`, object);
    return object;
  }
}
