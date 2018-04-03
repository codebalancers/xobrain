import { Component, OnDestroy } from '@angular/core';
import { EditService } from '../../services/edit.service';
import { CardEntity } from '../../../business/entity/card.entity';
import { Subject } from 'rxjs/Subject';
import { XobrainService } from '../../../business/boundary/xobrain.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();

  card: CardEntity;

  constructor(
    private xobrainService: XobrainService,
    editService: EditService,
  ) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((card: CardEntity) => {
        this.card = card;
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  saveCard(): void {
    this.xobrainService.saveCard();
  }

  branchCard(): void {
    this.xobrainService.branchCard(this.card);
  }

  addNewCard(): void {
    this.xobrainService.addNewCard();
  }

  public deleteCard(): void {
    this.xobrainService.deleteCard();
  }
}
