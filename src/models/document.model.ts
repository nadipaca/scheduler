/**
 * Generic base document shape used by the ERP.
 * docType is a string discriminator, data is the domain payload.
 */
export interface DocumentBase<TDocType extends string = string, TData = unknown> {
  docId: string;
  docType: TDocType;
  data: TData;
}