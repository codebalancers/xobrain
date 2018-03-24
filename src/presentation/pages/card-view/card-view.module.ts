import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardViewPage } from './card-view';
import { MdeModule } from '../../visuals/mde/mde.module';

@NgModule({
  declarations: [
    CardViewPage
  ],
  imports: [
    IonicPageModule.forChild(CardViewPage), MdeModule
  ],
  exports: [
    CardViewPage
  ]
})
export class CardViewPageModule {
}
