import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  TimelineZoom,
} from '../../shared/utils/timeline-zoom.config';
import { TimelineRange } from '../../shared/utils/date-range.util';

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

  onZoomSelect(zoom: TimelineZoom): void {
    this.zoomChange.emit(zoom);
  }
}
