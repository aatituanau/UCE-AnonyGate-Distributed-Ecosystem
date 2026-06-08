import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetComplaintQuery } from './get-complaint.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { COMPLAINT_REPOSITORY } from '../../../domain/ports/outbound/complaint.repository.port';
import type { ComplaintRepositoryPort } from '../../../domain/ports/outbound/complaint.repository.port';

@QueryHandler(GetComplaintQuery)
export class GetComplaintHandler implements IQueryHandler<GetComplaintQuery> {
  constructor(
    @Inject(COMPLAINT_REPOSITORY)
    private readonly complaintRepository: ComplaintRepositoryPort,
  ) {}

  async execute(query: GetComplaintQuery): Promise<any> {
    const complaint = await this.complaintRepository.findByAliasToken(query.aliasToken);
    if (!complaint) {
      throw new NotFoundException('Complaint not found for the provided token');
    }
    return complaint;
  }
}
