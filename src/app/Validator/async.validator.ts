import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { DbService } from '../services/db.service';
import { Observable } from 'rxjs';
import { map, catchError, debounceTime, switchMap, first, distinctUntilChanged } from 'rxjs/operators';

export function nameRepetition(
  db: DbService,
  dbName: string,
  f: (o1: any, o2: any) => boolean = (o1: any, o2: any) => o1.name === o2.name && o1.id !== o2.id,
  nowkey: string = 'name'): AsyncValidatorFn {
   return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.root.value;
    value[nowkey] = control.value;
    // console.log(control.root.value);

    return control.valueChanges.pipe(
      // 延时防抖
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(() => db.repetitionAsync(dbName, (o: any) => f(o, value))),
      map(c => {
        return c > 0 ? { reperition: `${control.value} 已存在!!` } : null;
      }),
      catchError(() => {
        return null;
      }),
      // 每次验证的结果是唯一的，截断流
      first()
    );
  };
}
