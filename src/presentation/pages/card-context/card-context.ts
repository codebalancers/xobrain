import { Component, OnDestroy } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { CardEntity } from '../../../business/entity/card.entity';
import { CardService } from '../../../business/boundary/card.service';
import { StringUtils } from '../../../util/string.utils';
import { Subject } from 'rxjs/Subject';
import { EditService } from '../../services/edit.service';
import { ArrayUtils } from '../../../util/array.utils';

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

  constructor(editService: EditService, private cardService: CardService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe(card => this.card = card);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  searchCards(): void {
    if (StringUtils.isBlank(this.searchValue)) {
      this.foundCards = [];
    } else {
      this.cardService.searchCard(this.searchValue).subscribe(cards => this.foundCards = cards);
    }
  }

  addLink(card: CardEntity): void {
    this.card.links.push(card);
  }

  removeLink(card: CardEntity): void {
    ArrayUtils.removeElement(this.card.links, card);
  }
}
