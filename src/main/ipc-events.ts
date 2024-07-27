/* eslint-disable global-require */
import { app, ipcMain, dialog, BrowserWindow, shell } from 'electron'; // deconstructing assignment
import log from 'electron-log';
import fs from 'fs';

const getPathToSave = () => {
  const appDataPath = app.getAppPath();
  if (appDataPath.includes('app.asar')) {
    return appDataPath.replace('app.asar', '');
  }
  return appDataPath;
};

const getLocalFile = (filename: string) => {
  const appDataPath = getPathToSave();
  const dir = `${appDataPath}/data`;
  const completePath = `${dir}/${filename}.json`;

  if (!fs.existsSync(completePath)) {
    return null;
  }

  const decoder = new TextDecoder('utf-8');
  const bufferData = fs.readFileSync(completePath);
  return decoder.decode(bufferData);
};

/**
 * Electron IPC events
 */
const setIpcEvents = (mainWindow: BrowserWindow | null) => {
  ipcMain.on('select-folder', async (event) => {
    if (mainWindow) {
      const dir = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
      });

      if (dir.filePaths.length) {
        const directory = dir.filePaths[0];
        const results = fs.readdirSync(directory);
        event.reply('select-folder', { directory, files: results.length });
      } else {
        event.reply('select-folder', null);
      }
    }
  });

  ipcMain.on('open-web', async (event, url: string) => {
    require('electron').shell.openExternal(url);
  });

  ipcMain.on('show-error', async (event, message: string) => {
    dialog.showErrorBox('Error', message);
    mainWindow?.close();
  });

  ipcMain.on('send-log', async (event, ...params: any[]) => {
    log.log('Log from render -> ', ...params);
  });

  ipcMain.on(
    'save-file',
    async (event, params: { name: string; data: string; append: boolean }) => {
      const appDataPath = getPathToSave();
      const dir = `${appDataPath}/data`;

      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir);
        } catch (error) {
          log.error(`Error creating directory ${dir}`);
        }
      }

      const completePath = `${dir}/${params.name}.json`;
      let dataFile = params.data;

      if (params.append) {
        const fileData = getLocalFile(params.name);
        if (fileData) {
          try {
            const processedFiles = JSON.parse(fileData);
            const newDataFile = JSON.parse(dataFile);
            dataFile = JSON.stringify([...processedFiles, ...newDataFile]);
            // eslint-disable-next-line no-empty
          } catch (error) {
            log.error('Error parsing data for save');
          }
        }
      }

      try {
        if (!fs.existsSync(completePath)) {
          fs.writeFileSync(completePath, dataFile, {
            encoding: 'utf8',
            flag: 'wx',
          });
        } else {
          fs.writeFileSync(completePath, dataFile, { encoding: 'utf8' });
        }
      } catch (error) {
        log.error(`Error creating file -> ${completePath}`);
      }

      event.reply('saved-file', completePath);
    },
  );

  ipcMain.on('get-file', async (event, params: string) => {
    const data = getLocalFile(params);
    event.reply('file-obtained', {
      fileName: params,
      data,
    });
  });

  ipcMain.on('search-local', (event, params: string) => {
    if (fs.existsSync(params)) {
      shell.showItemInFolder(params);
    }
  });
};

export default setIpcEvents;
