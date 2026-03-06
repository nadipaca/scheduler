import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { WorkOrderDocument } from '../../core/models/work-order.model';
import { TimelineZoom } from '../../shared/utils/timeline-zoom.config';
import {
  TimelineRange,
  intervalToBarLayout,
} from '../../shared/utils/date-range.util';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  standalone: true,
  selector: 'app-work-order-bar',
  imports: [CommonModule, NgbDropdownModule, NgbTooltipModule, StatusBadgeComponent],
  templateUrl: './work-order-bar.component.html',
  styleUrls: ['./work-order-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderBarComponent {
  @Input({ required: true }) workOrder!: WorkOrderDocument;
  @Input({ required: true }) zoom!: TimelineZoom;
  @Input({ required: true }) visibleRange!: TimelineRange;
  @Input() active = false;

  @Output() barClick = new EventEmitter<MouseEvent>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  get layoutStyle(): { [key: string]: string } {
    const start = new Date(this.workOrder.data.startDate);
    const end = new Date(this.workOrder.data.endDate);
    const { x, width } = intervalToBarLayout(
      start,
      end,
      this.visibleRange,
      this.zoom,
    );

    return {
      left: `${x}px`,
      width: `${width}px`,
    };
  }

  onBarClick(event: MouseEvent): void {
    this.barClick.emit(event);
  }

  onEditClick(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit();
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit();
  }
}
