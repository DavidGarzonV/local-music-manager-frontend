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

  exec(
    `signtool sign /fd SHA256 /f ${CSC_LINK} /p ${CSC_KEY_PASSWORD} "../../server/localmusicmanager.exe"`,
    (error) => {
      console.error('Error signing server application');
      console.error(error);
    },
  );
};
