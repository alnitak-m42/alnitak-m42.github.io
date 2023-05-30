import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  constructor() { }

  setLoading(loading: boolean) {
    this._isLoading$.next(loading);
  }


}
