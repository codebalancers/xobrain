import { Injectable } from '@angular/core';
import { CardEntity } from '../entity/card.entity';
import { Observable } from 'rxjs/Observable';
import { DatabaseService } from '../control/database.service';

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
    // TODO
    console.log('save', card)
  }

  public getInitialCard(): Observable<CardEntity> {
    // TODO
    const c = new CardEntity();
    c.title = 'te ti';
    c.content = '# hello';
    return Observable.of(c);
  }
}
