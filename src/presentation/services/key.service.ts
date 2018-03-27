import { Injectable, OnDestroy } from '@angular/core';
import { KeyEvent } from './key-event';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class KeyService implements OnDestroy {
  private _keyEventSubject = new Subject<KeyEvent>();
  public readonly keyEventSubject$ = this._keyEventSubject.asObservable();

  ngOnDestroy(): void {
    this._keyEventSubject.complete();
  }

  public handleKeyEvent(key: KeyEvent) {
    this._keyEventSubject.next(key);
  }
}
