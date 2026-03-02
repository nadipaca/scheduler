import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkCenterDocument } from '../../core/models/work-center.model';
import { WorkOrderDocument } from '../../core/models/work-order.model';
import { TimelineZoom } from '../../shared/utils/timeline-zoom.config';
import {
  TimelineRange,
  xToDate,
} from '../../shared/utils/date-range.util';
import { WorkOrderBarComponent } from './work-order-bar.component';

@Component({
  standalone: true,
  selector: 'app-work-center-row',
  imports: [CommonModule, WorkOrderBarComponent],
  templateUrl: './work-center-row.component.html',
  styleUrls: ['./work-center-row.component.scss'],
})
export class WorkCenterRowComponent {
  @Input({ required: true }) workCenter!: WorkCenterDocument;
  @Input({ required: true }) workOrders: WorkOrderDocument[] = [];
  @Input({ required: true }) zoom!: TimelineZoom;
  @Input({ required: true }) visibleRange!: TimelineRange;

  @Output() createRequested = new EventEmitter<{
    workCenter: WorkCenterDocument;
    suggestedDate: Date;
  }>();

  @Output() editRequested = new EventEmitter<WorkOrderDocument>();
  @Output() deleteRequested = new EventEmitter<WorkOrderDocument>();

  onLaneClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left; // px from left edge of row
    const suggestedDate = xToDate(x, this.visibleRange, this.zoom);

    this.createRequested.emit({
      workCenter: this.workCenter,
      suggestedDate,
    });
  }

  onBarEdit(workOrder: WorkOrderDocument): void {
    this.editRequested.emit(workOrder);
  }

  onBarDelete(workOrder: WorkOrderDocument): void {
    this.deleteRequested.emit(workOrder);
  }

  onBarClick(event: MouseEvent): void {
    // Prevent row click when bar is clicked
    event.stopPropagation();
  }
}