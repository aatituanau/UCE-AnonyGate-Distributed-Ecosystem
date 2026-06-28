# MS-03: Dynamic Forms (ms-forms)

## General Description

The **Dynamic Forms Microservice** (MS-03) is responsible for managing the structural JSON schemas for complaints within the AnonyGate ecosystem. It provides a **GraphQL** interface so administrators can create, visualize, and modify the structure of the forms that users fill out anonymously.

## Architecture and Technologies

This microservice strictly complies with the UCE-AnonyGate ecosystem guidelines:

- **Architecture:** Layered (MVC) adapted for GraphQL.
- **Framework:** NestJS 11
- **API:** GraphQL (Code-first with `@nestjs/graphql` and Apollo Server).
- **Database:** MongoDB (storing dynamic documents and schemaless data).
- **ORM:** Mongoose
- **Port:** `3004` (or injected via environment variables).
- **Target Infrastructure (AWS):** `EC2-2` (MS-Core) with the database on `EC2-7`.

## Implemented Design Patterns

- **Resolver Pattern:** Use of GraphQL Resolvers instead of REST Controllers to expose Queries and Mutations.
- **Data Transfer Objects (DTO):** Strict definition of Inputs and return types (Args and ObjectTypes) for GraphQL.
- **Dependency Injection:** Injection of services (Service Layer) and repositories (Mongoose Models).

## Prerequisites (Environment Variables)

Create a `.env` file based on `.env.example`:

```env
PORT=3004
MONGO_URI=mongodb://anonygate:anonygate_pass@localhost:27017/DB_Forms?authSource=admin
```

## Supported GraphQL Operations

You can access the interactive GraphQL Playground by running the project in development mode and navigating to: `http://localhost:3004/graphql`.

### 1. Create a Form (Mutation)
```graphql
mutation {
  createForm(createFormData: {
    title: "Grades Complaint",
    description: "Form to report grade irregularities",
    schema: "{\"type\":\"object\",\"properties\":{\"teacher\":{\"type\":\"string\"}}}",
    createdBy: "admin@uce.edu.ec"
  }) {
    id
    title
    version
  }
}
```

### 2. List Forms (Query)
```graphql
query {
  forms {
    id
    title
    description
    version
    isActive
  }
}
```

## Running in Development

1. Start MongoDB locally (via Docker):
```bash
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=anonygate -e MONGO_INITDB_ROOT_PASSWORD=anonygate_pass mongo:7.0
```
2. Install dependencies and start:
```bash
npm install
npm run dev
```

## Docker and CI/CD

The microservice is packaged using a **Docker multi-stage build** in `apps/ms-forms/Dockerfile`. The `cd-apps.yml` pipeline compiles and pushes it to GHCR automatically on pushes to `QA` or `main`.
