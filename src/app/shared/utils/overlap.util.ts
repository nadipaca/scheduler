import { addDays } from 'date-fns';
import { WorkOrderDocument } from '../../core/models/work-order.model';

/**
 * Returns true if two date intervals overlap, assuming both are inclusive
 * at their end in the business sense (days).
 *
 * We treat them as [start, endExclusive) where endExclusive = end + 1 day.
 * That means:
 *   [1–3] and [3–5] DO NOT overlap (allowed back-to-back).
 */
export function intervalsOverlapAllowTouching(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  const aStartNum = aStart.getTime();
  const aEndExclusiveNum = addDays(aEnd, 1).getTime();

  const bStartNum = bStart.getTime();
  const bEndExclusiveNum = addDays(bEnd, 1).getTime();

  // Standard half-open overlap check: [a1, a2) and [b1, b2) overlap if:
  // a1 < b2 && b1 < a2
  return aStartNum < bEndExclusiveNum && bStartNum < aEndExclusiveNum;
}

/**
 * Check whether a candidate work order overlaps with an existing list,
 * respecting work center and optional ignored docId (for edits).
 */
export function hasWorkOrderOverlap(
  candidate: { workCenterId: string; startDate: string; endDate: string },
  existingOrders: WorkOrderDocument[],
  ignoreDocId?: string,
): boolean {
  const start = new Date(candidate.startDate);
  const end = new Date(candidate.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    // Treat invalid dates as overlapping to force upstream validation error.
    return true;
  }

  const sameCenter = existingOrders.filter(
    (wo) =>
      wo.data.workCenterId === candidate.workCenterId &&
      (!ignoreDocId || wo.docId !== ignoreDocId),
  );

  return sameCenter.some((wo) => {
    const es = new Date(wo.data.startDate);
    const ee = new Date(wo.data.endDate);
    if (isNaN(es.getTime()) || isNaN(ee.getTime())) {
      return false;
    }
    return intervalsOverlapAllowTouching(es, ee, start, end);
  });
}