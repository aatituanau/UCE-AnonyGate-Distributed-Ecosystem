# MS-10: Audit Trail Service

## Overview
The **Audit Trail Service** is a core component of the AnonyGate Distributed Ecosystem. It acts as the immutable forensic registry for all actions performed within the system.

In compliance with the project's strict academic and security rules, this service implements a private, blockchain-like architecture using **Event Sourcing** and **Hash-Chaining** to prevent any retroactive manipulation of data.

## Architecture
- **Framework:** NestJS 11 (TypeScript)
- **Database:** MongoDB (`DB_AuditLog` & `DB_AuditArchive`)
- **Messaging:** Apache Kafka (`kafkajs`)
- **Patterns Used:**
  - Event Sourcing
  - Append-Only Architecture
  - Cryptographic Hash-Chaining

## Core Mechanics: Hash-Chaining
Every event received by this service is saved in MongoDB. The system enforces an absolute **Append-Only** rule: `UPDATE` and `DELETE` operations are strictly forbidden. 

Each document generates a mathematical hash using `SHA256`. This hash incorporates:
1. The `previousHash` (from the last inserted document).
2. The `eventType`.
3. The JSON `payload`.
4. The `timestamp`.

This guarantees that if an administrator or malicious actor alters a record directly in the database, the subsequent hashes will break, exposing the tampering immediately.

## Kafka Events Consumed
This microservice acts as a global listener. It currently subscribes to:
- `complaint.created` (Published by MS-04 Submission)
- `sanitization.completed` (Published by MS-06 Sanitization)
- `ai.analysis.completed` (Published by MS-07 AI)
- `complaint.status.updated` (Published by MS-08 Status)

## Endpoints
Access to the API is protected by JWT (`JwtAdminGuard`). Only authorized administrators can read the logs.
- `GET /logs`: Retrieves the active event logs.
- `GET /archives`: Retrieves historical events (e.g., closed/rejected cases).

## Environment Variables
```env
PORT=3005
MONGO_URI=mongodb://anonygate:anonygate_pass@localhost:27017/DB_Audit?authSource=admin
KAFKA_BROKERS=localhost:9092
```
