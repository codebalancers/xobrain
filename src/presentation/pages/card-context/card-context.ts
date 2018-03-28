import { Component, OnDestroy } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { CardEntity } from '../../../business/entity/card.entity';
import { CardService } from '../../../business/boundary/card.service';
import { StringUtils } from '../../../util/string.utils';
import { Subject } from 'rxjs/Subject';
import { EditService } from '../../services/edit.service';
import { ArrayUtils } from '../../../util/array.utils';
import { LangUtils } from '../../../util/lang.utils';

@IonicPage()
@Component({
  selector: 'card-context',
  templateUrl: 'card-context.html'
})
export class CardContextPage implements OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();
  card: CardEntity;

  foundCards: CardEntity[] = [];
  searchValue: string;

  constructor(private editService: EditService, private cardService: CardService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe(card => {
        this.card = card;

        // reset search
        this.searchValue = null;
        this.foundCards = [];
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  searchCards(): void {
    if (StringUtils.isBlank(this.searchValue)) {
      this.foundCards = [];
    } else {
      // self links are forbidden => remove the current card from the search result (if included)
      this.cardService.searchCard(this.searchValue)
        .map((cards: CardEntity[]) => cards.filter(c => c.id != this.card.id))
        .subscribe(cards => this.foundCards = cards);
    }
  }

  /**
   * @param {CardEntity} card that is added as link
   */
  addLink(card: CardEntity): void {
    this.card.links.push(card);
    this.card.modified = true;
    this.editService.emitModified(this.card.modified);
  }

  /**
   * @param {CardEntity} card that is removed as link
   */
  removeLink(card: CardEntity): void {
    ArrayUtils.removeElement(this.card.links, card);
    this.card.modified = true;
    this.editService.emitModified(this.card.modified);
  }

  canAddLink(card: CardEntity): boolean {
    return LangUtils.isUndefined(this.card.links.find(l => l.id === card.id));
  }
}
