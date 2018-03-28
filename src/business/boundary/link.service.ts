import { Injectable } from '@angular/core';
import { DatabaseService } from '../control/database.service';
import { Observable } from 'rxjs/Observable';
import { CardEntity } from '../entity/card.entity';
import { CardMapper } from './card.mapper';
import { LangUtils } from '../../util/lang.utils';
import { AssertUtils } from '../../util/assert.utils';

interface LinkInsert {
  card1_id: number,
  card2_id: number,
  modificationDate: Date,
  weight: number
}

@Injectable()
export class LinkService {
  constructor(private dbService: DatabaseService,
              private cardMapper: CardMapper) {
  }

  private sortLinks(cardId1: number, cardId2: number): { cardId1: number, cardId2: number } {
    AssertUtils.isTrue(cardId1 !== cardId2, 'may not link to self');

    let c1 = cardId1;
    let c2 = cardId2;

    if (cardId1 > cardId2) {
      c1 = cardId2;
      c2 = cardId1;
    }

    return { cardId1: c1, cardId2: c2 };
  }

  private createCreateLinkCmd(cardId1: number, cardId2: number, weight: number): LinkInsert {
    const links = this.sortLinks(cardId1, cardId2);

    return { card1_id: links.cardId1, card2_id: links.cardId2, modificationDate: new Date(), weight: weight }
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
          .or.where('card2_id', from.id)
      )
      .flatMap((existingLinks: LinkInsert[]) => {
        /**
         * All existing links from that are not included in the to array have to be deleted.
         */
        const toBeDeleted: LinkInsert[] = existingLinks
          .filter(el => LangUtils.isUndefined(to.find(
            t => t.card.id === el.card2_id || t.card.id === el.card1_id
          )));

        /**
         * All links that do not exist have to be created.
         */
        const toBeCreated: { card: CardEntity, weight: number }[] = to
          .filter(t => LangUtils.isUndefined(existingLinks.find(
            el => t.card.id === el.card2_id || t.card.id === el.card1_id
          )));

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

  private deleteLinks(fromId: number, toBeDeleted: LinkInsert[]): Observable<void> {
    const toBeDeletedLeft: number[] = toBeDeleted.filter(t => t.card2_id === fromId).map(t => t.card1_id);
    const toBeDeletedRight: number[] = toBeDeleted.filter(t => t.card1_id === fromId).map(t => t.card2_id);

    return Observable
      .fromPromise(
        this.dbService.getConnection('card_card')
          .where('card1_id', fromId).and.whereIn('card2_id', toBeDeletedRight)
          .del()
      )
      .flatMap(() => {
        return Observable
          .fromPromise(
            this.dbService.getConnection('card_card')
              .where('card2_id', fromId).and.whereIn('card1_id', toBeDeletedLeft)
              .del()
          )
      });
  }

  private createLinks(fromId: number, toBeCreated: { card: CardEntity; weight: number }[]): Observable<void> {
    const data = toBeCreated.map(to => this.createCreateLinkCmd(fromId, to.card.id, to.weight));

    return Observable.fromPromise(
      this.dbService
        .getConnection('card_card')
        .insert(data)
    );
  }

  public getLinks(cardId: number): Observable<CardEntity[]> {
    /*
    The following Knex statement did not work in conjuction with typescript, this
    is why I ended up with a full raw query.

    .select('*').from('card')
        .join('card_card', function () {
          this.on(function () {
            this.on('card_card.card1_id', '=', cardId).andOn('card_card.card2_id', '=', 'card.id');
            this.orOn('card_card.card2_id', '=', cardId) //.andOn('card_card.card1_id', '=', 'card.id');
          })
        })
     */

    return Observable
      .fromPromise(
        this.dbService
          .getConnection()
          .raw(
            'SELECT * FROM card c, card_card cc ' +
            'WHERE (cc.card1_id = ? AND cc.card2_id = c.id) OR (cc.card2_id = ? AND cc.card1_id = c.id)',
            [ cardId, cardId ]
          )
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
