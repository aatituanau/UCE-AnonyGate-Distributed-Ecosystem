import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllComplaintsQuery } from './get-all-complaints.query';
import { Inject } from '@nestjs/common';
import { COMPLAINT_REPOSITORY } from '../../../domain/ports/outbound/complaint.repository.port';
import type { ComplaintRepositoryPort } from '../../../domain/ports/outbound/complaint.repository.port';

@QueryHandler(GetAllComplaintsQuery)
export class GetAllComplaintsHandler implements IQueryHandler<GetAllComplaintsQuery> {
  constructor(
    @Inject(COMPLAINT_REPOSITORY)
    private readonly complaintRepository: ComplaintRepositoryPort,
  ) {}

  async execute(query: GetAllComplaintsQuery): Promise<any> {
    const complaints = await this.complaintRepository.findAll();
    return complaints;
  }
}
