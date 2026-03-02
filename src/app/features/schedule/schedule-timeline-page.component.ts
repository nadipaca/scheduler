import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { TimelineZoom } from '../../shared/utils/timeline-zoom.config';

@Component({
  standalone: true,
  selector: 'app-schedule-timeline-page',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './schedule-timeline-page.component.html',
  styleUrls: ['./schedule-timeline-page.component.scss'],
})
export class ScheduleTimelinePageComponent {
  zoomOptions: { label: string; value: TimelineZoom }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  selectedZoom: TimelineZoom = 'day';

  // Later: pass selectedZoom down to timeline grid component as @Input()
}