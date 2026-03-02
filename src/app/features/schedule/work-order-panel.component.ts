import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  NgbDatepickerModule,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { addDays, isAfter } from 'date-fns';

import { WorkCenterDocument } from '../../core/models/work-center.model';
import {
  WorkOrderDocument,
  WorkOrderData,
  WorkOrderStatus,
} from '../../core/models/work-order.model';
import { hasWorkOrderOverlap } from '../../shared/utils/overlap.util';

type PanelMode = 'create' | 'edit';

function structToDate(struct: NgbDateStruct | null): Date | null {
  if (!struct) return null;
  return new Date(struct.year, struct.month - 1, struct.day);
}

function dateToStruct(date: Date): NgbDateStruct {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const startStruct = group.get('startDate')?.value as NgbDateStruct | null;
  const endStruct = group.get('endDate')?.value as NgbDateStruct | null;
  if (!startStruct || !endStruct) return null;

  const start = structToDate(startStruct);
  const end = structToDate(endStruct);
  if (!start || !end) return null;

  return isAfter(end, start) ? null : { dateRange: true };
}

@Component({
  standalone: true,
  selector: 'app-work-order-panel',
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule, NgSelectModule],
  templateUrl: './work-order-panel.component.html',
  styleUrls: ['./work-order-panel.component.scss'],
})
export class WorkOrderPanelComponent implements OnChanges {
  @Input() open = false;
  @Input() mode: PanelMode = 'create';
  @Input({ required: true }) workCenter!: WorkCenterDocument;
  @Input() workOrder: WorkOrderDocument | null = null;
  @Input() suggestedStartDate: Date | null = null;
  /** All existing orders for this work center (for overlap detection) */
  @Input() allOrders: WorkOrderDocument[] = [];

  /** Emitted when user cancels or clicks outside */
  @Output() closed = new EventEmitter<void>();

  /** Emitted with the validated payload; parent will call the service */
  @Output() submitOrder = new EventEmitter<{
    mode: PanelMode;
    workOrderId?: string;
    data: WorkOrderData;
  }>();

  form: FormGroup;
  overlapError: string | null = null;
  saving = false;

  statusOptions: { label: string; value: WorkOrderStatus }[] = [
    { label: 'Open', value: 'open' },
    { label: 'In progress', value: 'in-progress' },
    { label: 'Complete', value: 'complete' },
    { label: 'Blocked', value: 'blocked' },
  ];

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        status: ['open', Validators.required],
        startDate: [null as NgbDateStruct | null, Validators.required],
        endDate: [null as NgbDateStruct | null, Validators.required],
      },
      { validators: dateRangeValidator },
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['open'] || changes['mode'] || changes['workOrder']) && this.open) {
      this.initForm();
    }
  }

  private initForm(): void {
    this.overlapError = null;

    if (this.mode === 'create') {
      const start = this.suggestedStartDate ?? new Date();
      const end = addDays(start, 7);

      this.form.reset({
        name: '',
        status: 'open',
        startDate: dateToStruct(start),
        endDate: dateToStruct(end),
      });
    } else if (this.mode === 'edit' && this.workOrder) {
      const start = new Date(this.workOrder.data.startDate);
      const end = new Date(this.workOrder.data.endDate);

      this.form.reset({
        name: this.workOrder.data.name,
        status: this.workOrder.data.status,
        startDate: dateToStruct(start),
        endDate: dateToStruct(end),
      });
    }

    this.form.markAsPristine();
  }

  get dateRangeInvalid(): boolean {
    return !!this.form.errors?.['dateRange'];
  }

  onSubmit(): void {
    this.overlapError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as {
      name: string;
      status: WorkOrderStatus;
      startDate: NgbDateStruct;
      endDate: NgbDateStruct;
    };

    const start = structToDate(value.startDate)!;
    const end = structToDate(value.endDate)!;

    const data: WorkOrderData = {
      name: value.name.trim(),
      status: value.status,
      workCenterId: this.workCenter.docId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };

    const ignoreId =
      this.mode === 'edit' && this.workOrder ? this.workOrder.docId : undefined;

    const hasOverlap = hasWorkOrderOverlap(
      {
        workCenterId: data.workCenterId,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      this.allOrders,
      ignoreId,
    );

    if (hasOverlap) {
      this.overlapError =
        'This work order overlaps with an existing order on this work center.';
      return;
    }

    this.submitOrder.emit({
      mode: this.mode,
      workOrderId: this.workOrder?.docId,
      data,
    });
  }

  onCancel(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.onCancel();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: KeyboardEvent): void {
    if (!this.open) return;
    event.preventDefault();
    this.onCancel();
  }
}