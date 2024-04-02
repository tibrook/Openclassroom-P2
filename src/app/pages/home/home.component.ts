import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from '../../core/models/Olympic';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // public olympics$: Observable<any> = of(null);
  olympicData: any[] = [];
  colorScheme: any = {
    domain: ['#956065', '#793d52', '#89a1db', '#9780A1', '#BFE0F1', '#B8CBE7']
  };
  numberOfJOs!: number; 
  numberOfCountries!: number; 
  gradient: boolean = false;

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    // this.olympics$ = this.olympicService.getOlympics();
    this.olympicService.getOlympics().subscribe({
      next: (data) => {
        console.log('Received data:', data);
        // Check if data is truthy (not null or undefined) and is an array before proceeding
        if (Array.isArray(data)) {
          this.olympicData = this.transformDataForChart(data);
          this.numberOfJOs = this.calculateNumberOfJOs(data);
          this.numberOfCountries = data.length; // This should now be safe
        } else {
          // Handle the case where data is not as expected
          this.olympicData = [];
          this.numberOfJOs = 0;
          this.numberOfCountries = 0;
        }
      },
      error: (err) => {
        console.error('Error fetching Olympic data:', err);
        // Handle the error state appropriately
        // Consider setting default states
        this.olympicData = [];
        this.numberOfJOs = 0;
        this.numberOfCountries = 0;
      }
    });
  }
  transformDataForChart(data: Olympic[]): any[] {
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
  onSelect(event: any): void {
    // TO DO 
    console.log('Item clicked', JSON.parse(JSON.stringify(event)));
  }
}
