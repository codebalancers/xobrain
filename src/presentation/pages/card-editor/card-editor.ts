import { Component, OnDestroy } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { CardEntity } from '../../../business/entity/card.entity';
import { EditService } from '../../services/edit.service';
import { Subject } from 'rxjs/Subject';

@IonicPage()
@Component({
  selector: 'card-editor',
  templateUrl: 'card-editor.html'
})
export class CardEditorPage implements OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();
  card: CardEntity = new CardEntity();

  constructor(private editService: EditService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe(card => {
        return this.card = card;
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  modified() {
    this.editService.emitModified(this.card.modified);
  }
}
