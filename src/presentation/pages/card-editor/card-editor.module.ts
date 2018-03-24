import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardEditorPage } from './card-editor';

@NgModule({
  declarations: [
    CardEditorPage,
  ],
  imports: [
    IonicPageModule.forChild(CardEditorPage)
  ],
  exports: [
    CardEditorPage
  ]
})
export class CardEditorPageModule {
}
