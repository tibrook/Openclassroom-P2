import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<Olympic[] | null>(null);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError(this.handleError<Olympic[]>('loadInitialData'))
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }
  private handleError<T>(operation = 'operation') {
    return (error: any): BehaviorSubject<T | null> => {
      console.error(`${operation} failed: ${error.message}`, error);
      
      // Let the app keep running by returning a safe result
      this.olympics$.next(null);
      
      // Optionally, you could also trigger a side-effect, like displaying an error message
      // this.showErrorMessage(`Could not load data: ${error.message}`);
      
      // Return an empty BehaviorSubject so the app can keep running
      return new BehaviorSubject<T | null>(null);
    };
  }
}
