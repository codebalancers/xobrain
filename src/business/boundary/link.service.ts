import { Injectable } from '@angular/core';
import { DatabaseService } from '../control/database.service';
import { Observable } from 'rxjs/Observable';
import { CardEntity } from '../entity/card.entity';
import { CardMapper } from './card.mapper';
import { LangUtils } from '../../util/lang.utils';


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

  /**
   * Store/update the specified links for the specified card.
   *
   * @param {CardEntity} from
   * @param {{}} to weighted links
   * @return {Observable<void>}
   */
  public updateLinks(from: CardEntity, to: { card: CardEntity, weight: number }[]): Observable<void> {
    return Observable
      .fromPromise(
        this.dbService
          .getConnection('card_card')
          .where('card1_id', from.id)
      )
      .flatMap((existingLinks: any[]) => {
        /**
         * All existing links from that are not included in the to array have to be deleted.
         */
        const toBeDeleted: number[] = existingLinks
          .filter(el => LangUtils.isUndefined(to.find(t => t.card.id === el.card2_id)))
          .map(el => el.card2_id);

        /**
         * All links that do not exist, have to be created.
         */
        const toBeCreated: { card: CardEntity, weight: number }[] = to
          .filter(t => LangUtils.isUndefined(existingLinks.find(el => t.card.id === el.card2_id)));

        const os: Observable<void>[] = [];

        if (toBeDeleted.length > 0) {
          os.push(this.deleteLinks(from.id, toBeDeleted));
        }

        if (toBeCreated.length > 0) {
          os.push(this.createLinks(from.id, toBeCreated));
        }

        if (os.length > 0) {
          return Observable.forkJoin(os).map(() => null);
        } else {
          return Observable.of(null);
        }
      });
  }

  private deleteLinks(fromId: number, toBeDeleted: number[]): Observable<void> {
    return Observable
      .fromPromise(
        this.dbService
          .getConnection('card_card')
          .where('card1_id', fromId)
          .and.whereIn('card2_id', toBeDeleted)
          .del()
      );
  }

  private createLinks(fromId: number, toBeCreated: { card: CardEntity; weight: number }[]): Observable<void> {
    const data = toBeCreated.map(entry => {
      return {
        card1_id: fromId,
        card2_id: entry.card.id,
        modificationDate: new Date(),
        weight: entry.weight
      };
    });

    return Observable.fromPromise(
      this.dbService
        .getConnection('card_card')
        .insert(data)
    );
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
