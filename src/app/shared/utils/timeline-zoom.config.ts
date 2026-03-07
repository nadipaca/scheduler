export type TimelineZoom = 'hour' | 'day' | 'week' | 'month';

export interface TimelineZoomConfig {
  id: TimelineZoom;
  /** Base unit is always "day" for positioning; we just change scale. */
  pixelsPerDay: number;
  /**
   * How many natural units (hours / days / weeks / months) to show
   * before and after today on initial load. Fixed — no infinite extension.
   */
  visibleUnitsBefore: number;
  visibleUnitsAfter: number;
}

export const TIMELINE_ZOOM_CONFIG: Record<TimelineZoom, TimelineZoomConfig> = {
  hour: {
    id: 'hour',
    pixelsPerDay: 114,   // treated as pixels-per-hour in hour view
    visibleUnitsBefore: 14, // ±14 hours
    visibleUnitsAfter: 14,
  },
  day: {
    id: 'day',
    pixelsPerDay: 114,   // 86px column + 28px gap
    visibleUnitsBefore: 14, // ±14 days
    visibleUnitsAfter: 14,
  },
  week: {
    id: 'week',
    pixelsPerDay: 114,
    visibleUnitsBefore: 14, // ±14 weeks
    visibleUnitsAfter: 14,
  },
  month: {
    id: 'month',
    pixelsPerDay: 114,
    visibleUnitsBefore: 14, // ±14 months
    visibleUnitsAfter: 14,
  },
};
