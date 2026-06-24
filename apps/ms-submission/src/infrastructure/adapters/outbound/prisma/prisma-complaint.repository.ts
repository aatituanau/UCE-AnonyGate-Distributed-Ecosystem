import { Injectable } from '@nestjs/common';
import { ComplaintRepositoryPort } from '../../../../domain/ports/outbound/complaint.repository.port';
import { Complaint } from '../../../../domain/entities/complaint.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaComplaintRepository implements ComplaintRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(complaint: Complaint): Promise<Complaint> {
    const saved = await this.prisma.complaint.create({
      data: {
        id: complaint.id,
        aliasToken: complaint.aliasToken,
        payload: complaint.payload,
        status: complaint.status,
        createdAt: complaint.createdAt,
      },
    });
    return new Complaint(
      saved.id,
      saved.aliasToken,
      saved.payload,
      saved.status,
      saved.createdAt,
    );
  }

  async findById(id: string): Promise<Complaint | null> {
    const found = await this.prisma.complaint.findUnique({ where: { id } });
    if (!found) return null;
    return new Complaint(
      found.id,
      found.aliasToken,
      found.payload,
      found.status,
      found.createdAt,
    );
  }

  async findByAliasToken(token: string): Promise<Complaint | null> {
    const found = await this.prisma.complaint.findUnique({
      where: { aliasToken: token },
    });
    if (!found) return null;
    return new Complaint(
      found.id,
      found.aliasToken,
      found.payload,
      found.status,
      found.createdAt,
    );
  }
}
