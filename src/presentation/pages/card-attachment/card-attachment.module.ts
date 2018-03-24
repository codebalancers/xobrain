import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardAttachmentPage } from './card-attachment';

@NgModule({
  declarations: [
    CardAttachmentPage
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
