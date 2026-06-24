/**
 * Complaint lifecycle states.
 *
 * Transitions are governed by the state machine in status-transitions.ts.
 * This enum is framework-agnostic (pure TypeScript).
 */
export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  AWAITING_INFO = 'AWAITING_INFO',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}
