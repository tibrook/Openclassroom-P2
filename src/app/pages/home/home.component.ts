import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, filter } from 'rxjs/operators';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from '../../core/models/Olympic';
import { Router } from '@angular/router';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Participation } from '../../core/models/Participation';

interface ChartSelectEvent {
  name: string; 
  value: number;
}

interface ChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private _destroy$: Subject<void> = new Subject<void>();
  public olympicData: Olympic[] = [];  
  public transformedData: ChartData[] = [];
  public colorScheme: Color = {
    domain: ['#956065', '#793d52', '#89a1db', '#9780A1', '#BFE0F1', '#B8CBE7'],
    group: ScaleType.Ordinal, 
    selectable: true, 
    name: 'Customer Usage',
  };
  public isLoading: boolean = true; 
  public numberOfJOs: number = 0; 
  public view: [number, number] = [0, 0];
  public numberOfCountries: number = 0; 
  public gradient: boolean = false;

  constructor(private _olympicService: OlympicService, private _router: Router) {}

  /**
   * Initialize the component and subscribe to necessary observables.
   * Combines loading state and Olympic data streams to efficiently manage UI updates.
   */
  ngOnInit(): void {
    combineLatest([
      this._olympicService.getLoadingState(),
      this._olympicService.getOlympics()
    ]).pipe(
      takeUntil(this._destroy$),
      map(([loading, data]: [boolean, Olympic[]]) => {
        this.isLoading = loading;
        return data;
      }),
      filter((data: Olympic[]) => Array.isArray(data) && data.every((d: Olympic) => d.hasOwnProperty('country') && Array.isArray(d.participations)))
    ).subscribe((data: Olympic[]) => {
      this.olympicData = data;
      this.transformedData = this.transformDataForChart(data);
      this.numberOfJOs = this.calculateNumberOfJOs(data);
      this.numberOfCountries = data.length;
    });
  }
  /**
   * Transforms raw Olympic data into a ngx chart-friendly format.
   * Aggregates medals count by country to provide summary data for visualization.
   * @param {Olympic[]} data - The Olympic data to be transformed.
   * @returns {ChartData[]} - The transformed chart data array.
   */
  transformDataForChart(data: Olympic[]): ChartData[] {
    return data.map((olympic: Olympic) => ({
      name: olympic.country,
      value: olympic.participations.reduce((acc: number, participation: Participation) => acc + participation.medalsCount, 0)
    }));
  }

  /**
   * Calculates the number of unique Olympic years from the data set.
   * Used for statistics displayed in dashboard
   * @param {Olympic[]} data - The data from which to count unique years.
   * @returns {number} - The count of unique Olympic years.
   */
  calculateNumberOfJOs(data: Olympic[]): number {
    const years: Set<number> = new Set(); 
    data.forEach((olympic: Olympic) => {
      olympic.participations.forEach((participation: Participation) => {
        years.add(participation.year);
      });
    });
    return years.size;
  }

  /**
   * Event handler for chart item selection.
   * Routes to the country detail view with the selected country's name and dynamically chosen color.
   * @param {ChartSelectEvent} event - The event object containing the selected item details.
   */
  onSelect(event: ChartSelectEvent): void {
    const countryName: string = event.name;
    const countryIndex: number = this.olympicData.findIndex((olympic: Olympic) => olympic.country === countryName);
    const countryColor: string = this.colorScheme.domain[countryIndex % this.colorScheme.domain.length];
    this._router.navigate(['/country-detail', countryName, { color: countryColor }]);
  }

  /**
   * Handles window resize events to dynamically adjust the chart view size.
   * @param {Event} event - The window resize event.
   */
  onResize(event: Event): void {
    const target: Window = (event.target as Window);
    this.view = [Math.round(target.innerWidth / 1.35), 400];
  }

  /**
   * Clean up by unsubscribing from all subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
