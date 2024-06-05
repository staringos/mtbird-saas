// check-install.js
const { exec } = require('child_process');
require('dotenv').config();

const isInstall = process.env.NEXT_PUBLIC_IS_INSTALL === 'true';

const commandToRun = isInstall ? 'xxx命令' : 'yyy命令';

exec(commandToRun, (error, stdout, stderr) => {
  if (error) {
    console.error(`执行命令时出错: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  console.log(`stdout: ${stdout}`);
});
