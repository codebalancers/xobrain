import { Injectable, OnDestroy } from '@angular/core';
import { CardEntity } from '../../business/entity/card.entity';
import { CardService } from '../../business/boundary/card.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class EditService implements OnDestroy {
  private _cardSelectedSubject = new BehaviorSubject<CardEntity>(new CardEntity());
  public readonly cardSelectedSubject$ = this._cardSelectedSubject.asObservable();

  private _cardModifiedSubject = new BehaviorSubject<boolean>(false);
  public readonly cardModifiedSubject$ = this._cardModifiedSubject.asObservable();

  constructor(private cardService: CardService) {
  }

  ngOnDestroy(): void {
    this._cardSelectedSubject.complete();
    this._cardModifiedSubject.complete();
  }

  public emitModified(modified: boolean): void {
    // do not emit an event if modified has not changed
    if (this._cardModifiedSubject.getValue() === modified) {
      return;
    }

    this._cardModifiedSubject.next(modified);
  }

  /**
   *
   * @param {CardEntity} card
   * @param {boolean} force force emitting an event even if card id has not changed
   */
  public cardSelected(card: CardEntity, force = false): void {
    // do not emit an event if selection has not changed
    if (force === false && this._cardSelectedSubject.getValue().id == card.id) {
      return;
    }

    this.cardService.updateLinks(card).subscribe(card => this._cardSelectedSubject.next(card));
  }
}
