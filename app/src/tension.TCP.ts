import { PLCTcpModbus } from "./PLCTcpModbus";
import { bf } from "./bufferToNumber";

export class TensionTcpModbus extends PLCTcpModbus {
  heartbeat() {
    setTimeout(async () => {
      if (this.ifClient() && this.heartbeatState) {
        const d = new Date().getSeconds();
        // this.F06(4195, d)
        // this.client.readHoldingRegisters(0, 1).then((data) => {
        this.client.readHoldingRegisters(4096, 72).then((data) => {
          const float = bf.bufferToFloat(data.buffer);
        // const dint16 = bf.bufferTo16int(data.buffer);
          this.IPCSend(`${this.connectionStr.uid}heartbeat`, { uint16: data.data, float });
          // console.log(data.data);
          this.heartbeat();
        }).catch((err) => {
          this.connection();
        });
      }
    }, this.connectionStr.hz || 1000);
  }
}
