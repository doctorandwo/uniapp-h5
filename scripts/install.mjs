
import exc from 'child_process';

/**
 * @author laicaijin on 2024-01-15
 * @description 自动化安装项目依赖的脚本
 *
 * @example
 * npm run bootstrap
 */
const prefixShell = 'npm i';

const prefixInstall = 'npm install';

import beforeInstall from '../install.config.js';

function format2shell(info) {
  return `${info.version ? prefixShell : prefixInstall} ${info.name}${info.version ? '@' + info.version + '  --save-exact' : ''} ${info.registry ? `--registry ${info.registry}` : ''}`;
}


const target = [
  ...beforeInstall.map(item => format2shell(item)),
  prefixShell
];

function drawProgressBar(progress, total) {
  const percentage = Math.floor((progress / total) * 100);
  const progressBarWidth = Math.floor(percentage / 2);

  // 使用ANSI转义码清空当前行并重新定位光标到行首
  process.stdout.write('\x1B[2K\x1B[0E');

  process.stdout.write('Progress: [');

  // 输出进度条
  for (let i = 0; i < progressBarWidth; i++) {
    process.stdout.write('=');
  }
  process.stdout.write('>');

  // 输出剩余部分
  for (let i = progressBarWidth + 1; i <= 50; i++) {
    process.stdout.write(' ');
  }

  process.stdout.write(`] ${percentage}%\n`);

  // 结束符号
  if (progress === total) {
    process.stdout.write('\n');
  }
}

// 示例：模拟进度更新
const totalProgress = 100;
let currentProgress = 0;


function doExc(command, callback) {
  return new Promise((resolve) => {
    exc.exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('<error>执行失败，请使用手动安装：', error + '\n');
        return;
      }
      console.log(`<success>执行成功: ${stdout}\n`);
      resolve();
      callback();
      if (stderr) {
        console.error(`<warning>脚本警告: \n${stderr}`);
      }
    });
  });
}

async function run(list) {
  try {
    const percent = Math.floor(100 / list.length) + 1;
    for (let i = 0; i < list.length;) {
      const command = list[i];
      console.log('<start>开始执行：', command);
      await doExc(command, () => {
        currentProgress = currentProgress + percent > 100 ? 100 : currentProgress + percent;
        drawProgressBar(currentProgress, totalProgress);
      });
      i++;
    }
    console.log('<success>全部执行成功！\n');
    return true;
  } catch (e) {
    throw new Error('<error>执行失败，请使用手动安装', e + '\n');
  }
}

async function start() {
  drawProgressBar(0, totalProgress);
  run(target);
}

start();
