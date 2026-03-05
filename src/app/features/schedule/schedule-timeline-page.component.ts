import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { addDays } from 'date-fns';

import { WorkScheduleService } from '../../core/services/WorkScheduleService';
import { WorkCenterDocument } from '../../core/models/work-center.model';
import {
  WorkOrderData,
  WorkOrderDocument,
} from '../../core/models/work-order.model';
import {
  TimelineZoom,
  TIMELINE_ZOOM_CONFIG,
} from '../../shared/utils/timeline-zoom.config';
import {
  TimelineRange,
  getInitialVisibleRange,
  getToday,
  dateToX,
} from '../../shared/utils/date-range.util';

import { TimelineHeaderComponent } from './timeline-header.component';
import { TimelineGridComponent } from './timeline-grid.component';
import { WorkOrderPanelComponent } from './work-order-panel.component';

@Component({
  standalone: true,
  selector: 'app-schedule-timeline-page',
  imports: [
    CommonModule,
    TimelineHeaderComponent,
    TimelineGridComponent,
    WorkOrderPanelComponent,
  ],
  templateUrl: './schedule-timeline-page.component.html',
  styleUrls: ['./schedule-timeline-page.component.scss'],
})
export class ScheduleTimelinePageComponent implements AfterViewInit {
  readonly workCenters$ = this.workScheduleService.workCenters$;
  readonly workOrders$ = this.workScheduleService.workOrders$;

  zoom: TimelineZoom = 'month';
  visibleRange: TimelineRange = getInitialVisibleRange(this.zoom);

  readonly leftColumnWidth = 240;

  private readonly EXTEND_DAYS = 30;
  private readonly SCROLL_EDGE_THRESHOLD_PX = 400;

  // slide‑out panel state
  panelOpen = false;
  panelMode: 'create' | 'edit' = 'create';
  selectedWorkCenter: WorkCenterDocument | null = null;
  selectedWorkOrder: WorkOrderDocument | null = null;
  suggestedStartDate: Date | null = null;
  ordersForSelectedCenter: WorkOrderDocument[] = [];

  // Keep latest work orders in memory so we can derive per‑center lists quickly
  private workOrdersSnapshot: WorkOrderDocument[] = [];
  private workCentersSnapshot: WorkCenterDocument[] = [];

  constructor(private readonly workScheduleService: WorkScheduleService) {
    this.workOrders$.subscribe((orders) => {
      this.workOrdersSnapshot = orders;
    });

    this.workCenters$.subscribe((centers) => {
      this.workCentersSnapshot = centers;
    });
  }

  @ViewChild('timelineScroll', { static: false })
  private timelineScrollRef?: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    setTimeout(() => this.centerOnToday(), 0);
  }

  onZoomChange(zoom: TimelineZoom): void {
    if (this.zoom === zoom) return;
    this.zoom = zoom;
    this.visibleRange = getInitialVisibleRange(zoom);
    setTimeout(() => this.centerOnToday(), 0);
  }

  centerOnToday(): void {
    const el = this.timelineScrollRef?.nativeElement;
    if (!el) return;

    const today = getToday();
    const todayX = dateToX(today, this.visibleRange, this.zoom);
    const target = Math.max(todayX - el.clientWidth / 2, 0);
    el.scrollLeft = target;
  }

  onTimelineScroll(event: Event): void {
    const el = event.target as HTMLDivElement;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const cfg = TIMELINE_ZOOM_CONFIG[this.zoom];
    const addedPx = this.EXTEND_DAYS * cfg.pixelsPerDay;

    if (scrollLeft < this.SCROLL_EDGE_THRESHOLD_PX) {
      this.visibleRange = {
        start: addDays(this.visibleRange.start, -this.EXTEND_DAYS),
        end: this.visibleRange.end,
      };
      // Shift scroll to compensate for the prepended pixels
      setTimeout(() => { el.scrollLeft = scrollLeft + addedPx; }, 0);
    } else if (scrollLeft + clientWidth > scrollWidth - this.SCROLL_EDGE_THRESHOLD_PX) {
      this.visibleRange = {
        start: this.visibleRange.start,
        end: addDays(this.visibleRange.end, this.EXTEND_DAYS),
      };
    }
  }

  // ----- Events from grid / rows / bars -----

  onCreateRequested(payload: {
    workCenter: WorkCenterDocument;
    suggestedDate: Date;
  }): void {
    this.panelMode = 'create';
    this.selectedWorkCenter = payload.workCenter;
    this.selectedWorkOrder = null;
    this.suggestedStartDate = payload.suggestedDate;

    this.ordersForSelectedCenter = this.workOrdersSnapshot.filter(
      (wo) => wo.data.workCenterId === payload.workCenter.docId,
    );

    this.panelOpen = true;
  }

  onEditRequested(workOrder: WorkOrderDocument): void {
    const center = this.findCenterById(workOrder.data.workCenterId);

    this.panelMode = 'edit';
    this.selectedWorkCenter = center ?? null;
    this.selectedWorkOrder = workOrder;
    this.suggestedStartDate = null;

    this.ordersForSelectedCenter = this.workOrdersSnapshot.filter(
      (wo) => wo.data.workCenterId === workOrder.data.workCenterId,
    );

    this.panelOpen = true;
  }

  onDeleteRequested(workOrder: WorkOrderDocument): void {
    const confirmed = window.confirm(
      `Delete work order "${workOrder.data.name}"?`,
    );
    if (!confirmed) return;

    // Adjust to your real service API
    this.workScheduleService.deleteWorkOrder(workOrder.docId);
    // Streams will emit new values; grid updates automatically.
  }

  onSelectRequested(workOrder: WorkOrderDocument): void {
    const center = this.findCenterById(workOrder.data.workCenterId);
    this.selectedWorkCenter = center ?? null;
    this.selectedWorkOrder = workOrder;
  }

  private findCenterById(id: string): WorkCenterDocument | undefined {
    return this.workCentersSnapshot.find(
      (c: WorkCenterDocument) => c.docId === id,
    );
  }

  // ----- Events from panel -----

  onPanelClosed(): void {
    this.panelOpen = false;
  }

  onResetToSample(): void {
    this.workScheduleService.resetToSample();
  }

  onPanelSubmit(event: {
    mode: 'create' | 'edit';
    workOrderId?: string;
    data: WorkOrderData;
  }): void {
    if (!this.selectedWorkCenter) return;

    if (event.mode === 'create') {
      this.workScheduleService.createWorkOrder(event.data);
    } else if (event.mode === 'edit' && event.workOrderId) {
      this.workScheduleService.updateWorkOrder(event.workOrderId, event.data);
    }

    // Because we’re using streams from the service, the timeline
    // will update automatically when those streams emit.
    this.panelOpen = false;
  }
}
