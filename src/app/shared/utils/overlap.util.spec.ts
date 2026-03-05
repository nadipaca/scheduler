import { intervalsOverlapAllowTouching, hasWorkOrderOverlap } from './overlap.util';
import { WorkOrderDocument } from '../../core/models/work-order.model';

function makeOrder(
  docId: string,
  workCenterId: string,
  start: string,
  end: string,
): WorkOrderDocument {
  return {
    docId,
    docType: 'workOrder',
    data: { name: docId, workCenterId, status: 'open', startDate: start, endDate: end },
  };
}

describe('intervalsOverlapAllowTouching', () => {
  it('returns false when intervals are back-to-back (touching)', () => {
    const result = intervalsOverlapAllowTouching(
      new Date('2026-03-01'),
      new Date('2026-03-05'),
      new Date('2026-03-06'),
      new Date('2026-03-10'),
    );
    expect(result).toBeFalse();
  });

  it('returns true when intervals overlap by one day', () => {
    const result = intervalsOverlapAllowTouching(
      new Date('2026-03-01'),
      new Date('2026-03-06'),
      new Date('2026-03-06'),
      new Date('2026-03-10'),
    );
    expect(result).toBeTrue();
  });

  it('returns true when one interval contains the other', () => {
    const result = intervalsOverlapAllowTouching(
      new Date('2026-03-01'),
      new Date('2026-03-20'),
      new Date('2026-03-05'),
      new Date('2026-03-10'),
    );
    expect(result).toBeTrue();
  });

  it('returns false when intervals are completely separate', () => {
    const result = intervalsOverlapAllowTouching(
      new Date('2026-01-01'),
      new Date('2026-01-31'),
      new Date('2026-03-01'),
      new Date('2026-03-31'),
    );
    expect(result).toBeFalse();
  });

  it('returns true for identical intervals', () => {
    const result = intervalsOverlapAllowTouching(
      new Date('2026-03-01'),
      new Date('2026-03-10'),
      new Date('2026-03-01'),
      new Date('2026-03-10'),
    );
    expect(result).toBeTrue();
  });
});

describe('hasWorkOrderOverlap', () => {
  const existing = [
    makeOrder('wo-1', 'wc-A', '2026-03-01', '2026-03-10'),
    makeOrder('wo-2', 'wc-A', '2026-03-15', '2026-03-20'),
    makeOrder('wo-3', 'wc-B', '2026-03-01', '2026-03-31'),
  ];

  it('detects overlap with existing order on same work center', () => {
    expect(
      hasWorkOrderOverlap(
        { workCenterId: 'wc-A', startDate: '2026-03-08', endDate: '2026-03-12' },
        existing,
      ),
    ).toBeTrue();
  });

  it('returns false when a gap exists between orders', () => {
    expect(
      hasWorkOrderOverlap(
        { workCenterId: 'wc-A', startDate: '2026-03-11', endDate: '2026-03-14' },
        existing,
      ),
    ).toBeFalse();
  });

  it('ignores the specified docId (edit case)', () => {
    expect(
      hasWorkOrderOverlap(
        { workCenterId: 'wc-A', startDate: '2026-03-01', endDate: '2026-03-10' },
        existing,
        'wo-1',
      ),
    ).toBeFalse();
  });

  it('returns false when candidate is on a different work center', () => {
    expect(
      hasWorkOrderOverlap(
        { workCenterId: 'wc-C', startDate: '2026-03-01', endDate: '2026-03-31' },
        existing,
      ),
    ).toBeFalse();
  });

  it('returns true (treated as overlap) for invalid date strings', () => {
    expect(
      hasWorkOrderOverlap(
        { workCenterId: 'wc-A', startDate: 'not-a-date', endDate: '2026-03-10' },
        existing,
      ),
    ).toBeTrue();
  });
});
