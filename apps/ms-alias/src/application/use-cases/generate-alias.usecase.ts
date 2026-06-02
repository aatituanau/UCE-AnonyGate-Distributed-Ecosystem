import { Injectable, Inject } from '@nestjs/common';
import { ALIAS_REPOSITORY_PORT } from '../ports/alias.repository.port';
import type { AliasRepositoryPort } from '../ports/alias.repository.port';
import { Alias } from '../../domain/entities/alias.entity';
import { Complaint } from '../../domain/entities/complaint.entity';
import * as crypto from 'crypto';

@Injectable()
export class GenerateAliasUseCase {
    constructor(
        @Inject(ALIAS_REPOSITORY_PORT)
        private readonly aliasRepository: AliasRepositoryPort,
    ) { }

    async execute(dto: { title: string; description: string; faculty: string }): Promise<string> {
        // 1. Generate Random Alias Code (e.g. "Silent-Eagle-404")
        const adjectives = ['Silent', 'Brave', 'Hidden', 'Fierce', 'Shadow', 'Iron'];
        const nouns = ['Eagle', 'Tiger', 'Wolf', 'Bear', 'Falcon', 'Panther'];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNumber = Math.floor(Math.random() * 1000);

        const aliasCode = `${randomAdjective}-${randomNoun}-${randomNumber}`;

        // 2. Create Entities using Node's crypto for UUIDs
        const aliasId = crypto.randomUUID();
        const complaintId = crypto.randomUUID();

        const alias = new Alias(aliasId, aliasCode, new Date());

        const complaint = new Complaint(
            complaintId,
            dto.title,
            dto.description,
            dto.faculty,
            'PENDING',
            new Date(),
            aliasId
        );

        // 3. Save to Database via Port (We don't care how it saves it!)
        await this.aliasRepository.saveComplaintWithAlias(complaint, alias);

        // 4. Return the secret code to the user
        return aliasCode;
    }
}
