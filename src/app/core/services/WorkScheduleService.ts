import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { WorkCenterDocument } from '../models/work-center.model';
import {
  WorkOrderDocument,
  WorkOrderData,
} from '../models/work-order.model';
import {
  SAMPLE_WORK_CENTERS,
  SAMPLE_WORK_ORDERS,
} from '../../../data/sample-work-data';
import { hasWorkOrderOverlap } from '../../shared/utils/overlap.util';

const WORK_ORDERS_STORAGE_KEY = 'work-schedule-work-orders-v1';

export interface WorkOrderMutationResult {
  success: boolean;
  error?: string;
  workOrder?: WorkOrderDocument;
}

@Injectable({
  providedIn: 'root',
})
export class WorkScheduleService {
  private readonly workCentersSubject = new BehaviorSubject<WorkCenterDocument[]>([]);
  private readonly workOrdersSubject = new BehaviorSubject<WorkOrderDocument[]>([]);

   /**
   * Central overlap detection: ensures a candidate order does not overlap
   * with any existing orders on the same work center (except ignoreDocId).
   */
  private findOverlapError(
  workCenterId: string,
  startDateIso: string,
  endDateIso: string,
  allOrders: WorkOrderDocument[],
  ignoreDocId: string | null,
): string | null {
  const start = new Date(startDateIso);
  const end = new Date(endDateIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid start or end date.';
  }
  if (end < start) {
    return 'End date must be after start date.';
  }

  const hasOverlap = hasWorkOrderOverlap(
    { workCenterId, startDate: startDateIso, endDate: endDateIso },
    allOrders,
    ignoreDocId ?? undefined,
  );

  return hasOverlap
    ? 'This work order overlaps with an existing order on this work center.'
    : null;
}

  readonly workCenters$ = this.workCentersSubject.asObservable();
  readonly workOrders$ = this.workOrdersSubject.asObservable();

  constructor() {
    this.seedFromStorageOrSample();
  }

  // -------- Public snapshot helpers --------

  getWorkCentersSnapshot(): WorkCenterDocument[] {
    return this.workCentersSubject.getValue();
  }

  getWorkOrdersSnapshot(): WorkOrderDocument[] {
    return this.workOrdersSubject.getValue();
  }

  // -------- CRUD operations for work orders --------

  createWorkOrder(data: WorkOrderData): WorkOrderMutationResult {
    const workOrders = this.getWorkOrdersSnapshot();

    const overlapError = this.findOverlapError(
      data.workCenterId,
      data.startDate,
      data.endDate,
      workOrders,
      /* ignoreDocId */ null,
    );
    if (overlapError) {
      return { success: false, error: overlapError };
    }

    const newWorkOrder: WorkOrderDocument = {
      docId: this.generateDocId(),
      docType: 'workOrder',
      data,
    };

    const next = [...workOrders, newWorkOrder];
    this.workOrdersSubject.next(next);
    this.persistToStorage(next);

    return { success: true, workOrder: newWorkOrder };
  }

  updateWorkOrder(docId: string, patch: Partial<WorkOrderData>): WorkOrderMutationResult {
    const workOrders = this.getWorkOrdersSnapshot();
    const index = workOrders.findIndex((wo) => wo.docId === docId);
    if (index === -1) {
      return { success: false, error: 'Work order not found.' };
    }

    const existing = workOrders[index];
    const merged: WorkOrderDocument = {
      ...existing,
      data: {
        ...existing.data,
        ...patch,
      },
    };

    const overlapError = this.findOverlapError(
      merged.data.workCenterId,
      merged.data.startDate,
      merged.data.endDate,
      workOrders,
      /* ignoreDocId */ docId,
    );
    if (overlapError) {
      return { success: false, error: overlapError };
    }

    const next = [...workOrders];
    next[index] = merged;
    this.workOrdersSubject.next(next);
    this.persistToStorage(next);

    return { success: true, workOrder: merged };
  }

  deleteWorkOrder(docId: string): void {
    const workOrders = this.getWorkOrdersSnapshot();
    const next = workOrders.filter((wo) => wo.docId !== docId);
    this.workOrdersSubject.next(next);
    this.persistToStorage(next);
  }

  resetToSample(): void {
    this.workOrdersSubject.next(SAMPLE_WORK_ORDERS);
    this.persistToStorage(SAMPLE_WORK_ORDERS);
  }

  // -------- Internal helpers --------

  private seedFromStorageOrSample(): void {
    this.workCentersSubject.next(SAMPLE_WORK_CENTERS);

    const stored = this.readFromStorage();
    if (stored && Array.isArray(stored)) {
      this.workOrdersSubject.next(stored);
    } else {
      this.workOrdersSubject.next(SAMPLE_WORK_ORDERS);
      this.persistToStorage(SAMPLE_WORK_ORDERS);
    }
  }

  private readFromStorage(): WorkOrderDocument[] | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(WORK_ORDERS_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return null;
      }
      return parsed as WorkOrderDocument[];
    } catch {
      return null;
    }
  }

  private persistToStorage(workOrders: WorkOrderDocument[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(
        WORK_ORDERS_STORAGE_KEY,
        JSON.stringify(workOrders),
      );
    } catch {
      // Swallow storage errors; app can still function with in-memory state.
    }
  }

  private generateDocId(): string {
    // Simple unique-ish ID; in a real system this would come from backend/UUID.
    return `wo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}