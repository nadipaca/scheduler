import {
  addDays,
  differenceInCalendarDays,
  format,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isBefore,
} from 'date-fns';
import { TimelineZoom, TIMELINE_ZOOM_CONFIG } from './timeline-zoom.config';

export interface TimelineRange {
  start: Date;
  end: Date;
}

export interface TimelineHeaderCell {
  label: string;
  start: Date;
  end: Date;
}

/** Today normalized to start of local day. */
export function getToday(): Date {
  return startOfDay(new Date());
}

/** Compute initial visible range around today based on zoom config. */
export function getInitialVisibleRange(zoom: TimelineZoom): TimelineRange {
  const today = getToday();
  const cfg = TIMELINE_ZOOM_CONFIG[zoom];

  const start = addDays(today, -cfg.visibleDaysBefore);
  const end = addDays(today, cfg.visibleDaysAfter);

  return { start, end };
}

/**
 * Generate header cells for the given zoom and visible range.
 * Day: one cell per day
 * Week: one cell per calendar week
 * Month: one cell per calendar month
 */
export function generateHeaderCells(
  zoom: TimelineZoom,
  range: TimelineRange,
): TimelineHeaderCell[] {
  switch (zoom) {
    case 'day':
      return generateDayCells(range);
    case 'week':
      return generateWeekCells(range);
    case 'month':
      return generateMonthCells(range);
  }
}

function generateDayCells(range: TimelineRange): TimelineHeaderCell[] {
  const cells: TimelineHeaderCell[] = [];
  let cursor = startOfDay(range.start);

  while (!isBefore(range.end, cursor)) {
    const dayEnd = cursor; // inclusive day; layout will treat days as [start, +1)
    cells.push({
      label: format(cursor, 'dd MMM'),
      start: cursor,
      end: dayEnd,
    });
    cursor = addDays(cursor, 1);
  }

  return cells;
}

function generateWeekCells(range: TimelineRange): TimelineHeaderCell[] {
  const cells: TimelineHeaderCell[] = [];

  let cursor = startOfWeek(range.start, { weekStartsOn: 1 }); // Monday
  const hardEnd = range.end;

  while (!isBefore(hardEnd, cursor)) {
    const weekStart = cursor;
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
    cells.push({
      label: format(weekStart, "wo 'week'"),
      start: weekStart,
      end: weekEnd,
    });
    cursor = addDays(cursor, 7);
  }

  return cells;
}

function generateMonthCells(range: TimelineRange): TimelineHeaderCell[] {
  const cells: TimelineHeaderCell[] = [];

  let cursor = startOfMonth(range.start);
  const hardEnd = range.end;

  while (!isBefore(hardEnd, cursor)) {
    const monthStart = cursor;
    const monthEnd = endOfMonth(cursor);
    cells.push({
      label: format(monthStart, 'MMM yyyy'),
      start: monthStart,
      end: monthEnd,
    });
    cursor = addDays(monthEnd, 1); // move to first day of next month
  }

  return cells;
}

/**
 * Map a date to a horizontal position (in px) within the given range.
 * 0 px corresponds to range.start.
 */
export function dateToX(
  date: Date,
  range: TimelineRange,
  zoom: TimelineZoom,
): number {
  const cfg = TIMELINE_ZOOM_CONFIG[zoom];
  const daysFromStart = differenceInCalendarDays(date, range.start);
  return daysFromStart * cfg.pixelsPerDay;
}

/**
 * Map a date interval to a bar's x/width in px.
 * We treat end as exclusive for layout, so we add 1 day.
 */
export function intervalToBarLayout(
  start: Date,
  end: Date,
  range: TimelineRange,
  zoom: TimelineZoom,
): { x: number; width: number } {
  const cfg = TIMELINE_ZOOM_CONFIG[zoom];

  const startDays = differenceInCalendarDays(start, range.start);
  const endDaysExclusive = differenceInCalendarDays(addDays(end, 1), range.start);

  const x = startDays * cfg.pixelsPerDay;
  const width = Math.max(
    (endDaysExclusive - startDays) * cfg.pixelsPerDay,
    cfg.pixelsPerDay * 0.5, // minimum visible width
  );

  return { x, width };
}

/**
 * Map a horizontal offset (in px) back to a date, given the visible range
 * and zoom configuration.
 */
export function xToDate(
  xPx: number,
  range: TimelineRange,
  zoom: TimelineZoom,
): Date {
  const cfg = TIMELINE_ZOOM_CONFIG[zoom];
  const daysFromStart = xPx / cfg.pixelsPerDay;
  return addDays(range.start, Math.floor(daysFromStart));
}

/** Get today's x position in the current range (can be negative / > width). */
export function todayToX(range: TimelineRange, zoom: TimelineZoom): number {
  return dateToX(getToday(), range, zoom);
}