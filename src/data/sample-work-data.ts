import { WorkCenterDocument } from '../app/core/models/work-center.model';
import { WorkOrderDocument } from '../app/core/models/work-order.model';

export const SAMPLE_WORK_CENTERS: WorkCenterDocument[] = [
  {
    docId: 'wc-extrusion-line-a',
    docType: 'workCenter',
    data: { name: 'Extrusion Line A' },
  },
  {
    docId: 'wc-cnc-machine-1',
    docType: 'workCenter',
    data: { name: 'CNC Machine 1' },
  },
  {
    docId: 'wc-assembly-station',
    docType: 'workCenter',
    data: { name: 'Assembly Station' },
  },
  {
    docId: 'wc-quality-control',
    docType: 'workCenter',
    data: { name: 'Quality Control' },
  },
  {
    docId: 'wc-packaging-line',
    docType: 'workCenter',
    data: { name: 'Packaging Line' },
  },
];

export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = [
  // Around today on different centers
  {
    docId: 'wo-1001',
    docType: 'workOrder',
    data: {
      name: 'WO-1001 – Pipe Extrusion',
      workCenterId: 'wc-extrusion-line-a',
      status: 'open',
      startDate: '2026-02-25',
      endDate: '2026-03-03',
    },
  },
  {
    docId: 'wo-1002',
    docType: 'workOrder',
    data: {
      name: 'WO-1002 – CNC Milling',
      workCenterId: 'wc-cnc-machine-1',
      status: 'in-progress',
      startDate: '2026-03-01',
      endDate: '2026-03-10',
    },
  },
  {
    docId: 'wo-1003',
    docType: 'workOrder',
    data: {
      name: 'WO-1003 – Assembly Batch A',
      workCenterId: 'wc-assembly-station',
      status: 'blocked',
      startDate: '2026-02-28',
      endDate: '2026-03-05',
    },
  },
  {
    docId: 'wo-1004',
    docType: 'workOrder',
    data: {
      name: 'WO-1004 – Final Inspection',
      workCenterId: 'wc-quality-control',
      status: 'complete',
      startDate: '2026-02-20',
      endDate: '2026-02-24',
    },
  },
  {
    docId: 'wo-1005',
    docType: 'workOrder',
    data: {
      name: 'WO-1005 – Packaging Run A',
      workCenterId: 'wc-packaging-line',
      status: 'open',
      startDate: '2026-03-07',
      endDate: '2026-03-14',
    },
  },

  // Multiple non-overlapping orders on same work center (Assembly Station)
  {
    docId: 'wo-1006',
    docType: 'workOrder',
    data: {
      name: 'WO-1006 – Assembly Batch B',
      workCenterId: 'wc-assembly-station',
      status: 'in-progress',
      startDate: '2026-03-08',
      endDate: '2026-03-12',
    },
  },
  {
    docId: 'wo-1007',
    docType: 'workOrder',
    data: {
      name: 'WO-1007 – Assembly Batch C',
      workCenterId: 'wc-assembly-station',
      status: 'open',
      startDate: '2026-03-13',
      endDate: '2026-03-18',
    },
  },

  // A slightly longer-span order for Month/Week views
  {
    docId: 'wo-1008',
    docType: 'workOrder',
    data: {
      name: 'WO-1008 – Extrusion Long Run',
      workCenterId: 'wc-extrusion-line-a',
      status: 'complete',
      startDate: '2026-02-10',
      endDate: '2026-03-05',
    },
  },
];