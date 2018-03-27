import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { CardEntity } from '../../../business/entity/card.entity';
import { CardService } from '../../../business/boundary/card.service';
import { StringUtils } from '../../../util/string.utils';

@IonicPage()
@Component({
  selector: 'card-context',
  templateUrl: 'card-context.html'
})
export class CardContextPage {
  selectedCards: CardEntity[] = [];
  foundCards: CardEntity[] = [];

  searchValue: string;

  constructor(private cardService: CardService) {
  }

  searchCards(): void {
    if (StringUtils.isBlank(this.searchValue)) {
      this.foundCards = [];
    } else {
      this.cardService.searchCard(this.searchValue).subscribe(cards => this.foundCards = cards);
    }
  }
}
