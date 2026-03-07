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
  {
    docId: 'wo-1001',
    docType: 'workOrder',
    data: {
      name: 'WO-1001 – Pipe Extrusion Run',
      workCenterId: 'wc-extrusion-line-a',
      status: 'in-progress',
      startDate: '2026-01-10',
      endDate: '2026-03-20',
    },
  },
  {
    docId: 'wo-1008',
    docType: 'workOrder',
    data: {
      name: 'WO-1008 – Extrusion Long Run',
      workCenterId: 'wc-extrusion-line-a',
      status: 'open',
      startDate: '2026-05-08',
      endDate: '2026-05-22',
    },
  },
  {
    docId: 'wo-1002',
    docType: 'workOrder',
    data: {
      name: 'WO-1002 – CNC Precision Batch',
      workCenterId: 'wc-cnc-machine-1',
      status: 'complete',
      startDate: '2026-01-20',
      endDate: '2026-02-28',
    },
  },
  {
    docId: 'wo-1007',
    docType: 'workOrder',
    data: {
      name: 'WO-1007 – CNC High Precision',
      workCenterId: 'wc-cnc-machine-1',
      status: 'in-progress',
      startDate: '2026-03-03',
      endDate: '2026-06-28',
    },
  },
  {
    docId: 'wo-1003',
    docType: 'workOrder',
    data: {
      name: 'WO-1003 – Assembly Batch Alpha',
      workCenterId: 'wc-assembly-station',
      status: 'blocked',
      startDate: '2025-12-15',
      endDate: '2026-02-10',
    },
  },
  {
    docId: 'wo-1006',
    docType: 'workOrder',
    data: {
      name: 'WO-1006 – Assembly Batch Beta',
      workCenterId: 'wc-assembly-station',
      status: 'open',
      startDate: '2026-04-25',
      endDate: '2026-07-05',
    },
  },
  {
    docId: 'wo-1004',
    docType: 'workOrder',
    data: {
      name: 'WO-1004 – QC Lot Inspection',
      workCenterId: 'wc-quality-control',
      status: 'complete',
      startDate: '2026-12-01',
      endDate: '2026-02-25',
    },
  },
  {
    docId: 'wo-1009',
    docType: 'workOrder',
    data: {
      name: 'WO-1009 – Final QC Audit',
      workCenterId: 'wc-quality-control',
      status: 'in-progress',
      startDate: '2026-03-02',
      endDate: '2026-03-18',
    },
  },
{
    docId: 'wo-1005',
    docType: 'workOrder',
    data: {
      name: 'WO-1005 – Packaging Sprint A',
      workCenterId: 'wc-packaging-line',
      status: 'open',
      startDate: '2026-11-10',
      endDate: '2026-02-20',
    },
  },
  {
    docId: 'wo-1010',
    docType: 'workOrder',
    data: {
      name: 'WO-1010 – Packaging Sprint B',
      workCenterId: 'wc-packaging-line',
      status: 'blocked',
      startDate: '2026-04-01',
      endDate: '2026-06-15',
    },
  },
];