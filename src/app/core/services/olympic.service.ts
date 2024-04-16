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
  private olympics$:BehaviorSubject<Olympic[]> = new BehaviorSubject<Olympic[]>([]);
  private isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<Olympic[]> {
    this.isLoading$.next(true);
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      delay(2000),
      timeout(5000),
      tap((value) => {
        this.olympics$.next(value);
        this.isLoading$.next(false);
      }),
      catchError((error: HttpErrorResponse | Error) => {
        this.isLoading$.next(false);
        if (error instanceof HttpErrorResponse) {
          console.error(`Erreur HTTP ${error.status}: ${error.statusText}`);
        } else {
          console.error(`Erreur de chargement des données: ${error.message}`);
        }
        this.olympics$.next([])
        return of([]); 
      })
    );
  }
  getLoadingState(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  getOlympics(): Observable<Olympic[]> {
    return this.olympics$.asObservable();
  }
  getCountryByName(countryName: string): Observable<Olympic> {
    return this.getOlympics().pipe(
      map((olympicsData) => olympicsData.filter(c => c.country === countryName)[0])
    ) as Observable<Olympic>
  
  }
}
