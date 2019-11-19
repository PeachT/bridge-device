import { Menu, app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { renderExcel } from 'ejsexcel';

const exec = require('child_process').exec;
const ping = require('ping');

// 注意这个autoUpdater不是electron中的autoUpdater
// const { autoUpdater } = require('electron-updater');
import { autoUpdater } from 'electron-updater';
import { PLCTcpModbus } from './PLCTcpModbus';
import { SocketTcp } from './socketTcp';
import { ConnectionStr } from './Modbus/modle';



// 运行环境判断
const args = process.argv.slice(1);
console.log(args);

const dev = args.some((val) => val === '--dev');

// tslint:disable-next-line:no-string-literal
global['heartbeatRate'] = 1000;

console.log(dev);
// 设置调试环境和运行环境 的渲染进程路径
const winURL = dev ? 'http://localhost:4200' :
  `file://${__dirname}/dist/index.html`;

let win: BrowserWindow;

/** 创建窗口 */
function createWindow() {
  /*隐藏electron创听的菜单栏*/
  Menu.setApplicationMenu(null);
  win = new BrowserWindow(
    {
      show: false,
      backgroundColor: '#2e2c29',
      width: 1920, height: 1080,
      // fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        backgroundThrottling: false
      }
    }
  );
  win.maximize();
  win.loadURL(winURL);

  if (dev) {
    win.webContents.openDevTools();
  }

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('__static');
  if (win === null) {
    createWindow();
    win.once('ready-to-show', () => {
      win.show()
    })
  }
});


/** tcp链接集合 */
const tcpList: {[prop: string]: SocketTcp} = {};

/** 链接tcp */
ipcMain.on('LinkTCP', (e, data: ConnectionStr) => {
  if (tcpList[data.uid]) {
    e.sender.send(`${data.uid}connect`, {link: true, state: 'success', msg: `链接中`});
  } else {
    tcpList[data.uid] = new SocketTcp(data, win);
  }
});
/** 取消tcp */
ipcMain.on('CancelLink', async (e, name) => {
  await tcpList[name].cancelLink();
  e.sender.send(`${name}CancelLink`);
  tcpList[name] = null;
});


// 更新监听
ipcMain.on('update', (e, arg) => {
  console.log('update');
  // 执行自动更新检查
  autoUpdater.checkForUpdates();
});
// 下载监听
ipcMain.on('downApp', (e, arg) => {
  autoUpdater.downloadUpdate();
});

// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle() {
  const os = require('os');
  autoUpdater.autoDownload = false;
  // http://localhost:5500/up/ 更新文件所在服务器地址
  autoUpdater.setFeedURL('http://47.107.59.12/upDateApp/');
  autoUpdater.on('error', (info) => {
    sendUpdateMessage({msg: 'error', info});
  });
  autoUpdater.on('checking-for-update', (info) => {
    sendUpdateMessage({msg: 'checking', r: info});
  });
  autoUpdater.on('update-available', (info) => {
    sendUpdateMessage({msg: 'updateAva', info});
  });
  autoUpdater.on('update-not-available', (info) => {
    sendUpdateMessage({msg: 'updateNotAva', info});
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', (progressObj) => {
    console.log('down...');

    win.webContents.send('downloadProgress', progressObj);
  });
  // 下载完成事件
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) => {
    ipcMain.on('isUpdateNow', (e, arg) => {
      // 关闭程序安装新的软件
      autoUpdater.quitAndInstall();
    });
    win.webContents.send('isUpdateNow');
  });
}
/** 监听事件 */
updateHandle();

// 通过main进程发送事件给renderer进程，提示更新信息
// win = new BrowserWindow()
function sendUpdateMessage(text) {
  win.webContents.send('update-message', text);
}

/**
 * 发送数据到UI
 *
 * @private
 * @param {string} channel 发送名称
 * @param {*} message 发送数据
 * @memberof ModbusTCP
 */
function IPCSend(channel: string, message: any) {
  win.webContents.send(channel, message);
}

///////////////////////////////////////////////////////////// 导出表格
/** 获取模板 */
ipcMain.on('get-template', async (event, data) => {
  moundUSB('*.zltmp', 'get-template-back');
});
/** 获取U盘 */
ipcMain.on('get-upan', async (event, data) => {
  moundUSB('', 'get-upan-back', true);
});
/** 获取U盘 */
ipcMain.on('get-dbfile', async (event, data) => {
  moundUSB('*.db', 'get-dbfile-back');
});

// 导出表格
ipcMain.on('derivedExcel', async (event, data) => {
  const readFileAsync = util.promisify(fs.readFile);
  const writeFileAsync = util.promisify(fs.writeFile);
  const outPath = data.outPath;
  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath);
  }

  const filePath = data.templatePath;
  const savePath = `${outPath}/${data.data.bridgeInfo.name}${data.fileName}记录.xlsx`;
  try {
    console.log(filePath, savePath, outPath, data.outPath);
    const exlBuf = await readFileAsync(filePath);
    // 用数据源(对象)data渲染Excel模板
    const exlBuf2 = await renderExcel(exlBuf, data.data);
    await writeFileAsync(savePath, exlBuf2);
    event.sender.send(data.channel, { success: true, filePath, savePath });
  } catch (error) {
    event.sender.send(data.channel, { success: false, filePath, savePath, error });
  }
});
// 导出数据
ipcMain.on('dateEX', async (event, data) => {
  try {
    console.log(data.outPath);
    fs.writeFile(data.outPath, data.data, (err) => {
      if (err) {
        console.log('写入错误');
        event.sender.send(data.channel, { success: false, mgs: '写入错误', error: err });
      } else {
        console.log('写文件操作成功');
        event.sender.send(data.channel, { success: true, mgs: '写入完成' });
      }
    });
    // const exlBuf = await readFileAsync(filePath);
    // // 用数据源(对象)data渲染Excel模板
    // const exlBuf2 = await ejsexcel.renderExcel(exlBuf, data.data);
    // await writeFileAsync(savePath, exlBuf2);
    // event.sender.send(data.channel, { success: true, filePath, savePath });
  } catch (error) {
    // event.sender.send(data.channel, { success: false, filePath, savePath, error });
  }
});
// 导入数据
ipcMain.on('indb', async (event, data) => {
  console.log(data);
  try {
    fs.readFile(data.inPath, 'utf8', (err, fileData) => {
      console.log(err, fileData);
      if (err) {
        event.sender.send(data.channel, { success: false, mgs: '读取文件错误', error: err });
      } else {
        if (fileData.length > 0) {
          event.sender.send(data.channel, { success: true, data: fileData });
        } else {
          event.sender.send(data.channel, { success: false, mgs: '没有数据' });
        }
      }
    });
  } catch (error) {
    event.sender.send(data.channel, { success: false, mgs: '读取文件错误' });
    // event.sender.send(data.channel, { success: false, filePath, savePath, error });
  }
});
// 导入HMIcsv数据
ipcMain.on('inHMIcsv', async (event, data) => {
  console.log(data);
  try {
    fs.readFile(data.inPath, 'utf-16le', (err, buffer) => {
      const arr = buffer.toString().replace(/\r\n/g, '').replace(/\x20|\0/g, '').split('\t');
      if (err) {
        event.sender.send(data.channel, { success: false, mgs: '读取文件错误', error: err });
      } else {
        // const arrData = [];
        if (arr.length > 0) {
          // // tslint:disable-next-line:prefer-for-of
          // for (let index = 16; index < arr.length; index += 16 ) {
          //   const a: any = {};
          //   const name = `${arr[index]}${arr[index + 1]}`;
          //   if (!name || name === 'undefined') {
          //     break;
          //   } else {
          //     a.name = arr[index+2];
          //     a.steadyMpa = arr[index+3];
          //     a.proportion = arr[index+4];
          //     a.setMpa = arr[index+5];
          //     a.steadyTime = arr[index+6];
          //     const date = `${arr[index+7]}-${arr[index+8]}-${arr[index+9]}`;

          //     a.startDate = new Date(`${date} ${arr[index+10]}:${arr[index+11]}:${arr[index+12]}`);
          //     a.endDate = new Date(`${date} ${arr[index+13]}:${arr[index+14]}:${arr[index+15]}`);
          //   }
          //   if (arrData.length > 0) {
          //     // tslint:disable-next-line:prefer-for-of
          //     for (let i = 0; i < arrData.length; i++) {
          //       if (arrData[i].name === name) {
          //         arrData[i].groups.push(a);
          //       } else {
          //         arrData.push({name, id: index, groups: [a]});
          //       }
          //     }
          //   } else {
          //     arrData.push({name, id: index, groups: [a]});
          //   }
          // }
          event.sender.send(data.channel, { success: true, data: arr});
        } else {
          event.sender.send(data.channel, { success: false, mgs: '没有数据' });
        }
      }
    })
  } catch (error) {
    event.sender.send(data.channel, { success: false, mgs: '读取文件错误' });
    // event.sender.send(data.channel, { success: false, filePath, savePath, error });
  }
});

// 选择模板与导出路径
ipcMain.on('selectTemplate', (event, data) => {
  let outPath = '';
  let templatePath = '';
  if (data) {
    try {
      outPath = dialog.showOpenDialog(win, { properties: ['openDirectory'] })[0];
      templatePath = dialog.showOpenDialog(win, {
        properties: ['openFile'], filters: [
          { name: 'template', extensions: ['xlsx'] },
        ]
      })[0];
      console.log(outPath, templatePath);
    } catch (error) {
    }
  } else {
    try {
    } catch (error) {
    }
  }
  event.sender.send(data.channel, { msg: `获取成功`, outPath, templatePath, data });
});


/** 键盘控制 */

/**
 * *键盘
 */
// let pid = null;
ipcMain.on('showKeyboard', (event, data) => {
  console.log('showKeyboard', data);
  const ps = exec(`
   gsettings set org.onboard.window.landscape x ${data.x} &
   gsettings set org.onboard.window.landscape y ${data.y} &
   gsettings set org.onboard.window.landscape width ${data.w} &
   gsettings set org.onboard.window.landscape height ${data.h} &
   gsettings set org.onboard layout ${data.type} &
   onboard &`,
    { async: true }, (code, stdout, stderr) => {
      console.log('Exit code:', code);
      console.log('Program output:', stdout);
      console.log('Program stderr:', stderr);
      ps.kill();
    });
});

ipcMain.on('offKdNumber', (event, data) => {
  console.log('onKdNumber');

});
/** 重启|关机 */
ipcMain.on('power', (event, data) => {
  console.log('power');
  if (data) {
    exec(`poweroff`);
  } else {
    exec(`reboot`);
  }
});

/** 获取更新文件 */
ipcMain.on('select-file', (event, data) => {
  moundUSB('*.db', 'select-file-out');
});
/** 本地文件更新 */
ipcMain.on('local-update', (event, data) => {
  console.log('local-update');
  const upps = exec(`sudo dpkg -i ${data}`, { async: true }, (code, stdout, stderr) => {
    console.log('Exit code:', code);
    console.log('Program output:', stdout);
    console.log('Program stderr:', stderr);
    event.sender.send('onUpdate', { stdout, stderr });
    upps.kill();
  });
});
/** 卸载U盘 */
ipcMain.on('usb-umount', (event, data) => {
  const upps = exec(`sudo umount /dev/sd[b-z]*`, { async: true }, (code, stdout, stderr) => {
    console.log('Exit code:', code);
    console.log('Program output:', stdout);
    console.log('Program stderr:', stderr);
    let state = false;
    if (stderr.indexOf('busy') !== -1) {
      state = true;
    }
    event.sender.send('usb-umount', state);
    upps.kill();
  });
});
/** 输入linux-shell命令 */
ipcMain.on('test', (event, data) => {
  const upps = exec(`${data.data}`, { async: true }, (code, stdout, stderr) => {
    console.log('Exit code:', code);
    console.log('Program output:', stdout);
    console.log('Program stderr:', stderr);
    event.sender.send(data.out, { stdout, stderr });
    upps.kill();
  });
});

/** 打开调试面板 */
ipcMain.on('openDevTools', () => {
  win.webContents.openDevTools();
});

/** 挂载U盘 */
function moundUSB(filterName, sendName, state = false) {
  console.log('select-file');
  let updatepath = '/media';
  // 获取用户名
  exec(`whoami`, { async: true }, (code, stdout, stderr) => {
    updatepath = `/media/${stdout.split('\n')[0]}`;
  });
  // tslint:disable-next-line: no-unused-expression
  // -o iocharset=utf8
  // mount -t vfat -o iocharset=utf8
  // sudo mount -o rw,nosuid,nodev,relatime,uid=1000,gid=1000,fmask=0022,dmask=0022,codepage=437,iocharset=iso8859-1,shortname=mixed,showexec,utf8,flush,errors=remount-ro,uhelper=udisks2 /dev/sdc1 /media/peach/
  const usb = exec(`ls /dev/ | grep "sd[b-z]"`, { async: true }, (code, stdout, stderr) => {
    usb.kill();
    console.log('usb', stdout);
    if (stdout) {
      const up = exec(`sudo mount -o rw,nosuid,nodev,relatime,uid=1000,utf8 /dev/sd[b-z]* ${updatepath}`,
        { async: true }, (code, stdout, stderr) => {
          up.kill();
          console.log('mount code:', code);
          console.log('mount output:', stdout);
          console.log('mount stderr:', stderr);
          if (stderr.indexOf('不存在') !== -1) {
            win.webContents.send(sendName, { stdout, stderr: '加载U盘失败！' });
          } else {
            if (state) {
              win.webContents.send(sendName, { stdout: updatepath });
            } else {
              const upps = exec(`find ${updatepath} -name ${filterName}`, { async: true }, (code, stdout, stderr) => {
                stdout = stdout.split('\n').filter(t => t !== '');
                console.log('Exit code:', code);
                console.log('Program output:', stdout);
                console.log('Program stderr:', stderr);
                upps.kill();
                win.webContents.send(sendName, { stdout, stderr });
              });
            }
          }
        });
    } else {
      win.webContents.send(sendName, { stdout, stderr: '未检测到U盘！！' });
    }
  });
}
