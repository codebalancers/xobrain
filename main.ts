import { Accelerator, app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { join as pJoin } from 'path';
import { format as urlFormat } from 'url';
import 'reflect-metadata';
import * as knex from 'knex';
import { Config } from 'knex';

global[ 'knex' ] = knex(
  {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite'
    }
  }
);

let mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({});

  mainWindow.loadURL(urlFormat({
    pathname: pJoin(__dirname, 'www/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // close whole app when main window is closed
  mainWindow.on('close', () => app.quit());

  // set up menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

const mainMenuTemplate: MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: (process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q') as Accelerator,
        click() {
          app.quit();
        }
      }
    ]
  }
];

// in mac push empty menu to beginning
if (process.platform === 'darwin') {
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.webContents.toggleDevTools();
        }
      }
    ]
  });
}


class ConnectionService {
  private knex;

  constructor() {
    this.knex = knex(this.exportConfig());
  }

  public getConnection(): knex {
    return this.knex;
  }

  private exportConfig(): Config {
    return {
      client: 'sqlite3',
      connection: {
        filename: './database.sqlite'
      }
    };
  }
}
