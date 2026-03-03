import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
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
  @Input() selectedWorkOrderId: string | null = null;

  @Output() createRequested = new EventEmitter<{
    workCenter: WorkCenterDocument;
    suggestedDate: Date;
  }>();
  @Output() editRequested = new EventEmitter<WorkOrderDocument>();
  @Output() deleteRequested = new EventEmitter<WorkOrderDocument>();
  @Output() selectRequested = new EventEmitter<WorkOrderDocument>();

  @ViewChild('lane', { static: true })
  private laneRef!: ElementRef<HTMLDivElement>;

  hintVisible = false;
  hintX = 0;

  onRowClick(event: MouseEvent): void {
    // Bars call stopPropagation, so this only runs for empty-lane clicks
    const rect = this.laneRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const suggestedDate = xToDate(x, this.visibleRange, this.zoom);

    this.createRequested.emit({
      workCenter: this.workCenter,
      suggestedDate,
    });
  }

  onLaneMouseMove(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('app-work-order-bar')) {
      this.hintVisible = false;
      return;
    }
    const rect = this.laneRef.nativeElement.getBoundingClientRect();
    this.hintX = event.clientX - rect.left;
    this.hintVisible = true;
  }

  onLaneMouseLeave(): void {
    this.hintVisible = false;
  }

  onBarEdit(workOrder: WorkOrderDocument): void {
    this.editRequested.emit(workOrder);
  }

  onBarDelete(workOrder: WorkOrderDocument): void {
    this.deleteRequested.emit(workOrder);
  }

  onBarClick(workOrder: WorkOrderDocument, event: MouseEvent): void {
    // prevent row click when bar is clicked
    event.stopPropagation();
    this.selectRequested.emit(workOrder);
  }
}
