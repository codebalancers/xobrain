import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { CardService } from '../../../business/boundary/card.service';
import { EditService } from '../../services/edit.service';
import { CardEntity } from '../../../business/entity/card.entity';
import { Subject } from 'rxjs/Subject';

@IonicPage()
@Component({
  selector: 'card-view',
  templateUrl: 'card-view.html'
})
export class CardViewPage {
  private componentDestroyed$: Subject<void> = new Subject<void>();
  card: CardEntity;

  constructor(editService: EditService, private cardService: CardService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe(card => this.card = card);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
