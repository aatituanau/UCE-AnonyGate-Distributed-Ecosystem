# MS-09: Admin & Backoffice Service

## 🎯 Purpose
The Admin Service is responsible for managing the backoffice operations of the AnonyGate ecosystem. It handles Analyst and Administrator role management, advanced complaint tracking, and institutional integrations.

## 🏗️ Architecture: CQRS + Layered
This microservice uses a **CQRS** pattern built on top of a standard **Layered Architecture**. This ensures that the heavy read operations for the Analyst dashboards are isolated from the critical write operations of user and role management.

## 🔐 Security & RBAC
All routes are secured using JWT validation. Strict Role-Based Access Control (RBAC) ensures that only users with the `admin` or `analyst` roles can access sensitive endpoints.

## 🌐 SOAP Integration (Legacy Systems)
This microservice exposes a SOAP/XML endpoint. **Why SOAP?** 
As part of the academic requirements (Req #15), the ecosystem must demonstrate integration capabilities with legacy institutional systems. 

> [!IMPORTANT]
> **SOAP is NEVER used for internal communication between AnonyGate microservices.** All internal communication uses modern protocols (gRPC, Kafka, REST). The SOAP endpoint is strictly an external-facing interface designed *only* to simulate integration with legacy external systems, such as the old "UCE Institutional Directory," to verify if an Analyst is an active employee.

## 🚀 Running Locally
```bash
npm run dev
```
