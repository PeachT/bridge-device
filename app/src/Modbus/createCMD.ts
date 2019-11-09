
/**
 * 十六进制数据拼接
 *
 * @param {Number} dec 十进制数据
 * @param {Number} num 十六进制位数
 * @returns 返回拼接十六进制数据
 */
function Dec2Hex(dec: any, num: any) {
  const r = dec.toString(16).padStart(num, '00000000').toUpperCase();
  return r;
}
/**
 * 十进制正整数转4位16进制字符串
 *
 * @param {*} dec 十进制值
 * @returns
 */
function Hex4Byte(dec: any) {
  const hexStr = dec.toString(16).padStart(4, '0000').toUpperCase();
  let decSum = 0;
  for (let index = 0; index < hexStr.length; index += 2) {
    decSum += parseInt(`${hexStr[index]}${hexStr[index + 1]}`, 16);
  }
  return {
    decSum,
    hexStr,
  };
}
function FC5(data: boolean) {
  const hexStr = data ? 'FF00' : '0000';
  let decSum = 0;
  for (let index = 0; index < hexStr.length; index += 2) {
    decSum += parseInt(`${hexStr[index]}${hexStr[index + 1]}`, 16);
  }
  return {
    decSum,
    hexStr,
  };
}
function FC15(data: any) {
  // :01 0F 0500 0003 01 7 E0
  // data = data.reverse();
  let bitHex = ''; // 强制线圈十六进制字符串
  let bitDec = 0; // 强制线圈十进制
  const quantity = data.length; // 强制线圈数量
  const typeNumber = Math.ceil(quantity / 8); // 数据需要的字节数
  for (const index = 0; index < data.length;) {
    const group = data.splice(0, 8);
    const dec = parseInt(group.join(''), 2);
    bitDec += dec;
    bitHex = `${bitHex}${Dec2Hex(dec, 2)}`;
  }
  const hexStr = `${Dec2Hex(quantity, 4)}${Dec2Hex(typeNumber, 2)}${bitHex}`; // 拼接十六进制字符串
  const decSum = quantity + typeNumber + bitDec;// 计算LRC需要的值

  return {
    decSum,
    hexStr,
  };
}
function FC16(odata: Array<number>, state: 'int32'|'float' = null) {
  let data = [...odata];
  if (state) {
    data = FC16_32bit(odata, state);
  }
  const quantity = data.length; // 写入寄存器数量
  const typeNumber = quantity * 2; // 数据需要的字节数
  let dataHexStr = ''; // 十六进制字符串
  let dataDec = 0; // 十进制数据
  for (const index = 0; index < data.length;) {
    const dec = data.shift(); // 抛出第一个数据
    const dh = Hex4Byte(dec);
    dataDec += dh.decSum;
    dataHexStr = `${dataHexStr}${dh.hexStr}`;
  }
  const hexStr = `${Dec2Hex(quantity, 4)}${Dec2Hex(typeNumber, 2)}${dataHexStr}`; // 拼接十六进制字符串
  const decSum = quantity + typeNumber + dataDec;// 计算LRC需要的值
  return {
    decSum,
    hexStr,
  };
}
function FC16_32bit(int32Array: Array<number>, state: 'int32' | 'float') {
  const ints: any = [];
  // 构造4字节buffer
  const buf: any = Buffer.allocUnsafe(4);
  int32Array.map((data: any) => {
    const n = Number(data);
    if (state === 'int32') {
      buf.writeInt32LE(n, 0);
    } else {
      buf.writeFloatLE(n, 0);
    }
    const H: any = buf.readUInt16LE(0); // 高16位转为整数
    const L: any = buf.readUInt16LE(2); // 低16位转为整数
    ints.push(H, L);
  });
  return ints;
}

function bit32(data: number, state: any) {
  // 构造4字节buffer
  const buf: any = Buffer.allocUnsafe(4);
  if (state === 'int32') {
    buf.writeInt32LE(data, 0);
  } else {
    buf.writeFloatLE(data, 0);
  }
  const Hint: any = buf.readUInt16LE(0); // 高16位转为整数
  const Lint: any = buf.readUInt16LE(2); // 低16位转为整数
  return [Hint, Lint];
}
// 处理发生命令数据
// 01 (01 H) 读节点状态（不可读输入节点状态） S, Y, M, T, C
// 02 (02 H) 读节点状态（可读输入节点状态） S, X, Y, M,T, C
// 03 (03 H) 读寄存器的内容值 T, C, D
// 05 (05 H) 强制单独节点状态 On/Off S, Y, M, T, C
// 06 (06 H) 预设单独寄存器的值 T, C, D
// 15 (0F H) 强制多个节点状态 On/Off S, Y, M, T, C
// 16 (10 H) 预设多个寄存器的值 T, C, D
// 17 (11 H) 报告从站地址 None
// 23 (17 H) PLC LINK 在一个轮询时间内同时
// 执行读写功能 None
/**
 * 发送命令字符串
 *
 * @param {number} deviceId 站号
 * @param {String} fc 命令码
 * @param {number} address 操作数据首地址
 * @param {Object} data 命令数据
 * @returns 返回命令字符串
 */
// tslint:disable-next-line:max-line-length
export function asciiRequestCmd(deviceId: any, fc: any, address: any, data: any, state: any = null, mode: string) {
  let datas = null;
  switch (fc) {
    case 1:
    case 2:
    case 3:
    case 6:
      datas = Hex4Byte(data);
      break;
    case 5:
      datas = FC5(data);
      break;
    case 15:
      datas = FC15(data);
      break;
    case 16:
      datas = FC16(data, state);
      break;
    default:
      break;
  }
  const ar = Hex4Byte(address);
  let cmd: any =  `${Dec2Hex(deviceId, 2)}${Dec2Hex(fc, 2)}${ar.hexStr}${datas.hexStr}`;
  if (mode === 'tcp') {
    cmd = Buffer.from(`000000000006${cmd}`, 'hex');
  } else if (mode === 'rtu') {

  } else if (mode === 'ascii') {
    // LRC 码计算
    const LRC = Dec2Hex((256 - ((deviceId + fc + ar.decSum + datas.decSum) % 256)), 2);
    cmd = `:${cmd}${LRC}\r\n`;
  }

  return cmd;
}

