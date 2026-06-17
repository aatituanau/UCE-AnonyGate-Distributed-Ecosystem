# MS-04: Submission Service

## 🎯 Purpose
The Submission Service is the core ingestion engine for anonymous complaints in the AnonyGate ecosystem. It receives user complaints, validates their anonymous alias, stores the data, and triggers asynchronous processing pipelines.

## 🏗️ Architecture: Hexagonal + CQRS
This microservice heavily utilizes **Hexagonal Architecture** (Ports and Adapters) combined with **CQRS**:
- **Commands:** Handle the reception of new complaints (`CreateComplaintCommand`). Commands write to the database and emit events, but never return queried data.
- **Queries:** Handle reading complaint statuses (`GetComplaintQuery`) without causing side effects.
- **Ports & Adapters:** All external dependencies (Database, gRPC, Kafka) are abstracted behind interfaces (Ports).

## ⚙️ Core Integrations
1. **gRPC Client:** Synchronously connects to `ms-alias` to validate the user's alias token in real-time before accepting a complaint.
2. **Apache Kafka (`kafkajs`):** Asynchronously publishes the `complaint.created` event to the message broker, allowing other services (like Sanitization and AI Insight) to process the complaint without blocking the user.
3. **PostgreSQL (Prisma):** Stores the complaints in the `complaints` schema. The payload is stored as `JSONB` to accommodate dynamic forms.

## 🚀 Running Locally
```bash
npm run dev
```
