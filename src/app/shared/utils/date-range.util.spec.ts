import { getInitialVisibleRange, dateToX, intervalToBarLayout } from './date-range.util';
import { startOfDay, addDays } from 'date-fns';

describe('getInitialVisibleRange', () => {
  it('day zoom: range spans 14 days before and after today', () => {
    const today = startOfDay(new Date());
    const range = getInitialVisibleRange('day');
    const startDiff = Math.round(
      (today.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const endDiff = Math.round(
      (range.end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(startDiff).toBe(14);
    expect(endDiff).toBe(14);
  });

  it('month zoom: range spans 180 days before and after today', () => {
    const today = startOfDay(new Date());
    const range = getInitialVisibleRange('month');
    const startDiff = Math.round(
      (today.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(startDiff).toBe(180);
  });
});

describe('dateToX (day zoom)', () => {
  const today = startOfDay(new Date('2026-03-04'));
  const range = {
    start: addDays(today, -14),
    end: addDays(today, 14),
  };

  it('maps range.start to 0px', () => {
    expect(dateToX(range.start, range, 'day')).toBe(0);
  });

  it('maps today (14 days from start) to 14 * 114 px', () => {
    expect(dateToX(today, range, 'day')).toBe(14 * 114);
  });

  it('maps range.end to 28 * 114 px', () => {
    expect(dateToX(range.end, range, 'day')).toBe(28 * 114);
  });
});

describe('intervalToBarLayout (day zoom)', () => {
  const rangeStart = startOfDay(new Date('2026-03-01'));
  const range = { start: rangeStart, end: addDays(rangeStart, 30) };

  it('single-day bar starts at correct x and has 114px width', () => {
    const start = addDays(rangeStart, 5);
    const end = addDays(rangeStart, 5);
    const { x, width } = intervalToBarLayout(start, end, range, 'day');
    expect(x).toBe(5 * 114);
    expect(width).toBe(114); // 1 day = 1 * 114px
  });

  it('multi-day bar has correct width', () => {
    const start = addDays(rangeStart, 0);
    const end = addDays(rangeStart, 6);   // 7 days inclusive
    const { x, width } = intervalToBarLayout(start, end, range, 'day');
    expect(x).toBe(0);
    expect(width).toBe(7 * 114);
  });

  it('bar starting at range.start has x=0', () => {
    const { x } = intervalToBarLayout(rangeStart, addDays(rangeStart, 2), range, 'day');
    expect(x).toBe(0);
  });
});
