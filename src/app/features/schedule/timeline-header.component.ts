import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  TimelineZoom,
  TIMELINE_ZOOM_CONFIG,
} from '../../shared/utils/timeline-zoom.config';
import {
  TimelineRange,
  TimelineHeaderCell,
  generateHeaderCells,
  getToday,
} from '../../shared/utils/date-range.util';
import { differenceInCalendarDays, isSameMonth, isSameWeek, isSameDay } from 'date-fns';

@Component({
  standalone: true,
  selector: 'app-timeline-header',
  imports: [CommonModule, NgSelectModule, FormsModule],
  templateUrl: './timeline-header.component.html',
  styleUrls: ['./timeline-header.component.scss'],
})
export class TimelineHeaderComponent {
  @Input({ required: true }) zoom!: TimelineZoom;
  @Input({ required: true }) visibleRange!: TimelineRange;

  @Output() zoomChange = new EventEmitter<TimelineZoom>();

  zoomOptions: { label: string; value: TimelineZoom }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  get headerCells(): TimelineHeaderCell[] {
    return generateHeaderCells(this.zoom, this.visibleRange);
  }

  get currentPeriodLabel(): string {
    switch (this.zoom) {
      case 'day':   return 'Today';
      case 'week':  return 'Current week';
      case 'month': return 'Current month';
    }
  }

  isCurrentPeriod(cell: TimelineHeaderCell): boolean {
    const today = getToday();
    switch (this.zoom) {
      case 'day':   return isSameDay(cell.start, today);
      case 'week':  return isSameWeek(cell.start, today, { weekStartsOn: 1 });
      case 'month': return isSameMonth(cell.start, today);
    }
  }

  onZoomSelect(zoom: TimelineZoom): void {
    this.zoomChange.emit(zoom);
  }

  getCellWidthPx(cell: TimelineHeaderCell): number {
    const cfg = TIMELINE_ZOOM_CONFIG[this.zoom];
    const spanDays =
      differenceInCalendarDays(cell.end, cell.start) + 1; // inclusive
    return spanDays * cfg.pixelsPerDay;
  }
}