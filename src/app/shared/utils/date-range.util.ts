import {
  addDays,
  addHours,
  addWeeks,
  addMonths,
  differenceInCalendarDays,
  differenceInHours,
  format,
  startOfDay,
  startOfHour,
  startOfWeek,
  endOfHour,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isBefore,
  isAfter,
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
  const before = cfg.visibleUnitsBefore;
  const after  = cfg.visibleUnitsAfter;

  let start: Date;
  let end: Date;

  switch (zoom) {
    case 'hour':
      start = addHours(today, -before);
      end   = addHours(today,  after);
      break;
    case 'week':
      start = addWeeks(today, -before);
      end   = addWeeks(today,  after);
      break;
    case 'month':
      start = addMonths(today, -before);
      end   = addMonths(today,  after);
      break;
    case 'day':
    default:
      start = addDays(today, -before);
      end   = addDays(today,  after);
  }

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
    case 'hour':
      return generateHourCells(range);
    case 'day':
      return generateDayCells(range);
    case 'week':
      return generateWeekCells(range);
    case 'month':
      return generateMonthCells(range);
  }
}

function generateHourCells(range: TimelineRange): TimelineHeaderCell[] {
  const cells: TimelineHeaderCell[] = [];
  let cursor = startOfHour(range.start);

  while (!isBefore(range.end, cursor)) {
    const hourEnd = endOfHour(cursor);
    const cellStart = isBefore(cursor, range.start) ? range.start : cursor;
    const cellEnd = isAfter(hourEnd, range.end) ? range.end : hourEnd;
    cells.push({
      label: format(cursor, 'ha'),
      start: cellStart,
      end: cellEnd,
    });
    cursor = addHours(cursor, 1);
  }

  return cells;
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
    const cellStart = isBefore(weekStart, range.start) ? range.start : weekStart;
    const cellEnd = isAfter(weekEnd, range.end) ? range.end : weekEnd;
    cells.push({
      label: format(weekStart, "wo 'week'"),
      start: cellStart,
      end: cellEnd,
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
    const cellStart = isBefore(monthStart, range.start) ? range.start : monthStart;
    const cellEnd = isAfter(monthEnd, range.end) ? range.end : monthEnd;
    cells.push({
      label: format(monthStart, 'MMM yyyy'),
      start: cellStart,
      end: cellEnd,
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
  if (zoom === 'hour') {
    const hoursFromStart = differenceInHours(date, range.start);
    return hoursFromStart * cfg.pixelsPerDay;
  }
  if (zoom === 'day') {
    const daysFromStart = differenceInCalendarDays(date, range.start);
    return daysFromStart * cfg.pixelsPerDay;
  }

  const cells = generateHeaderCells(zoom, range);
  const periodWidth = cfg.pixelsPerDay;
  const idx = findCellIndex(date, cells);
  if (idx === -1) {
    const daysFromStart = differenceInCalendarDays(date, range.start);
    return daysFromStart * periodWidth;
  }
  const cell = cells[idx];
  const daysInCell = differenceInCalendarDays(addDays(cell.end, 1), cell.start);
  const daysFromCellStart = Math.max(
    0,
    differenceInCalendarDays(date, cell.start),
  );
  const fraction = daysInCell === 0 ? 0 : daysFromCellStart / daysInCell;
  return idx * periodWidth + fraction * periodWidth;
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
  const periodWidth = cfg.pixelsPerDay;

  if (zoom === 'hour') {
    const startHours = differenceInHours(start, range.start);
    const endHoursExclusive = differenceInHours(addHours(end, 1), range.start);

    const x = startHours * periodWidth;
    const width = Math.max(
      (endHoursExclusive - startHours) * periodWidth,
      periodWidth * 0.5,
    );

    return { x, width };
  }
  if (zoom === 'day') {
    const startDays = differenceInCalendarDays(start, range.start);
    const endDaysExclusive = differenceInCalendarDays(addDays(end, 1), range.start);

    const x = startDays * periodWidth;
    const width = Math.max(
      (endDaysExclusive - startDays) * periodWidth,
      periodWidth * 0.5, // minimum visible width
    );

    return { x, width };
  }

  const x = dateToX(start, range, zoom);
  const endX = dateToX(addDays(end, 1), range, zoom);
  const width = Math.max(endX - x, periodWidth * 0.5);

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
  if (zoom === 'hour') {
    const hoursFromStart = xPx / cfg.pixelsPerDay;
    return addHours(range.start, Math.floor(hoursFromStart));
  }
  if (zoom === 'day') {
    const daysFromStart = xPx / cfg.pixelsPerDay;
    return addDays(range.start, Math.floor(daysFromStart));
  }

  const periodWidth = cfg.pixelsPerDay;
  const cells = generateHeaderCells(zoom, range);
  if (cells.length === 0) return range.start;

  const idx = Math.max(0, Math.min(Math.floor(xPx / periodWidth), cells.length - 1));
  const cell = cells[idx];
  const daysInCell = differenceInCalendarDays(addDays(cell.end, 1), cell.start);
  if (daysInCell === 0) return cell.start;

  const offset = xPx - idx * periodWidth;
  const fraction = Math.max(0, Math.min(offset / periodWidth, 0.999));
  const dayOffset = Math.floor(fraction * daysInCell);
  return addDays(cell.start, dayOffset);
}

function findCellIndex(date: Date, cells: TimelineHeaderCell[]): number {
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i];
    if (isBefore(date, cell.start)) continue;
    if (isAfter(date, cell.end)) continue;
    return i;
  }
  return -1;
}

/** Get today's x position in the current range (can be negative / > width). */
export function todayToX(range: TimelineRange, zoom: TimelineZoom): number {
  return dateToX(getToday(), range, zoom);
}
