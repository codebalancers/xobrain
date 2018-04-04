import { Injectable } from '@angular/core';
import { CardEntity } from '../entity/card.entity';
import { DbCacheService } from '../control/db-cache.service';

@Injectable()
export class CardMapper {

  constructor(private cache: DbCacheService) {
  }

  public mapFromDb(card: any): CardEntity {
    if (this.cache.hasObject('card', card.id)) {
      return this.cache.getObject('card', card.id);
    }

    const cardEntity = new CardEntity();
    cardEntity.id = card.id;
    cardEntity.title = card.title;
    cardEntity.content = card.content;
    cardEntity.modified = false;

    return this.cache.setObject(cardEntity);
  }
}
