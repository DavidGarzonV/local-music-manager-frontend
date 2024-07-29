import { execSync, spawn } from 'child_process';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { app, dialog } from 'electron';

const backendProccessName = 'localmusicmanager.exe';

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

export const destroyBackendApp = () => {
  try {
    execSync(`taskkill /f /t /im ${backendProccessName}`);
  } catch (error) {
    log.info('Error closing server app, the process may not exist or is already closed');
  }
};

export const executeApp = async (fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
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
      reject(e)
    });
  
    exe.on('exit', (code: number | null) => {
      log.warn(`Child exited with code ${code}`);
    });
  
    exe.on('disconnect', (code: string | null) => {
      log.warn(`Child disconnected with code ${code}`);
    });

    resolve()
  })
};

export const startBackendApp = async (): Promise<void> => {
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
	}

	if (fs.existsSync(backendApp)) {
		log.info('Starting server app...');
		await executeApp(backendApp);
		log.info('Server app started');
	}
}