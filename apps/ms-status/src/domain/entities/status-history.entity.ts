/**
 * Domain entity representing a single state transition in a case's lifecycle.
 *
 * Each transition records: who changed it, from what state, to what state.
 * Immutable value object — no NestJS decorators, no ORM dependencies.
 */
export class StatusHistory {
  constructor(
    public readonly id: string,
    public readonly caseId: string,
    public readonly fromStatus: string,
    public readonly toStatus: string,
    public readonly changedBy: string,
    public readonly changedAt: Date,
  ) {}
}
