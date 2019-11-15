import { Pipe, PipeTransform } from '@angular/core';
import { TensionDevice } from '../models/jack';

@Pipe({ name: 'kn2mpa' })
export class Kn2mpaPipe implements PipeTransform {
  transform(value: number, jack: TensionDevice, jackName: string): number {
    if (jack.equation) {
      // P=aF+b
      return Number((value * jack[jackName].a + jack[jackName].b).toFixed(2));
    } else {
      // F=aP+b
      return Number(((value - jack[jackName].b) / jack[jackName].a).toFixed(2));
    }
  }
}
@Pipe({ name: 'mpa2kn' })
export class Mpa2knPipe implements PipeTransform {
  transform(value: number, jack: TensionDevice, jackName: string): number {
    if (!value) {
      return value;
    }
    if (jack.equation) {
      // P=aF+b
      return Number(((value - jack[jackName].b) / jack[jackName].a).toFixed(2));
    } else {
      // F=aP+b
      return Number((value * jack[jackName].a + jack[jackName].b).toFixed(2));
    }
  }
}
@Pipe({ name: 'holeName' })
export class HoleNamePipe implements PipeTransform {
  transform(value: string, mode: number) {
    const names = value.split('/');
    switch (mode) {
      case 42: // 4顶两端
        return {A1: names[0], A2: names[0], B1: names[1], B2: names[1], span: 2};
      case 41: // 4顶单端
        return {A1: names[0], A2: names[1], B1: names[2], B2: names[3], span: 1};
      case 21: // A1|A2单端
        return {A1: names[0], A2: names[1], span: 1};
      case 23: // A1|A2两端
        return {A1: names[0], A2: names[0], span: 2};
      case 24: // B1|B2两端
        return {B1: names[0], B2: names[0], span: 2};
      case 22: // A1|B1单端
        return {A1: names[0], B1: names[1], span: 1};
      case 25: // A1|B1两端
        return {A1: names[0], B1: names[2], span: 2};
      case 11: // A1单端
        return {A1: names[0], span: 1};
      case 12: // B1单端
        return {B1: names[2], span: 1};
      default:
        break;
    }
  }
}
