import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ToFixedr' })
export class ToFixedrPipe implements PipeTransform {
  transform(value: any, length = 2): string {
    return value.toFixed(length);
  }
}
