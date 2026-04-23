export enum ChargeStatusCode {
  PreCharge = 1,
  PostCharge = 2
}

export const CHARGE_STATUS_SELECT_OPTIONS = [
  { id: String(ChargeStatusCode.PreCharge), name: 'Pre-charge' },
  { id: String(ChargeStatusCode.PostCharge), name: 'Post-charge' }
];
