import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardEditorPage } from './card-editor';
import { MdeModule } from '../../visuals/mde/mde.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CardEditorPage
  ],
  imports: [
    IonicPageModule.forChild(CardEditorPage), MdeModule, FormsModule
  ],
  exports: [
    CardEditorPage
  ]
})
export class CardEditorPageModule {
}
