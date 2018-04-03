import { Injectable, OnDestroy } from '@angular/core';
import { KeyService } from '../../presentation/services/key.service';
import { KeyEvent } from '../../presentation/services/key-event';
import { Subject } from 'rxjs/Subject';
import { XobrainService } from './xobrain.service';


@Injectable()
export class KeyHandlerService implements OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(keyService: KeyService, xobrainService: XobrainService) {
    keyService.keyEventSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((keyEvent: KeyEvent) => {
        if (keyEvent === KeyEvent.SAVE) {
          xobrainService.saveCard();
        }
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
