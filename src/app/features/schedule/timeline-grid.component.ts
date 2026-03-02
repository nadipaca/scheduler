import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkCenterDocument } from '../../core/models/work-center.model';
import { WorkOrderDocument } from '../../core/models/work-order.model';
import { TimelineZoom } from '../../shared/utils/timeline-zoom.config';
import { TimelineRange } from '../../shared/utils/date-range.util';

@Component({
  standalone: true,
  selector: 'app-timeline-grid',
  imports: [CommonModule],
  templateUrl: './timeline-grid.component.html',
  styleUrls: ['./timeline-grid.component.scss'],
})
export class TimelineGridComponent {
  @Input({ required: true }) zoom!: TimelineZoom;
  @Input({ required: true }) visibleRange!: TimelineRange;
  @Input({ required: true }) workCenters: WorkCenterDocument[] = [];
  @Input({ required: true }) workOrders: WorkOrderDocument[] = [];
}