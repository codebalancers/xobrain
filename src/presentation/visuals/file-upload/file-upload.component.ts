import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'file-upload',
  template: `
    <div [ngClass]="{ 'dropzone':true, 'noHighlight': !highlight, 'highlight': highlight}">
      <div class="text-wrapper">
        <div class="centered">Drop your file here!</div>
      </div>
    </div>`
})
export class FileUploadComponent {
  highlight = false;

  @HostListener('dragover', [ '$event' ])
  onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    this.highlight = true;
  }

  @HostListener('dragleave', [ '$event' ])
  onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    //do some stuff

    this.highlight = false;

  }

  @HostListener('drop', [ '$event' ])
  onDrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    let files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.highlight = false;
    }
  }

}
