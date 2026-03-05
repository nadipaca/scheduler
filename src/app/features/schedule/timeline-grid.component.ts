import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  differenceInCalendarDays,
  differenceInHours,
  isSameDay,
  isSameHour,
  isSameWeek,
  isSameMonth,
} from 'date-fns';

import { WorkCenterDocument } from '../../core/models/work-center.model';
import { WorkOrderDocument } from '../../core/models/work-order.model';
import {
  TimelineZoom,
  TIMELINE_ZOOM_CONFIG,
} from '../../shared/utils/timeline-zoom.config';
import {
  TimelineRange,
  TimelineHeaderCell,
  generateHeaderCells,
  dateToX,
  getToday,
} from '../../shared/utils/date-range.util';
import { WorkCenterRowComponent } from './work-center-row.component';

interface WorkCenterRowView {
  workCenter: WorkCenterDocument;
  workOrders: WorkOrderDocument[];
}

@Component({
  standalone: true,
  selector: 'app-timeline-grid',
  imports: [CommonModule, WorkCenterRowComponent],
  templateUrl: './timeline-grid.component.html',
  styleUrls: ['./timeline-grid.component.scss'],
})
export class TimelineGridComponent implements OnChanges {
  @Input({ required: true }) zoom!: TimelineZoom;
  @Input({ required: true }) visibleRange!: TimelineRange;
  @Input({ required: true }) workCenters: WorkCenterDocument[] = [];
  @Input({ required: true }) workOrders: WorkOrderDocument[] = [];
  @Input() selectedWorkOrderId: string | null = null;

  @Output() createRequested = new EventEmitter<{
    workCenter: WorkCenterDocument;
    suggestedDate: Date;
  }>();

  @Output() editRequested = new EventEmitter<WorkOrderDocument>();
  @Output() deleteRequested = new EventEmitter<WorkOrderDocument>();
  @Output() selectRequested = new EventEmitter<WorkOrderDocument>();

  rows: WorkCenterRowView[] = [];
  trackWidthPx = 0;
  currentPeriodX: number | null = null;
  currentPeriodWidth = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.rebuildRows();
    this.recalculateTrackWidth();
    this.recalculateCurrentPeriodX();
  }

  // ─── Header cell helpers ──────────────────────────────────────────────────

  get headerCells(): TimelineHeaderCell[] {
    return generateHeaderCells(this.zoom, this.visibleRange);
  }

  get dayWidthPx(): number {
    return TIMELINE_ZOOM_CONFIG[this.zoom]?.pixelsPerDay ?? 0;
  }

  get currentPeriodLabel(): string {
    switch (this.zoom) {
      case 'hour':  return 'Current hour';
      case 'day':   return 'Today';
      case 'week':  return 'Current week';
      case 'month': return 'Current month';
    }
  }

  isCurrentPeriod(cell: TimelineHeaderCell): boolean {
    const today = getToday();
    switch (this.zoom) {
      case 'hour':  return isSameHour(cell.start, today);
      case 'day':   return isSameDay(cell.start, today);
      case 'week':  return isSameWeek(cell.start, today, { weekStartsOn: 1 });
      case 'month': return isSameMonth(cell.start, today);
    }
  }

  getCellWidthPx(cell: TimelineHeaderCell): number {
    const cfg = TIMELINE_ZOOM_CONFIG[this.zoom];
    const spanDays = differenceInCalendarDays(cell.end, cell.start) + 1;
    if (this.zoom === 'hour') {
      return cfg.pixelsPerDay;
    }
    if (this.zoom === 'day') {
      return spanDays * cfg.pixelsPerDay;
    }
    return cfg.pixelsPerDay;
  }

  // ─── Rows ─────────────────────────────────────────────────────────────────

  private rebuildRows(): void {
    const ordersByCenter = new Map<string, WorkOrderDocument[]>();

    for (const wo of this.workOrders) {
      const list = ordersByCenter.get(wo.data.workCenterId) ?? [];
      list.push(wo);
      ordersByCenter.set(wo.data.workCenterId, list);
    }

    const result: WorkCenterRowView[] = this.workCenters.map((wc) => {
      const list = ordersByCenter.get(wc.docId) ?? [];
      list.sort((a, b) =>
        a.data.startDate.localeCompare(b.data.startDate),
      );
      return { workCenter: wc, workOrders: list };
    });

    this.rows = result;
  }

  private recalculateTrackWidth(): void {
    if (!this.visibleRange || !this.zoom) {
      this.trackWidthPx = 0;
      return;
    }
    const cfg = TIMELINE_ZOOM_CONFIG[this.zoom];
    if (this.zoom === 'hour') {
      const totalHours =
        differenceInHours(this.visibleRange.end, this.visibleRange.start) + 1;
      this.trackWidthPx = totalHours * cfg.pixelsPerDay;
    } else if (this.zoom === 'day') {
      const totalDays =
        differenceInCalendarDays(this.visibleRange.end, this.visibleRange.start) +
        1;
      this.trackWidthPx = totalDays * cfg.pixelsPerDay;
    } else {
      this.trackWidthPx = this.headerCells.length * cfg.pixelsPerDay;
    }
  }

  private recalculateCurrentPeriodX(): void {
    if (!this.visibleRange || !this.zoom) {
      this.currentPeriodX = null;
      return;
    }
    const cell = this.headerCells.find((c) => this.isCurrentPeriod(c));
    if (!cell) {
      this.currentPeriodX = null;
      return;
    }
    this.currentPeriodX = dateToX(cell.start, this.visibleRange, this.zoom);
    this.currentPeriodWidth = this.getCellWidthPx(cell);
  }

  onRowCreateRequested(payload: {
    workCenter: WorkCenterDocument;
    suggestedDate: Date;
  }): void {
    this.createRequested.emit(payload);
  }

  onRowEditRequested(workOrder: WorkOrderDocument): void {
    this.editRequested.emit(workOrder);
  }

  onRowDeleteRequested(workOrder: WorkOrderDocument): void {
    this.deleteRequested.emit(workOrder);
  }

  onRowSelectRequested(workOrder: WorkOrderDocument): void {
    this.selectRequested.emit(workOrder);
  }
}
