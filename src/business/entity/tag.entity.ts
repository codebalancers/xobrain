import { CacheableEntity } from './cacheable-entity';

export class TagEntity implements CacheableEntity {
  id: number = -1;
  entityName = 'tag';

  constructor(public name?: string,
              id: number = -1,
              public modificationDate?: Date) {
    this.id = id;
  }
}
