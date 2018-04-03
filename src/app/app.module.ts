import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../presentation/pages/home/home';
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
import { GlobalAppStateService } from '../business/boundary/global-app-state.service';
import { KeyHandlerService } from '../business/boundary/key-handler.service';
import { VisualizationService } from '../business/boundary/visualization.service';
import { XobrainService } from '../business/boundary/xobrain.service';
import { LinkVisualComponent } from '../presentation/visuals/shared/link-visual/link-visual.component';
import { NodeVisualComponent } from '../presentation/visuals/shared/node-visual/node-visual.component';
import { DraggableDirective } from '../presentation/d3/directives/draggable.directive';
import { ZoomableDirective } from '../presentation/d3/directives/zoomable.directive';
import { D3Service } from '../presentation/d3/d3.service';


export function dbInitializer(dbService: DatabaseService): () => Promise<any> {
  return (): Promise<any> => dbService.ensureSchema();
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GraphComponent,
    WindowKeyNavListenerDirective,
    NodeVisualComponent,
    LinkVisualComponent,
    ZoomableDirective,
    DraggableDirective
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
    GlobalAppStateService, KeyHandlerService, VisualizationService, XobrainService,
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
