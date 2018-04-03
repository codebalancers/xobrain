import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Title } from '@angular/platform-browser';
import { EditService } from '../../presentation/services/edit.service';

@Injectable()
export class GlobalAppStateService implements OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(titleService: Title, editService: EditService) {
    editService.cardModifiedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe((modified: boolean) => {
        if (modified === true) {
          titleService.setTitle('* ' + 'Xobrain');
        } else {
          titleService.setTitle('Xobrain');
        }
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
