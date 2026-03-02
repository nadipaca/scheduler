export type TimelineZoom = 'day' | 'week' | 'month';

export interface TimelineZoomConfig {
  id: TimelineZoom;
  /** Base unit is always "day" for positioning; we just change scale. */
  pixelsPerDay: number;
  /** Days before today in initial visible range. */
  visibleDaysBefore: number;
  /** Days after today in initial visible range. */
  visibleDaysAfter: number;
}

export const TIMELINE_ZOOM_CONFIG: Record<TimelineZoom, TimelineZoomConfig> = {
  day: {
    id: 'day',
    pixelsPerDay: 40,      // narrow columns
    visibleDaysBefore: 14, // ±2 weeks
    visibleDaysAfter: 14,
  },
  week: {
    id: 'week',
    pixelsPerDay: 10,      // compressed days
    visibleDaysBefore: 60, // roughly ±2 months
    visibleDaysAfter: 60,
  },
  month: {
    id: 'month',
    pixelsPerDay: 2,       // many days on screen
    visibleDaysBefore: 180, // roughly ±6 months
    visibleDaysAfter: 180,
  },
};