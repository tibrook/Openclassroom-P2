import { Component, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from '../../core/models/Olympic';
import { Router } from '@angular/router';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { takeUntil } from 'rxjs/operators';


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

export class HomeComponent implements OnInit {
  
  private destroy$ = new Subject<void>();
  // public olympics$: Observable<any> = of(null);
  olympicData: Olympic[] = [];
  transformedData: ChartData[] = []
  colorScheme: Color= {
    domain: ['#956065', '#793d52', '#89a1db', '#9780A1', '#BFE0F1', '#B8CBE7'],
    group: ScaleType.Ordinal, 
    selectable: true, 
    name: 'Customer Usage',
  };
  isLoading: boolean = true; 
  numberOfJOs!: number; 
  view!: [number, number];
  numberOfCountries!: number; 
  gradient: boolean = false;

  constructor(private olympicService: OlympicService,private router: Router ) {}

  ngOnInit(): void {
    this.isLoading = true;
    // this.olympics$ = this.olympicService.getOlympics();
    this.olympicService.getOlympics().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        console.log(data)
        if(data){
          console.log('Received data:', data);
          // Check if data is truthy (not null or undefined) and is an array before proceeding
          if(Array.isArray(data) && data.every(d => d.hasOwnProperty('country') && Array.isArray(d.participations))) {
            this.olympicData = data
            this.transformedData = this.transformDataForChart(data);
            this.numberOfJOs = this.calculateNumberOfJOs(data);
            this.numberOfCountries = data.length;
          } else {
            // Handle the case where data is not as expected
            this.olympicData = [];
          }
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching Olympic data:', err);
        this.transformedData = [];
        this.numberOfJOs = 0;
        this.numberOfCountries = 0;
        this.isLoading = false;
      }
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  transformDataForChart(data: Olympic[]): ChartData[] {
    if (!data) {
      return [];
    }
    return data.map(olympic => {
      return {
        name: olympic.country,
        value: olympic.participations.reduce((acc, participation) => acc + participation.medalsCount, 0)
      };
    });
  }
  calculateNumberOfJOs(data: Olympic[]): number {
    if (!data) {
      return 0;
    }
    const years = new Set(); 
    data.forEach(olympic => {
      olympic.participations.forEach(participation => {
        years.add(participation.year);
      });
    });
    return years.size;
  }
  onSelect(event: ChartSelectEvent): void {
    const countryName = event.name;
    const countryIndex = this.olympicData.findIndex(olympic => olympic.country === countryName);
    const countryColor = this.colorScheme.domain[countryIndex % this.colorScheme.domain.length];
    this.router.navigate(['/country-detail', countryName, { color: countryColor }]);
  }
  onResize(event:any) {
    this.view = [event.target.innerWidth / 1.35, 400];
    console.log(this.view)
  }
}
