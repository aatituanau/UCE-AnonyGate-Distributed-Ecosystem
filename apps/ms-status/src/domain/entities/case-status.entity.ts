/**
 * Domain entity representing the current state of a complaint case.
 *
 * Immutable value object — no NestJS decorators, no ORM dependencies.
 * Follows the same pattern as Complaint entity in ms-submission.
 */
export class CaseStatus {
  constructor(
    public readonly id: string,
    public readonly complaintId: string,
    public readonly status: string,
    public readonly urgency: string,
    public readonly assignedTo: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
