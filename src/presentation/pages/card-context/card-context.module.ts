import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CardContextPage } from './card-context';

@NgModule({
  declarations: [
    CardContextPage
  ],
  imports: [
    IonicPageModule.forChild(CardContextPage)
  ],
  exports: [
    CardContextPage
  ]
})
export class CardContextPageModule {
}
