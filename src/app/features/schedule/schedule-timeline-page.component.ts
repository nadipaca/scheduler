import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkScheduleService } from '../../core/services/WorkScheduleService';
import { TimelineHeaderComponent } from './timeline-header.component';
import { TimelineGridComponent } from './timeline-grid.component';
import { TimelineZoom, TIMELINE_ZOOM_CONFIG } from '../../shared/utils/timeline-zoom.config';
import {
  TimelineRange,
  getInitialVisibleRange,
} from '../../shared/utils/date-range.util';

@Component({
  standalone: true,
  selector: 'app-schedule-timeline-page',
  imports: [CommonModule, TimelineHeaderComponent, TimelineGridComponent],
  templateUrl: './schedule-timeline-page.component.html',
  styleUrls: ['./schedule-timeline-page.component.scss'],
})
export class ScheduleTimelinePageComponent {
  readonly workCenters$ = this.workScheduleService.workCenters$;
  readonly workOrders$ = this.workScheduleService.workOrders$;

  zoom: TimelineZoom = 'day';
  visibleRange: TimelineRange = getInitialVisibleRange(this.zoom);

  readonly leftColumnWidth = 220; // px, keep in sync with CSS

  constructor(private readonly workScheduleService: WorkScheduleService) {}

  onZoomChange(zoom: TimelineZoom): void {
    if (this.zoom === zoom) return;
    this.zoom = zoom;
    this.visibleRange = getInitialVisibleRange(zoom);
  }
}