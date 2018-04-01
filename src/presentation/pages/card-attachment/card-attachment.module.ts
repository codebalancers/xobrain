import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardAttachmentPage } from './card-attachment';
import { FileUploadComponent } from '../../visuals/file-upload/file-upload.component';

@NgModule({
  declarations: [
    CardAttachmentPage,
    FileUploadComponent
  ],
  imports: [
    IonicPageModule.forChild(CardAttachmentPage)
  ],
  exports: [
    CardAttachmentPage
  ]
})
export class CardAttachmentPageModule {
}
