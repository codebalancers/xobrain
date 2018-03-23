import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { join as pJoin } from 'path';
import { format as urlFormat } from 'url';

let mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({});

  mainWindow.loadURL(urlFormat({
    pathname: pJoin(__dirname, 'dist/index.html'),
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
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
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
