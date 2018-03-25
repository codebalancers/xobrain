import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardViewPage } from './card-view';
import { MdeModule } from '../../visuals/mde/mde.module';
import { MdViewComponent } from './md-view.component';

@NgModule({
  declarations: [
    CardViewPage, MdViewComponent
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
