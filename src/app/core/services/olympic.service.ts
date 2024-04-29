import { HttpClient,HttpErrorResponse  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap,map, delay,filter,timeout   } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';
import { Observable,of, throwError } from 'rxjs'; 
import { Participation } from '../models/Participation';
@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$:BehaviorSubject<Olympic[]> = new BehaviorSubject<Olympic[]>([]);
  private isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  /**
   * Fetches initial data from a JSON file and updates the observables for olympics data and loading state.
   * Applies a delay and timeout for the request to simulate network conditions or enforce timeout.
   * @returns {Observable<Olympic[]>} An observable of the Olympic data array.
   */
  loadInitialData(): Observable<Olympic[]> {
    this.isLoading$.next(true);
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      delay(2000),  // Delay to simulate network latency.
      timeout(5000),
      map((data) => this.removeDuplicates(data)),
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
  /**
   * Returns an observable of the current loading state.
   * @returns {Observable<boolean>} An observable of the boolean loading state.
   */
  getLoadingState(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  /**
   * Provides an observable of the current Olympic data.
   * @returns {Observable<Olympic[]>} An observable of the Olympic data array.
   */
  getOlympics(): Observable<Olympic[]> {
    return this.olympics$.asObservable();
  }
 
  /**
   * Retrieves a specific country's Olympic data by name.
   * @param {string} countryName - The name of the country to search for.
   * @returns {Observable<Olympic>} An observable of the Olympic data for the specified country.
   */
  getCountryByName(countryName: string): Observable<Olympic> {
    return this.getOlympics().pipe(
      map((olympicsData) => olympicsData.filter(c => c.country === countryName)[0])
    ) as Observable<Olympic>
  }

  /**
   * Removes duplicate countries from the Olympic data.
   * @param {Olympic[]} data - The array of Olympic data to filter.
   * @returns {Olympic[]} The filtered array with unique countries.
   */
  private removeDuplicates(data: Olympic[]): Olympic[] {
    const uniqueCountries = new Set();
    const filteredData = data.filter(olympic => {
      if (!uniqueCountries.has(olympic.country)) {
        uniqueCountries.add(olympic.country);
        olympic.participations = this.uniqueParticipations(olympic.participations);
        return true;
      }
      return false;
    });
    return filteredData;
  }

  /**
   * Filters out duplicate participations based on the year.
   * @param {Participation[]} participations - The array of participations to filter.
   * @returns {Participation[]} The filtered array with unique years of participation.
   */
  private uniqueParticipations(participations: Participation[]): Participation[] {
    const uniqueYears = new Set();
    return participations.filter(participation => {
      if (!uniqueYears.has(participation.year)) {
        uniqueYears.add(participation.year);
        return true;
      }
      return false;
    });
  }
}
