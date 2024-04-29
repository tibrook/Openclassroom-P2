import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from '../../core/services/olympic.service';
import { Observable, takeUntil, Subject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Olympic } from '../../core/models/Olympic';
import { Participation } from '../../core/models/Participation';
const DEFAULT_COLOR: string = '#956065';

interface SeriesItem {
  name: string;
  value: number;
}
interface MedalDataItem {
  name: string; 
  series: SeriesItem[];
}
@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss']
})
export class CountryDetailComponent implements OnInit, OnDestroy {
  public countryName: string | null = null; 
  public numberOfEntries: number = 0; 
  public totalMedals: number = 0;
  public isLoading: boolean = true;
  public yScaleMin: number = 0;
  public yScaleMax: number = 0;
  public view: [number, number] = [0, 0];
  private _destroy$: Subject<void> = new Subject<void>();
  public selectedColor: string = DEFAULT_COLOR;
  public colorScheme: Color = {
    domain: [],
    group: ScaleType.Ordinal, 
    selectable: true, 
    name: 'Customer Usage',
  };
  public totalAthletes: number = 0; 
  public medalData: MedalDataItem[] = [];
  public countryData: Olympic | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _olympicService: OlympicService,
    private _router: Router,
  ) {}
  ngOnInit(): void {
    // Using combineLatest to handle multiple observable sources
    combineLatest([
      this._route.paramMap,
      this._olympicService.getLoadingState()
    ]).pipe(
      takeUntil(this._destroy$)
    ).subscribe(([params, isLoading]) => {
      this.isLoading = isLoading;
      this.countryName = params.get('countryName');
      if (params.get('color') && params.get('color')!.length === 5) {
        this.selectedColor = params.get('color')!;
      }
      this.colorScheme.domain.push(this.selectedColor);

      if (this.countryName && !isLoading) {
        this._olympicService.getCountryByName(this.countryName).subscribe(data => {
          if (data) {
            this.countryData = data;
            if (this.countryName) {
              this.loadCountryData(data.participations, this.countryName);
            }
            this.prepareChartData(data.participations);
          } else {
            this._router.navigate(['/not-found']);
          }
        });
      } else if (!this.countryName) {
        this._router.navigate(['/not-found']);
      }
    });
  }
  /**
   * Clean up any ongoing subscriptions when the component is destroyed.
   * Uses Angular's lifecycle hook to handle the cleanup process.
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Processes detailed Olympic participation data for a given country.
   * Aggregates total number of entries, total medals won, and total number of athletes.
   * @param {Participation[]} participations - List of participations for the country.
   * @param {string} countryName - Name of the country being processed.
   */
  loadCountryData(participations: Participation[], countryName: string): void {
    this.numberOfEntries = participations.length;
    this.totalMedals = participations.reduce((acc, participation) => acc + participation.medalsCount, 0);
    this.totalAthletes = participations.reduce((acc, participation) => acc + participation.athleteCount, 0);
  }

  /**
   * Prepares data for display in ngx-charts by setting up series for medal counts per Olympic year.
   * Calculates and adjusts y-axis scale based on the range of medals won across all participations.
   * @param {Participation[]} participations - List of participations for the chart data.
   */
  prepareChartData(participations: Participation[]): void {
    const medalCounts: number[] = participations.map(p => p.medalsCount);
    const minMedals: number = Math.min(...medalCounts);
    const maxMedals: number = Math.max(...medalCounts);
    const margin: number = (maxMedals - minMedals) * 0.5; // 50% Margin between min & max 
    this.yScaleMin = Math.round(Math.max(0, minMedals - margin));
    this.yScaleMax = Math.round(maxMedals + margin);
    this.medalData = [{
      name: this.countryName!,
      series: participations.map(participation => ({
        name: participation.year.toString(),
        value: participation.medalsCount  
      }))
    }];
  }

  /**
   * Handles navigation back to the previous view.
   */
  navigateBack(): void {
    this._router.navigate(['/']); 
  }

  /**
   * This function is used  to get the X Axis tick formatting.
   */
  getMathPower(val: number): number {
    return Math.round(val);
  }

  /**
   * Responds to browser window resize events to adjust chart dimensions dynamically.
   * @param {Event} event - Browser window resize event.
   */
  onResize(event: Event): void {
    const target = event.target as Window;
    this.view = [Math.round(target.innerWidth / 1.35), 400];
  }
}
