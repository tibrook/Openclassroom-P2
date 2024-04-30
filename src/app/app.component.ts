import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil, Subject } from 'rxjs';
import { OlympicService } from './core/services/olympic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private olympicService: OlympicService) {}
  private _destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.olympicService.loadInitialData().pipe(takeUntil(this._destroy$)).subscribe();
  }
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete()
  }
}
