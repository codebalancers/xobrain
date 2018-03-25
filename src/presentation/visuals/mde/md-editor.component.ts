import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as SimpleMDE from 'simplemde';
import { LangUtils } from '../../../util/lang.utils';

@Component({
  selector: 'md-editor',
  template: '<textarea  #simplemde></textarea>',
})
export class MdEditorComponent implements AfterViewInit {
  private _model: string;

  @Input() set model(val: string) {
    this._model = val;

    if (LangUtils.isDefined(this.editor)) {
      this.editor.value(val);
    }
  }

  @Output() modelChange = new EventEmitter<string>();

  @ViewChild('simplemde') textarea: ElementRef;

  private editor: SimpleMDE;

  ngAfterViewInit() {
    this.editor = new SimpleMDE({
      element: this.textarea.nativeElement,
      spellChecker: false,
      // forceSync: true,
      showIcons: ['code'],
      hideIcons: ['preview', 'side-by-side', 'fullscreen', 'guide', 'image', 'table']
    });

    this.editor.codemirror.on('change', () => {
      this._model = this.editor.value();
      this.modelChange.emit(this.editor.value());
    });

    this.editor.value(this._model);
  }
}
