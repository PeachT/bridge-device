import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ToFixedr' })
export class ToFixedrPipe implements PipeTransform {
  transform(value: any, length = 2): string|number {
    value = value || 0;
    if (length === 0) {
      return Math.round(value)
    }
    return value.toFixed(length);
  }
}
