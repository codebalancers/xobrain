import { Injectable } from '@angular/core';
import { DatabaseService } from '../control/database.service';
import { Observable } from 'rxjs/Observable';
import { CardEntity } from '../entity/card.entity';
import { CardMapper } from './card.mapper';


@Injectable()
export class LinkService {
  constructor(private dbService: DatabaseService,
              private cardMapper: CardMapper) {
  }

  public createLink(from: CardEntity, to: CardEntity) {
    this.dbService
      .getConnection('card_card')
      .insert({ card1_id: from.id, card2_id: to.id, modificationDate: new Date(), weight: 1.0 })
      .then(d => console.log(d));
  }

  public updateLinks(from: CardEntity, to: { card: CardEntity, weight: number }[]) {
    Observable
      .fromPromise(
        this.dbService
          .getConnection('card_card')
          .where('card1_id', from.id)
          .del()
      )
      .flatMap(d => {
        console.log(d);

        const data = to.map(entry => {
          return {
            card1_id: from.id,
            card2_id: entry.card.id,
            modificationDate: new Date(),
            weight: entry.weight
          };
        });

        if (data.length === 0) {
          return Observable.of(null);
        }

        return Observable.fromPromise(this.dbService
          .getConnection('card_card')
          .insert(data)
        );
      })
      .subscribe(d => console.log(d));
  }

  public getLinks(cardId: number): Observable<CardEntity[]> {
    return Observable
      .fromPromise(
        this.dbService.getConnection('card')
          .innerJoin('card_card', 'card_card.card2_id', 'card.id')
          .where('card_card.card1_id', cardId)
      )
      .map((res: any[]) => {
        return res.map(r => this.cardMapper.mapFromDb(r));
      });
  }

  public countAllLinks(cardId: number): Observable<number> {
    return Observable
      .fromPromise(
        this.dbService.getConnection('card_card')
          .count('card1_id')
          .where('card1_id', cardId)
          .or.where('card2_id', cardId)
      )
      .map(res => {
        return res[ 0 ][ 'count(`card1_id`)' ];
      });
  }
}
