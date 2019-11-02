import { PLCTcpModbus } from "./PLCTcpModbus";

export class GroutingTcpModbus extends PLCTcpModbus {
  heartbeat() {
    setTimeout(async () => {
      if (this.ifClient()) {
        const d = new Date().getSeconds();
        // this.F06(4195, d)
        // this.client.readHoldingRegisters(0, 1).then((data) => {
        // this.client.readHoldingRegisters(0, 1).then((data) => {
        //   this.IPCSend(`${this.connectionStr.uid}heartbeat1`, { uint16: data.data });
        //   this.heartbeat();
        // }).catch((err) => {
        //   this.connection();
        // });
        await this.client.readCoils(2094, 1).then((data) => {
          this.IPCSend(`${this.connectionStr.uid}heartbeat`, { data: data.data });
          this.client.readCoils(2098, 1).then((data1) => {
            this.IPCSend(`${this.connectionStr.uid}heartbeat1`, { data: data1.data });
            this.heartbeat();
          }).catch((err) => {
            this.connection();
            this.IPCSendSys(`${this.connectionStr.uid}connection`, {success: false, msg: '设备链接错误', connectionStr: this.connectionStr});
          });
        }).catch((err) => {
          this.connection();
          this.IPCSendSys(`${this.connectionStr.uid}connection`, {success: false, msg: '设备链接错误', connectionStr: this.connectionStr});
        });
      }
    }, this.connectionStr.hz || 100);
  }
}
