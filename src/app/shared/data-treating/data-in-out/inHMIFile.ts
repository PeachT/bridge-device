import { Observable, from } from 'rxjs';

import { groupBy, mergeMap, toArray, map } from 'rxjs/operators';
import { unit } from 'src/app/Function/unit';
import { GroutingTask, GroutingInfo, GroutingHoleItem } from 'src/app/models/grouting';
import { format } from 'date-fns';

/** 构建HMI数据 */
export function inHMIFile(data) {
  const arr = data.replace(/\r\n/g, '').replace(/\x20|\0/g, '').split('\t')
  console.log('HMIcsv数据', arr);
  const arrData = [];
  const example: Observable<any> = null;
  for (let index = 16; index < arr.length; index += 16) {
    const a: any = {};
    const name = `${arr[index]}${arr[index + 1]}`;
    if (!name || name === 'undefined') {
      break;
    } else {
      a.oname = name;
      a.name = arr[index + 2];
      a.steadyMpa = arr[index + 3];
      a.proportion = arr[index + 4];
      a.setMpa = arr[index + 5];
      a.steadyTime = arr[index + 6];
      const date = `${arr[index + 7]}-${arr[index + 8]}-${arr[index + 9]}`;

      a.startDate = new Date(`${date} ${arr[index + 10]}:${arr[index + 11]}:${arr[index + 12]}`);
      a.endDate = new Date(`${date} ${arr[index + 13]}:${arr[index + 14]}:${arr[index + 15]}`);
    }
    arrData.push(a);
  }
  // 根据 age 分组
  const gs = []
  from(arrData).pipe(
    groupBy(person => person.oname),
    // 为每个分组返回一个数组
    mergeMap(group => group.pipe(toArray()))
  ).subscribe(r => {
    const g: any = { name: r[0].oname }
    const holes = [];
    r.map(m => {
      delete m.oname;
      holes.push(m);
    })
    g.groups = holes;
    gs.push(g)
  });
  const groups = gs.map((gInfo, index) => {
    const hs = [];
    from(gInfo.groups).pipe(
      groupBy((hole: any) => hole.name),
      // 为每个分组返回一个数组
      mergeMap(group => group.pipe(toArray()))
    ).subscribe(r => {
      const g: any = { name: r[0].name }
      const holes = [];
      r.map(m => {
        delete m.name;
        holes.push(m);
      })
      g.groups = holes;
      hs.push(g)
    });
    return {name: gInfo.name, groups: hs};
  })

  console.log('1234679', gs, groups);
   return groups;
}

