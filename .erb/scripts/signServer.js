const { exec } = require('child_process');
require('dotenv').config();

exports.default = function signServer() {
  if (process.platform !== 'win32') {
    console.info('Server signing is only available on Windows');
    return;
  }

  const { CSC_LINK, CSC_KEY_PASSWORD } = process.env;

  if (!CSC_LINK || !CSC_KEY_PASSWORD) {
    console.info('No configuration found for sign');
    return;
  }

  const serverPath = `${process.cwd()}/server/localmusicmanager.exe`;
  const command = `signtool sign /f ${CSC_LINK} /p ${CSC_KEY_PASSWORD} /fd SHA256 "${serverPath}"`;

  exec(command, (error) => {
    if (error) {
      console.error('Error signing server application -> ', error);
    } else {
      console.info('Server application signed successfully');
    }
  });
};
