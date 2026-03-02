import { DocumentBase } from './document.model';

export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

export type WorkOrderDocType = 'workOrder';

export interface WorkOrderData {
  name: string;
  workCenterId: string;   // References WorkCenterDocument.docId
  status: WorkOrderStatus;
  startDate: string;      // ISO date string, e.g. "2026-03-01"
  endDate: string;        // ISO date string
}

export type WorkOrderDocument = DocumentBase<WorkOrderDocType, WorkOrderData>;