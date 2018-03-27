import { Directive, HostListener } from '@angular/core';
import { KeyService } from '../../presentation/services/key.service';
import { LangUtils } from '../../util/lang.utils';
import { KeyEvent } from '../../presentation/services/key-event';

@Directive({
  selector: '[windowKeyNavListener]'
})
export class WindowKeyNavListenerDirective {

  constructor(private keyService: KeyService) {
  }

  @HostListener('document:keydown', [ '$event' ])
  onKeyDown(evt: KeyboardEvent): void {
    let key: KeyEvent = null;

    if (evt.keyCode === 83 && (evt.ctrlKey || evt.metaKey)) {
      key = KeyEvent.SAVE;
    }

    if (LangUtils.isDefined(key)) {
      this.keyService.handleKeyEvent(key);
      evt.stopPropagation();
    }
  }
}
