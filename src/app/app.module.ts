import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
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
import { DatabaseService } from '../business/control/database.service';
import { ElectronService } from '../business/control/electron.service';
import { EditService } from '../presentation/services/edit.service';
import { GraphService } from '../presentation/services/graph.service';
import { LinkService } from '../business/boundary/link.service';
import { TagService } from '../business/boundary/tag.service';
import { FileService } from '../business/boundary/file.service';
import { CardMapper } from '../business/boundary/card.mapper';
import { KeyService } from '../presentation/services/key.service';
import { WindowKeyNavListenerDirective } from '../business/control/window-key-nav-listener.directive';
import { TooltipsModule } from 'ionic-tooltips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


export function dbInitializer(dbService: DatabaseService): () => Promise<any> {
  return (): Promise<any> => dbService.ensureSchema();
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GraphComponent,
    WindowKeyNavListenerDirective,
    ...SHARED_VISUALS,
    ...D3_DIRECTIVES
  ],
  imports: [
    BrowserModule,
    TooltipsModule,
    BrowserAnimationsModule,
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
    KeyService,
    CardService, CardMapper, LinkService, TagService, FileService, DatabaseService, ElectronService, EditService, GraphService,
    {
      provide: APP_INITIALIZER,
      useFactory: dbInitializer,
      multi: true,
      deps: [ DatabaseService ]
    }
  ]
})
export class AppModule {
}
