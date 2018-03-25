import { Component, Input } from '@angular/core';
import * as marked from 'marked';

@Component({
  selector: 'md-view',
  template: '<span [innerHtml]="_model"></span>'
})
export class MdViewComponent {
  _model: string;

  @Input() set model(val: string) {
    this._model = marked(val, undefined);
  }
}
