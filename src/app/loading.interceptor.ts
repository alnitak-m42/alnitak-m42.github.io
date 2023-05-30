import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { LoadingService } from './loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.loadingService.setLoading(true);
    return next.handle(request).pipe(
      catchError(error => {
        this.loadingService.setLoading(false);
        throw error;
      }),
      map((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          this.loadingService.setLoading(false);
        }
        return event;
      })
    );
  }
}
