import { Routes } from '@angular/router';
import { ScheduleTimelinePageComponent } from './features/schedule/schedule-timeline-page.component';

export const routes: Routes = [
  // ...existing code...
  {
    path: '',
    component: ScheduleTimelinePageComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];