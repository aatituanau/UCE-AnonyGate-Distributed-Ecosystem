import { Complaint } from '../../entities/complaint.entity';

export interface ComplaintRepositoryPort {
  save(complaint: Complaint): Promise<Complaint>;
  findById(id: string): Promise<Complaint | null>;
  findByAliasToken(token: string): Promise<Complaint | null>;
  findAll(): Promise<Complaint[]>;
}

export const COMPLAINT_REPOSITORY = Symbol('COMPLAINT_REPOSITORY');
