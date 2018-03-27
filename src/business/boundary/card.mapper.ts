import { Injectable } from '@angular/core';
import { CardEntity } from '../entity/card.entity';

@Injectable()
export class CardMapper {

  public mapFromDb(card: any): CardEntity {
    const cardEntity = new CardEntity();
    cardEntity.id = card.id;
    cardEntity.title = card.title;
    cardEntity.content = card.content;
    cardEntity.modified = false;

    return cardEntity;
  }
}
