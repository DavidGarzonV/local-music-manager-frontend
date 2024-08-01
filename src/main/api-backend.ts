import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { app, dialog } from 'electron';

const backendProccessName = 'localmusicmanager.exe';
const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

export default class ApiBackend {
  private static _backendExe: ChildProcessWithoutNullStreams | undefined;

  static startBackendApp() {
    let pathBackendApp = path.join(
      process.cwd(),
      `server/${backendProccessName}`,
    );

    if (app.isPackaged) {
      pathBackendApp = path.join(
        process.resourcesPath,
        `server/${backendProccessName}`,
      );
    }

    if (!fs.existsSync(pathBackendApp)) {
      if (!isDebug) {
        dialog.showErrorBox('Error', 'Error starting application');
        throw new Error('Server file not found');
      }
    }

    log.info('Starting server app...');

    const backendApp = spawn(pathBackendApp, []);
    if (isDebug) {
      backendApp.stdin.on('data', (data) => {
        log.info(`Server stdin: ${data}`);
      });

      backendApp.stdout.on('data', (data) => {
        log.info(`Server stdout: ${data}`);
      });

      backendApp.stderr.on('data', (data) => {
        log.error(`Server stderr: ${data}`);
      });

      backendApp.on('close', (code) => {
        log.error(`Server app error exited with code ${code}`);
      });
    }

    backendApp.on('error', (err) => {
      log.error('Server app error -> ', err);
    });
    ApiBackend._backendExe = backendApp;
  }

  static destroyBackendApp() {
    if (ApiBackend._backendExe) {
      const killResponse = ApiBackend._backendExe.kill();
      if (!killResponse) {
        log.error('Error closing server app');
      } else {
        ApiBackend._backendExe = undefined;
      }
    }
  }
}
