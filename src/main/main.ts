/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, dialog } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import { execSync, spawn } from 'child_process';
import { resolveHtmlPath } from './util';
import setIpcEvents from './ipc-events';

const backendProccessName = 'localmusicmanager.exe';

// Register our application to handle all "local-music-manager://" protocols.
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('local-music-manager', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('local-music-manager');
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    maximizable: true,
    icon: getAssetPath('icon.ico'),
    title: 'Local Music Manager',
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  mainWindow.removeMenu();

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.maximize();
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (e) => {
    const choice = dialog.showMessageBoxSync(mainWindow!, {
      type: 'question',
      buttons: ['Si', 'No'],
      title: 'Atención',
      message: '¿Cerrar la aplicación?',
    });

    if (choice === 1) {
      e.preventDefault();
    }
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  setIpcEvents(mainWindow);
};

const executeApp = (fileName: string): void => {
  const exe = spawn('cmd.exe', ['/c', fileName]);

  if (isDebug) {
    exe.stdout.on('data', (data: any) => {
      log.info(`App stdout -> ${data.toString()}`);
    });

    exe.stdin.on('data', (data: any) => {
      log.info(`App stdin -> ${data.toString()}`);
    });

    exe.stderr.on('data', (data: any) => {
      log.info(`App stderr -> ${data.toString()}`);
    });
  }

  exe.on('error', (e) => {
    log.error('App execution error -> ');
    log.error(e);

    dialog.showErrorBox('Error', 'Error starting application');
    app.quit();
  });

  exe.on('exit', (code: number | null) => {
    log.warn(`Child exited with code ${code}`);
  });

  exe.on('disconnect', (code: string | null) => {
    log.warn(`Child disconnected with code ${code}`);
  });
};

const destroyBackendApp = () => {
  try {
    execSync(`taskkill /f /t /im ${backendProccessName}`);
  } catch (error) {
    log.info('Error closing server app');
  }
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  destroyBackendApp();
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (err) => {
  log.error('uncaughtException ->');
  log.error(err);
  destroyBackendApp();
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // Prevent opening multiple instances of the app
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }

    // the commandLine is array of strings in which last element is deep link url
    const deepLinkUrl = commandLine.pop();
    mainWindow?.webContents.send('auth-response', deepLinkUrl);
  });

  app
    .whenReady()
    .then(() => {
      let backendApp = path.join(
        process.cwd(),
        `server/${backendProccessName}`,
      );

      if (app.isPackaged) {
        backendApp = path.join(
          process.resourcesPath,
          `server/${backendProccessName}`,
        );
      }

      if (!fs.existsSync(backendApp) && !isDebug) {
        dialog.showErrorBox('Error', 'Error starting application');
        app.quit();

        throw new Error('Backend file not found');
      } else {
        if (isDebug) {
          destroyBackendApp();
        }

        if (fs.existsSync(backendApp)) {
          log.info('Starting server app...');
          executeApp(backendApp);
          log.info('Server app started');
        }

        createWindow();
        app.on('activate', () => {
          // On macOS it's common to re-create a window in the app when the
          // dock icon is clicked and there are no other windows open.
          if (mainWindow === null) createWindow();
        });
      }
    })
    .catch(console.log);
}
