import { Injectable } from '@angular/core';
import { CardEntity } from '../entity/card.entity';
import { Observable } from 'rxjs/Observable';
import { DatabaseService } from '../control/database.service';
import { ArrayUtils } from '../../util/array.utils';
import { LangUtils } from '../../util/lang.utils';

@Injectable()
export class CardService {

  constructor(private dbService: DatabaseService) {
  }

  public getCard(id: number): Observable<CardEntity> {
    // TODO
    const p = this.dbService
      .getConnection()
      .select('title')
      .from('card');

    return Observable.fromPromise(p);
  }

  public save(card: CardEntity): void {
    console.log('save', card);

    if (card.id) {
      this.dbService
        .getConnection()('card')
        .where('id', '=', card.id)
        .update({ title: card.title, content: card.content })
        .then(d => console.log(d));
      // TODO: update all links

    } else {
      const qb = this.dbService
        .getConnection()('card')
        .insert({ title: card.title, content: card.content, creationDate: new Date() });
      qb.then(d => console.log(d));
      // TODO: update all links
    }

  }

  public getInitialCard(): Observable<CardEntity> {
    const p = this.dbService
      .getConnection()
      .from('card').limit(1);

    return Observable.fromPromise(p)
      .map((res: any[]) => {
        const card = ArrayUtils.getFirstElement(res);

        if (LangUtils.isUndefined(card)) {
          const c = new CardEntity();
          c.title = 'My first card';
          c.content = 'Write something...';
          return c;
        }

        const cardEntity = new CardEntity();
        cardEntity.id = card.id;
        cardEntity.title = card.title;
        cardEntity.content = card.content;

        // TODO fill links
        return cardEntity;
      })
  }
}
