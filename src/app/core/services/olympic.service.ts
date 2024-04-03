import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap,map,switchMap, delay  } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';
import { Observable,of } from 'rxjs'; 

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<Olympic[] | null>(null);

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<Olympic[] | null> {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      delay(2000), // test loading spinner
      tap((value) => this.olympics$.next(value)),
      catchError(this.handleError<Olympic[]>('loadInitialData'))
    );
  }

  getOlympics(): Observable<Olympic[] | null> {
    return this.olympics$.asObservable();
  }
  getCountryByName(countryName: string): Observable<Olympic | null>{
    return this.getOlympics().pipe(
      // switchMap wait until all data are loaded
      switchMap(olympicsData => {
        if (olympicsData === null) {
          return this.loadInitialData().pipe(
            switchMap(() => this.getOlympics()),
            map(olympicsData => olympicsData?.find(c => c.country === countryName) || null)
          );
        } else {
          return of(olympicsData.find(c => c.country === countryName) || null);
        }
      })
    );
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): BehaviorSubject<T | null> => {
      console.error(`${operation} failed: ${error.message}`, error);
      
      // Let the app keep running by returning a safe result
      this.olympics$.next(null);
      
      // Return an empty BehaviorSubject so the app can keep running
      return new BehaviorSubject<T | null>(null);
    };
  }
}
