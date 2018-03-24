import { Injectable } from '@angular/core';
import { CardEntity } from '../entity/card.entity';
import { Observable } from 'rxjs/Observable';
import { DatabaseService } from '../control/database.service';

@Injectable()
export class CardService {

  constructor(private dbService: DatabaseService) {
  }

  public getCard(id: number): Observable<CardEntity> {
    const p = this.dbService
      .getConnection()
      .select('title')
      .from('card');

    return Observable.fromPromise(p);
  }
}
