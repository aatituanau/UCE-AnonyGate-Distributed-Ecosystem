# AnonyGate UCE Distributed Ecosystem

## 🛡️ Project Overview
AnonyGate is an academic research prototype developed for the Central University of Ecuador (UCE). Its primary goal is to provide a technically secure, fully anonymous channel for internal whistleblowing and complaints. 

The system guarantees technical anonymity by cryptographically separating the user's identity from the submitted evidence. It leverages modern distributed systems patterns across 10 microservices deployed on AWS.

## 🏗️ Architecture
This ecosystem is built using a Monorepo approach (Turborepo) and implements the following core architectural patterns:
- **Microservices Architecture:** 10 independent services.
- **Event-Driven Architecture (EDA):** Powered by Apache Kafka.
- **CQRS (Command Query Responsibility Segregation):** Separating read and write workloads.
- **Hexagonal Architecture (Ports & Adapters):** Ensuring decoupling of business logic from infrastructure.
- **Polyglot Persistence:** Utilizing PostgreSQL, MongoDB, and Redis.

## 🚀 Microservices Landscape
The project consists of multiple specialized microservices, including:
- **MS-01: Auth Service** (PostgreSQL) - JWT authentication and RBAC.
- **MS-02: Alias Service** (Redis) - Synchronous alias validation via gRPC.
- **MS-04: Submission Service** (PostgreSQL) - Complaint ingestion, CQRS, and Kafka event publishing.
- **MS-09: Admin Service** (PostgreSQL) - Backoffice management and SOAP integration (strictly for external legacy systems).

## 🛠️ Tech Stack
- **Backend:** NestJS 11, TypeScript, Prisma ORM.
- **Messaging & Sync:** Apache Kafka, gRPC, REST (Internal) / SOAP (External Legacy Integration only).
- **Frontend Ecosystem:** React 19 + Vite (Web), React Native (Mobile), Electron (Desktop).
- **Infrastructure:** Docker, Terraform, GitHub Actions (CI/CD), AWS EC2.