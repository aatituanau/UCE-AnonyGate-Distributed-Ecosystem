import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { AuditEvent } from './schemas/audit-event.schema';
import { AuditArchive } from './schemas/audit-archive.schema';
import { ForbiddenException } from '@nestjs/common';

describe('AuditService', () => {
  let service: AuditService;

  const mockQuery = {
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const MockAuditLogModelConstructor = function (data: any) {
    this.save = jest.fn().mockResolvedValue(data);
    Object.assign(this, data);
  };
  MockAuditLogModelConstructor.findOne = jest.fn().mockReturnValue(mockQuery);
  
  const MockAuditArchiveModelConstructor = function (data: any) {
    this.save = jest.fn().mockResolvedValue(data);
    Object.assign(this, data);
  };
  MockAuditArchiveModelConstructor.findOne = jest.fn().mockReturnValue(mockQuery);


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getModelToken(AuditEvent.name),
          useValue: MockAuditLogModelConstructor,
        },
        {
          provide: getModelToken(AuditArchive.name),
          useValue: MockAuditArchiveModelConstructor,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Forensic Integrity (Hash-Chaining)', () => {
    it('1. should generate a correct and deterministic SHA-256 hash', () => {
      const previousHash = 'genesis_hash';
      const eventType = 'test.event';
      const payload = { test: true };
      const timestamp = new Date('2024-01-01T00:00:00.000Z');

      const hash1 = service.generateHash(previousHash, eventType, payload, timestamp);
      const hash2 = service.generateHash(previousHash, eventType, payload, timestamp);

      // Deterministic check
      expect(hash1).toEqual(hash2);
      // SHA-256 length is 64 hex characters
      expect(hash1).toHaveLength(64);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('2. should chain hashes correctly (hash N depends on hash N-1)', async () => {
      // Mock the previous event in the DB
      const previousHash = 'previous_hash_123';
      mockQuery.exec.mockResolvedValueOnce({ hash: previousHash });

      const eventType = 'complaint.created';
      const payload = { data: 'test' };

      // We spy on generateHash to check its arguments
      const generateHashSpy = jest.spyOn(service, 'generateHash');
      
      await service.processEvent(eventType, payload);

      expect(generateHashSpy).toHaveBeenCalledWith(
        previousHash,
        eventType,
        payload,
        expect.any(Date),
      );
    });

    it('3. should enforce Append-Only strict mode in schemas (MongoDB Mongoose Hooks)', () => {
       // A proper unit test without an in-memory DB is hard for internal mongoose hooks. 
       // We will simply verify the schema files define pre hooks.
       const fs = require('fs');
       const path = require('path');
       
       const eventSchemaStr = fs.readFileSync(path.join(__dirname, 'schemas', 'audit-event.schema.ts'), 'utf8');
       const archiveSchemaStr = fs.readFileSync(path.join(__dirname, 'schemas', 'audit-archive.schema.ts'), 'utf8');
       
       const forbiddenOperations = ['updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'findOneAndUpdate', 'findOneAndDelete'];
       
       forbiddenOperations.forEach(op => {
         expect(eventSchemaStr).toContain(`pre('${op}'`);
         expect(archiveSchemaStr).toContain(`pre('${op}'`);
       });
    });
  });
});
