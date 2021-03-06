import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, interval, merge, of } from 'rxjs';
import {filter, mapTo, scan, switchMap, } from 'rxjs/operators';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { faPause } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import { InputToCountdownDirective } from 'src/app/directives/input-to-countdown.directive';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.css']
})
export class CountdownComponent implements OnInit, AfterViewInit {

  faPlay = faPlay;
  faPause = faPause;
  faSquare = faSquare;

  @ViewChild('start', { static: true })
  startBtn: ElementRef;

  @ViewChild('pause', { static: true })
  pauseBtn: ElementRef;

  @ViewChild('reset', { static: true })
  resetBtn: ElementRef;

  @ViewChild('zero', {static: true })
  zeroBtn: ElementRef;

  intervalObs$;
  constructor(public d: InputToCountdownDirective) { }

  ngOnInit() { }

  ngAfterViewInit(): void {

    const start$ = fromEvent(this.startBtn.nativeElement, 'click').pipe(mapTo(true));
    const pause$ = fromEvent(this.pauseBtn.nativeElement, 'dblclick').pipe(mapTo(false));
    const reset$ = fromEvent(this.resetBtn.nativeElement, 'click').pipe(mapTo(null));
    const zero$ = fromEvent(this.zeroBtn.nativeElement, 'click').pipe(mapTo(undefined));

    const stateChange$ = this.d.obs$.pipe(mapTo(null));

    this.intervalObs$ = merge(start$, pause$, reset$, zero$, stateChange$).pipe(

      switchMap(isCounting => {
        if (isCounting === null) { return of(null); }
        if (isCounting === undefined) {
          this.d.updateState(0, 'seconds');
          this.d.updateState(0, 'minutes');
          this.d.updateState(0, 'hours');
          return of(null);
        }
        return isCounting ? interval(1000) : of();
      }),

      scan((accumulatedValue, currentValue) => {
        if (accumulatedValue === 0) { return accumulatedValue; }
        if (currentValue === null || !accumulatedValue) { return this.d.getTotalSeconds(); }
        return --accumulatedValue;
      })
    );
  }

}
