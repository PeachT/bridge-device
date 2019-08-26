import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// 请求类型
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json;charset=UTF-8' })
};

@Injectable({
  providedIn: 'root'
})
export class HttpService {


  constructor(
    private http: HttpClient
  ) { }

  /**
   * POST请求处理
   *
   * @param {string} url url 后台接口api
   * @param {*} [data={}] data 参数
   * @returns {Observable<any>}
   * @memberof HttpService
   */
  public post(url: string, data: FormData): Observable<any> {
    return this.http.post(`${url}`, data).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }
  public grt(url: string): Observable<any> {
    return this.http.get(`${url}`).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  /**
   *  提取数据
   * @param res 返回结果
   */
  private extractData(res: Response) {
    const body = res;
    return body || {};
  }
  /**
   * 错误消息类
   * @param error
   */
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }
}
