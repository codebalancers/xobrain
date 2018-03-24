import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../presentation/pages/home/home';
import { D3_DIRECTIVES } from '../presentation/d3/directives';
import { SHARED_VISUALS } from '../presentation/visuals/shared';
import { D3Service } from '../presentation/d3';
import { GraphComponent } from '../presentation/visuals/graph/graph.component';
import { CardService } from '../business/boundary/card.service';
import { ConnectionService } from '../business/control/connection.service';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GraphComponent,
    ...SHARED_VISUALS,
    ...D3_DIRECTIVES
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    D3Service,
    CardService, ConnectionService
  ]
})
export class AppModule {
}
