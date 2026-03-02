import { DocumentBase } from './document.model';

export type WorkCenterDocType = 'workCenter';

export interface WorkCenterData {
  name: string;
}

export type WorkCenterDocument = DocumentBase<WorkCenterDocType, WorkCenterData>;