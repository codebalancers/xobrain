import './rxjs-operators';

import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../presentation/pages/home/home';
import { ConnectionService } from '../business/control/connection.service';
import * as knex from 'knex';
import * as electron from 'electron';

const electron = (<any>window).require('electron') as electron;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, connectionService: ConnectionService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    (electron.remote.getGlobal('knex') as knex).select('FirstName').from('User').then(rows => console.log(rows));
    // create connection
    // connectionService.getConnection().select('FirstName').from('User').then(rows => console.log(rows));
  }
}
