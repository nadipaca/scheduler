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
import { TimelineRange } from '../../shared/utils/date-range.util';
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
    event: MouseEvent;
  }>();

  @Output() editRequested = new EventEmitter<WorkOrderDocument>();
  @Output() deleteRequested = new EventEmitter<WorkOrderDocument>();

  onRowClick(event: MouseEvent): void {
    this.createRequested.emit({
      workCenter: this.workCenter,
      event,
    });
  }

  onBarEdit(workOrder: WorkOrderDocument): void {
    this.editRequested.emit(workOrder);
  }

  onBarDelete(workOrder: WorkOrderDocument): void {
    this.deleteRequested.emit(workOrder);
  }

  onBarClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}