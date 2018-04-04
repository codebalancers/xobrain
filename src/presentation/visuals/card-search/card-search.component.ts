import { Component } from '@angular/core';
import { CardService } from '../../../business/boundary/card.service';
import { CardEntity } from '../../../business/entity/card.entity';
import { StringUtils } from '../../../util/string.utils';
import { EditService } from '../../services/edit.service';

@Component({
  selector: 'card-search',
  template: `
    <ion-searchbar [(ngModel)]="searchValue"
                   (ionInput)="searchCards($event)"
                   placeholder="Search cards"></ion-searchbar>

    <div class="result" *ngIf="foundCards.length > 0">
      <ion-list>
        <button ion-item *ngFor="let card of foundCards" (click)="selectCard(card)">
          <ion-icon name="leaf" item-start></ion-icon>
          {{card.title}}
        </button>
      </ion-list>
    </div>
  `
})
export class CardSearchComponent {
  searchValue: string;
  foundCards: CardEntity[] = [];

  constructor(private cardService: CardService, private editService: EditService) {
  }

  searchCards(): void {
    if (StringUtils.isBlank(this.searchValue)) {
      this.reset();
    } else {
      this.cardService
        .searchCard(this.searchValue)
        .subscribe(cards => this.foundCards = cards);
    }
  }

  selectCard(card: CardEntity): void {
    this.editService.cardSelected(card);
    this.reset();
  }

  private reset() {
    this.foundCards = [];
    this.searchValue = null;
  }
}
