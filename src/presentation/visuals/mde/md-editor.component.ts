import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as SimpleMDE from 'simplemde';

@Component({
  selector: 'md-editor',
  template: '<textarea  #simplemde></textarea>',
})
export class MdEditorComponent implements AfterViewInit {
  @Input() viewMode = false;

  @Input() model: string;
  @Output() modelChange = new EventEmitter<string>();

  @ViewChild('simplemde') textarea: ElementRef;

  private editor: SimpleMDE;

  ngAfterViewInit() {
    if (this.viewMode) {
      this.editor = new SimpleMDE({
        element: this.textarea.nativeElement,
        toolbar: false,
        status: false
      });

      (this.editor as any).togglePreview();
    } else {
      this.editor = new SimpleMDE({
        element: this.textarea.nativeElement,
        spellChecker: false,
        // forceSync: true,
        showIcons: [ 'code' ],
        hideIcons: [ 'preview', 'side-by-side', 'fullscreen', 'guide', 'image', 'table' ]
      });
    }

    this.editor.codemirror.on('change', () => {
      this.modelChange.emit(this.editor.value())
    });

    this.editor.value(this.model);
  }
}
