import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { differenceInCalendarDays } from 'date-fns';

import { WorkCenterDocument } from '../../core/models/work-center.model';
import { WorkOrderDocument } from '../../core/models/work-order.model';
import { TIMELINE_ZOOM_CONFIG, TimelineZoom } from '../../shared/utils/timeline-zoom.config';
import { TimelineRange } from '../../shared/utils/date-range.util';
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

  @Output() createRequested = new EventEmitter<{
    workCenter: WorkCenterDocument;
    event: MouseEvent;
  }>();

  @Output() editRequested = new EventEmitter<WorkOrderDocument>();
  @Output() deleteRequested = new EventEmitter<WorkOrderDocument>();

  rows: WorkCenterRowView[] = [];
  trackWidthPx = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.rebuildRows();
    this.recalculateTrackWidth();
  }

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
    const totalDays =
      differenceInCalendarDays(this.visibleRange.end, this.visibleRange.start) +
      1;
    const cfg = TIMELINE_ZOOM_CONFIG[this.zoom];
    this.trackWidthPx = totalDays * cfg.pixelsPerDay;
  }

  onRowCreateRequested(payload: {
    workCenter: WorkCenterDocument;
    event: MouseEvent;
  }): void {
    this.createRequested.emit(payload);
  }

  onRowEditRequested(workOrder: WorkOrderDocument): void {
    this.editRequested.emit(workOrder);
  }

  onRowDeleteRequested(workOrder: WorkOrderDocument): void {
    this.deleteRequested.emit(workOrder);
  }
}