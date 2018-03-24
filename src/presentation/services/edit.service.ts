import { Injectable, OnDestroy } from '@angular/core';
import { CardEntity } from '../../business/entity/card.entity';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class EditService implements OnDestroy {
  private _cardSelectedSubject = new ReplaySubject<CardEntity>();
  public readonly cardSelectedSubject$ = this._cardSelectedSubject.asObservable();

  ngOnDestroy(): void {
    this._cardSelectedSubject.complete();
  }

  public cardSelected(card: CardEntity): void {
    this._cardSelectedSubject.next(card);
  }
}
