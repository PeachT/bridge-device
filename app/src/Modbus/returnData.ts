// 处理返回数据数据

function str2bit(s: any) {
  const r = s.padStart(8, '000000000');
  return Array.from(r).reverse();
}
function FC2(buffer: Buffer) {
  const bits = [];
  // tslint:disable-next-line:prefer-for-of
  for (let index = 0; index < buffer.length; index ++) {
    bits.push(...str2bit(buffer[index].toString(2)))
  }
  return bits;
}

// 处理获取的寄存器数据
function FC3(buffer: Buffer) {
  const int16 = [];
  const int32 = [];
  const float = [];
  buffer.swap16();
  for (let index = 0; index < buffer.length; index += 2) {
      int16.push(buffer.readInt16LE(index));
      if (buffer.length % 4 === 0 && index % 4 === 0) {
        int32.push(buffer.readInt32LE(index));
        float.push(buffer.readFloatLE(index));
      }
  }
  return { int16, int32, float, str: buffer.toString()};
}
function ascii2buffer(data: any) {
  const arrUint8 = []
  for (const index = 0; index < data.length;) {
    arrUint8.push(parseInt(data.splice(0, 2).join(''), 16));
  }
  return Buffer.from(arrUint8);
}
/**
 * 有符号32位整数转浮点数
 *
 * @export
 * @param {Buffer} buffers buffer数据
 */
function bufferToFloat(buffers: Buffer) {
  if (buffers.length % 4 !== 0 ) {
    return null;
  }
  const fs = [];
  for (let index = 0; index < buffers.length; index += 4) {
    const b4 = buffers.slice(index, index + 4);
    b4.swap16(); // 16位整数高低位交换
    fs.push(Number(b4.readFloatLE(0))); // 32位转为浮点数
  }
  return fs;
}

export function returnData16(data: any, mode: string) {
  // : 01 03 0C 0064 0065 0066 0067 0068 0069 89
  let fc: number = null; // 操作命令
  let datas: Buffer = null;
  if (mode === 'ascii') {
    fc = parseInt(data.slice(3, 5), 16); // 操作命令
    datas = ascii2buffer(Array.from(data.slice(7, -4)));
  } else if (mode === 'tcp') {
    const buffer = Buffer.from(data);
    fc = parseInt(buffer[7].toString(), 16); // 操作命令
    datas = buffer.slice(9);
  } else if (mode === 'rtu') {
    return Buffer.from(data);
  }
  switch (fc) {
    case 1:
    case 2:
      return FC2(datas);
    case 3:
      return FC3(datas);
    case 5:
    case 6:
    case 15:
    case 16:
      return `${fc}${Array.from(datas).join('')}`;
    default:
      return null;
  }

}
