import { FormArray, FormBuilder, FormGroup } from "@angular/forms";

const fb = new FormBuilder();
// export function createFormArray<T>(arrData: Array<T> = []): FormArray {
//   const arr = fb.array([]);
//   arrData.map(d => {
//     arr.push(recordFormGroup(d));
//   })
//   return arr;
// }
export function createFormGroup<T>(data: T, validators: {[key: string] : any} = {}, other: {[key: string] : Function} = {}): FormGroup {
  const obj: any = {};
  // tslint:disable-next-line:forin
  for (const key in data) {
    const value = data[key];
    if (key in other) {
      obj[key] = other[key](value);
    } else {
      obj[key] = [value, validators[key] || null]
    }
  }

  const fg = fb.group({...obj});
  console.log(fg);
  return fg;
}
