import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkScheduleService } from '../../core/services/WorkScheduleService';
import { TimelineHeaderComponent } from './timeline-header.component';
import { TimelineGridComponent } from './timeline-grid.component';
import { TimelineZoom, TIMELINE_ZOOM_CONFIG } from '../../shared/utils/timeline-zoom.config';
import {
  TimelineRange,
  getInitialVisibleRange,
  getToday,
  dateToX,
} from '../../shared/utils/date-range.util';
import { WorkCenterDocument } from '../../core/models/work-center.model';
import { WorkOrderDocument } from '../../core/models/work-order.model';

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

  @ViewChild('timelineScroll', { static: false })
  private timelineScrollRef?: ElementRef<HTMLDivElement>;

  readonly leftColumnWidth = 220; // px, keep in sync with CSS

  constructor(private readonly workScheduleService: WorkScheduleService) {}

  ngAfterViewInit(): void {
    // Delay to let child components render and sizes settle
    setTimeout(() => this.centerOnToday(), 0);
  }

  onZoomChange(zoom: TimelineZoom): void {
    if (this.zoom === zoom) return;
    this.zoom = zoom;
    this.visibleRange = getInitialVisibleRange(zoom);
    // Optionally re-center on today when zoom changes:
    setTimeout(() => this.centerOnToday(), 0);
  }

  private centerOnToday(): void {
    const el = this.timelineScrollRef?.nativeElement;
    if (!el) return;

    const today = getToday();
    const todayX = dateToX(today, this.visibleRange, this.zoom);

    const target = Math.max(todayX - el.clientWidth / 2, 0);
    el.scrollLeft = target;
  }

  // Stubs for future panel wiring
  onCreateRequested(payload: {
    workCenter: WorkCenterDocument;
    suggestedDate: Date;
  }): void {
    // TODO: open create panel with prefilled start date
    console.log('Create requested', payload);
  }

  onEditRequested(workOrder: WorkOrderDocument): void {
    // TODO: open edit panel
    console.log('Edit requested', workOrder);
  }

  onDeleteRequested(workOrder: WorkOrderDocument): void {
    // TODO: confirm + delete
    console.log('Delete requested', workOrder);
  }
}