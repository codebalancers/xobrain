import { Component, Input } from '@angular/core';
import * as marked from 'marked';
import { StringUtils } from '../../../util/string.utils';

@Component({
  selector: 'md-view',
  template: '<span [innerHtml]="_model"></span>'
})
export class MdViewComponent {
  _model: string;

  @Input() set model(val: string) {
    if (StringUtils.isNotBlank(val)) {
      this._model = marked(val, undefined);
    }
  }
}
