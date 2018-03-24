import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as SimpleMDE from 'simplemde';

// declare var SimpleMDE: any;

@Component({
  selector: 'md-editor',
  template: '<textarea #simplemde>{{text}}</textarea>',
})
export class MdEditorComponent implements AfterViewInit {
  @Input() viewMode = false;

  @ViewChild('simplemde') textarea: ElementRef;

  @Input() text: string;

  ngAfterViewInit() {
    if (this.viewMode) {
      const editor = new SimpleMDE({
        element: this.textarea.nativeElement,
        toolbar: false,
        status: false
      });

      (editor as any).togglePreview();
      return editor;
    } else {
      const editor = new SimpleMDE({
        element: this.textarea.nativeElement,
        spellChecker: false,
        showIcons: [ 'code' ],
        hideIcons: [ 'preview', 'side-by-side', 'fullscreen', 'guide', 'image', 'table' ]
      });
      return editor;
    }
  }
}
