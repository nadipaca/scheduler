import { TestBed } from '@angular/core/testing';
import { WorkScheduleService } from './WorkScheduleService';

describe('WorkScheduleService', () => {
  let service: WorkScheduleService;

  beforeEach(() => {
    // Clear any persisted data so each test starts clean
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('seeds work centers from sample data on init', (done) => {
    service.workCenters$.subscribe((centers) => {
      expect(centers.length).toBeGreaterThan(0);
      done();
    });
  });

  it('seeds work orders from sample data on init', (done) => {
    service.workOrders$.subscribe((orders) => {
      expect(orders.length).toBeGreaterThan(0);
      done();
    });
  });

  describe('createWorkOrder', () => {
    it('creates a new work order successfully', () => {
      const centers = service.getWorkCentersSnapshot();
      const centerId = centers[0].docId;
      const result = service.createWorkOrder({
        name: 'Test WO',
        workCenterId: centerId,
        status: 'open',
        startDate: '2030-01-01',
        endDate: '2030-01-05',
      });
      expect(result.success).toBeTrue();
      expect(result.workOrder?.data.name).toBe('Test WO');
    });

    it('rejects a work order that overlaps with an existing one', () => {
      const centers = service.getWorkCentersSnapshot();
      const centerId = centers[0].docId;
      service.createWorkOrder({
        name: 'First',
        workCenterId: centerId,
        status: 'open',
        startDate: '2030-02-01',
        endDate: '2030-02-10',
      });
      const result = service.createWorkOrder({
        name: 'Overlapping',
        workCenterId: centerId,
        status: 'open',
        startDate: '2030-02-05',
        endDate: '2030-02-15',
      });
      expect(result.success).toBeFalse();
      expect(result.error).toContain('overlaps');
    });

    it('allows back-to-back work orders on the same center', () => {
      const centers = service.getWorkCentersSnapshot();
      const centerId = centers[0].docId;
      service.createWorkOrder({
        name: 'First',
        workCenterId: centerId,
        status: 'open',
        startDate: '2030-03-01',
        endDate: '2030-03-05',
      });
      const result = service.createWorkOrder({
        name: 'Back to back',
        workCenterId: centerId,
        status: 'open',
        startDate: '2030-03-06',
        endDate: '2030-03-10',
      });
      expect(result.success).toBeTrue();
    });
  });

  describe('updateWorkOrder', () => {
    it('updates an existing work order', () => {
      const centers = service.getWorkCentersSnapshot();
      const centerId = centers[0].docId;
      const created = service.createWorkOrder({
        name: 'Edit me',
        workCenterId: centerId,
        status: 'open',
        startDate: '2030-04-01',
        endDate: '2030-04-05',
      });
      const docId = created.workOrder!.docId;
      const result = service.updateWorkOrder(docId, { status: 'in-progress' });
      expect(result.success).toBeTrue();
      expect(result.workOrder?.data.status).toBe('in-progress');
    });

    it('returns error for non-existent docId', () => {
      const result = service.updateWorkOrder('does-not-exist', { status: 'complete' });
      expect(result.success).toBeFalse();
    });
  });

  describe('deleteWorkOrder', () => {
    it('removes the work order from the list', () => {
      const centers = service.getWorkCentersSnapshot();
      const centerId = centers[0].docId;
      const created = service.createWorkOrder({
        name: 'Delete me',
        workCenterId: centerId,
        status: 'open',
        startDate: '2030-05-01',
        endDate: '2030-05-05',
      });
      const docId = created.workOrder!.docId;
      service.deleteWorkOrder(docId);
      const remaining = service.getWorkOrdersSnapshot().find((wo) => wo.docId === docId);
      expect(remaining).toBeUndefined();
    });
  });

  describe('resetToSample', () => {
    it('restores the original sample work orders', () => {
      const centers = service.getWorkCentersSnapshot();
      service.deleteWorkOrder(service.getWorkOrdersSnapshot()[0].docId);
      service.resetToSample();
      const afterReset = service.getWorkOrdersSnapshot();
      expect(afterReset.length).toBeGreaterThan(0);
    });
  });
});
