import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkScheduleService } from '../../core/services/WorkScheduleService';
import { WorkCenterDocument } from '../../core/models/work-center.model';
import {
  WorkOrderData,
  WorkOrderDocument,
} from '../../core/models/work-order.model';
import {
  TimelineZoom,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleTimelinePageComponent implements AfterViewInit {
  readonly workCenters$ = this.workScheduleService.workCenters$;
  readonly workOrders$ = this.workScheduleService.workOrders$;

  zoom: TimelineZoom = 'month';
  visibleRange: TimelineRange = getInitialVisibleRange(this.zoom);

  readonly leftColumnWidth = 240;

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

  constructor(
    private readonly workScheduleService: WorkScheduleService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.workOrders$.subscribe((orders) => {
      this.workOrdersSnapshot = orders;
      this.cdr.markForCheck();
    });

    this.workCenters$.subscribe((centers) => {
      this.workCentersSnapshot = centers;
      this.cdr.markForCheck();
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
