import { Component, OnDestroy } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { CardEntity } from '../../../business/entity/card.entity';
import { EditService } from '../../services/edit.service';
import { Subject } from 'rxjs/Subject';
import { CardService } from '../../../business/boundary/card.service';

@IonicPage()
@Component({
  selector: 'card-editor',
  templateUrl: 'card-editor.html'
})
export class CardEditorPage implements OnDestroy {
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
