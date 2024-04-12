import { HttpClient,HttpErrorResponse  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap,map, delay,filter,timeout   } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';
import { Observable,of, throwError } from 'rxjs'; 

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  // BehaviorSubject store the last data sended
  private olympics$ = new BehaviorSubject<Olympic[] | null>(null);

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<Olympic[] | null> {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      timeout(5000),
      delay(2000), // test loading spinner
      filter((value)=> value !== null),
      tap((value) => this.olympics$.next(value)),
      catchError((error: HttpErrorResponse | Error) => {
        if (error instanceof HttpErrorResponse) {
          console.error(`Erreur HTTP ${error.status}: ${error.statusText}`);
        } else {
          console.error(`Erreur de chargement des données: ${error.message}`);
        }
        return of(null); 
      })    
    );
  }

  getOlympics(): Observable<Olympic[] | null> {
    return this.olympics$.asObservable();
  }
  getCountryByName(countryName: string): Observable<Olympic | null> {
    return this.olympics$.pipe(
      filter(olympicsData => olympicsData !== null), 
      map(olympicsData => olympicsData!.find(c => c.country === countryName) || null)
    );
  }
}
