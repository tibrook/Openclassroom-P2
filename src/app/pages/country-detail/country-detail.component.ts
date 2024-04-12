import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from '../../core/services/olympic.service';
import { Observable, take } from 'rxjs';
import { Olympic  } from '../../core/models/Olympic';
import { Participation  } from '../../core/models/Participation';
import { Color, ScaleType } from '@swimlane/ngx-charts';

const DEFAULT_COLOR = '#956065';

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
  styleUrl: './country-detail.component.scss'
})

export class CountryDetailComponent {
  countryName!: string | null; 
  numberOfEntries: number = 0; 
  totalMedals: number = 0;
  isLoading: boolean = true;
  yScaleMin: number = 0;
  yScaleMax: number = 0;
  view!: [number, number];
  selectedColor: string = DEFAULT_COLOR
  colorScheme: Color= {
    domain: [],
    group: ScaleType.Ordinal, 
    selectable: true, 
    name: 'Customer Usage',
  };
  totalAthletes = 0; 
  medalData: MedalDataItem[] = [];
  countryData: Olympic | null = null;
  constructor(
    private route: ActivatedRoute,
    private olympicService: OlympicService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.countryName = params.get('countryName');
      if(params.get('color')){
        this.selectedColor = params.get('color')!
      }
      this.colorScheme.domain.push(this.selectedColor)
       if (this.countryName) {
          this.olympicService.getCountryByName(this.countryName).pipe(take(1)).subscribe(data => {
            console.log(data)
          if (data) {
            this.countryData = data;
            this.loadCountryData(this.countryData.participations, this.countryName!)
            this.prepareChartData(data.participations);
          }else{
            // No data means countryName not found 
            this.router.navigate(['/not-found']);
            this.countryData = null
          }
          this.isLoading = false
        });
      }else{
        this.isLoading = false
        this.router.navigate(['/']);
        // Redirect back / Show alert or error message ? 
      }
    });
  }
  
  loadCountryData(participations: Participation[], countryName: string): void {
    this.numberOfEntries = participations.length;
    this.totalMedals = participations.reduce((acc, participation) => acc + participation.medalsCount, 0);
    this.totalAthletes = participations.reduce((acc, participation) => acc + participation.athleteCount, 0);
  }

  prepareChartData(participations: Participation[]): void {
    const medalCounts = participations.map(p => p.medalsCount);
    const minMedals = Math.min(...medalCounts);
    const maxMedals = Math.max(...medalCounts);
    const margin = (maxMedals - minMedals) * 0.5; // 50% Margin between min & max 
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
  navigateBack(): void {
    this.router.navigate(['/']); 
  }
  getMathPower(val: number){
    return Math.round(val);
  }
  onResize(event:Event) {
    const target = event.target as Window;
    this.view = [target.innerWidth / 1.35, 400];
  }
}
