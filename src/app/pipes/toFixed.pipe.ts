import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ToFixedr' })
export class ToFixedrPipe implements PipeTransform {
  transform(value: any): number {
    return Number(value.toFixed(2));
  }
}
