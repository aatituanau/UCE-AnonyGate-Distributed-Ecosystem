import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetComplaintByIdQuery } from './get-complaint-by-id.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { COMPLAINT_REPOSITORY } from '../../../domain/ports/outbound/complaint.repository.port';
import type { ComplaintRepositoryPort } from '../../../domain/ports/outbound/complaint.repository.port';

@QueryHandler(GetComplaintByIdQuery)
export class GetComplaintByIdHandler implements IQueryHandler<GetComplaintByIdQuery> {
  constructor(
    @Inject(COMPLAINT_REPOSITORY)
    private readonly complaintRepository: ComplaintRepositoryPort,
  ) {}

  async execute(query: GetComplaintByIdQuery): Promise<any> {
    const complaint = await this.complaintRepository.findById(query.id);
    if (!complaint) {
      throw new NotFoundException(`Complaint not found with ID ${query.id}`);
    }
    return complaint;
  }
}
