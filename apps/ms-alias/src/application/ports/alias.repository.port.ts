import { Alias } from '../../domain/entities/alias.entity';
import { Complaint } from '../../domain/entities/complaint.entity';

// This string is a token for NestJS Dependency Injection
export const ALIAS_REPOSITORY_PORT = 'ALIAS_REPOSITORY_PORT';

export interface AliasRepositoryPort {
    saveComplaintWithAlias(complaint: Complaint, alias: Alias): Promise<void>;
    findComplaintByAlias(aliasCode: string): Promise<Complaint | null>;
}
