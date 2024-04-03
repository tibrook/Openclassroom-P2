import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from '../../core/services/olympic.service';
import { Observable } from 'rxjs';
import { Olympic  } from '../../core/models/Olympic';
import { Participation  } from '../../core/models/Participation';
@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrl: './country-detail.component.scss'
})
export class CountryDetailComponent {
  countryName: string | null = null; 
  numberOfEntries = 0; 
  totalMedals = 0;
  yScaleMin: number = 0;
  yScaleMax: number = 0;
  selectedColor: string = '956065'
  colorScheme: any = {
    domain: []
  };
  totalAthletes = 0; 
  medalData: any[] = [];
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
          this.olympicService.getCountryByName(this.countryName).subscribe(data => {
          if (data) {
            this.countryData = data;
            this.loadCountryData(this.countryData.participations, this.countryName!)
            this.prepareChartData(data.participations);
          }
        });
      }else{
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
    const margin = (maxMedals - minMedals) * 0.2; // 0% Margin between min & max 
    this.yScaleMin = Math.max(0, minMedals - margin);
    this.yScaleMax = maxMedals + margin;

    this.medalData = [{
      name: this.countryName,
      series: participations.map(participation => ({
        name: participation.year.toString(),
        value: Math.round(participation.medalsCount)
      }))
    }];
  }
  navigateBack(): void {
    this.router.navigate(['/']); 
  }
}
