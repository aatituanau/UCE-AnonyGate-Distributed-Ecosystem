import { ComplaintStatus } from '../enums/complaint-status.enum';

/**
 * State Machine — Valid transitions for complaint lifecycle.
 *
 * This is a pure TypeScript data structure with no framework dependencies.
 * It formalizes the allowed transitions:
 *
 *   SUBMITTED → IN_REVIEW
 *   IN_REVIEW → AWAITING_INFO | CLOSED | REJECTED
 *   AWAITING_INFO → IN_REVIEW | CLOSED | REJECTED
 *
 * Terminal states (CLOSED, REJECTED) have no outgoing transitions.
 */
const VALID_TRANSITIONS: ReadonlyMap<ComplaintStatus, readonly ComplaintStatus[]> = new Map([
  [ComplaintStatus.SUBMITTED, [ComplaintStatus.IN_REVIEW]],
  [ComplaintStatus.IN_REVIEW, [ComplaintStatus.AWAITING_INFO, ComplaintStatus.CLOSED, ComplaintStatus.REJECTED]],
  [ComplaintStatus.AWAITING_INFO, [ComplaintStatus.IN_REVIEW, ComplaintStatus.CLOSED, ComplaintStatus.REJECTED]],
  [ComplaintStatus.CLOSED, []],
  [ComplaintStatus.REJECTED, []],
]);

/**
 * Validates whether a state transition is allowed by the state machine.
 *
 * @param from - Current status of the case
 * @param to   - Desired new status
 * @returns true if the transition is permitted, false otherwise
 */
export function isValidTransition(from: ComplaintStatus, to: ComplaintStatus): boolean {
  const allowed = VALID_TRANSITIONS.get(from);
  if (!allowed) return false;
  return allowed.includes(to);
}

/**
 * Returns the list of valid next states from the given status.
 * Useful for API responses that show available actions to the analyst.
 *
 * @param from - Current status of the case
 * @returns Array of valid next states (empty for terminal states)
 */
export function getValidNextStates(from: ComplaintStatus): readonly ComplaintStatus[] {
  return VALID_TRANSITIONS.get(from) ?? [];
}
