export type AdvanceStatus = "pending" | "approved" | "rejected" | "disbursed";

export interface Advance {
  id: string;
  amount: number;
  status: AdvanceStatus;
  requestedAt: string;
  employeeId: string;
}
