<div align="center">
  <h1>🛡️ MS-Auth (Authentication Microservice)</h1>
  <p><strong>The Guardian of the AnonyGate Ecosystem</strong></p>
</div>

---

## 📖 What is this microservice?

`ms-auth` is the security core of the entire AnonyGate distributed architecture. It is exclusively responsible for identity management, credential validation, and the issuance of cryptographic tokens (JWT). No external request to the protected microservices can proceed without first passing through the validation of `ms-auth`.

## ✨ Key Features

- **Strong Cryptography:** Uses `Bcrypt` for secure password hashing.
- **Stateless Authentication:** Issuance and validation of JSON Web Tokens (JWT).
- **Modern ORM:** Native integration with **Prisma ORM** for efficient queries and strict typing with PostgreSQL.
- **Role-Based Access Control (RBAC):** Database structured to handle multiple roles (`admin`, `analyst`, etc.).
- **Auto-Seeding:** Capability for automatic injection of initial administrative credentials (`seed.ts`).

---

## 🚀 How to use it? (Endpoints)

All routes pass through the Bastion/Nginx. The public base route is `http://<BASTION_IP>/auth/`.

### 1. Login
Validates the email and password, returning a JWT to be used in the rest of the microservices.

- **Method:** `POST`
- **Route:** `/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "admin@uce.edu.ec",
    "password": "12345"
  }
  ```
- **Successful Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "refresh_token": "eyJhbG..."
  }
  ```

### 2. Renew Token (Refresh)
Generates a new access token before the original one expires.

- **Method:** `POST`
- **Route:** `/auth/refresh`
- **Body (JSON):**
  ```json
  {
    "email": "admin@uce.edu.ec",
    "refresh_token": "eyJhbG..."
  }
  ```

### 3. List Users (Protected VIP Route)
Proof of concept to validate that the JWT Guardian is working correctly. It rejects any request without a valid token.

- **Method:** `GET`
- **Route:** `/auth/users`
- **Required Headers:** `Authorization: Bearer <access_token>`
- **Successful Response (200 OK):**
  ```json
  {
    "message": "Successful connection from Postman!",
    "total": 1,
    "data": [
      {
        "id": "uuid-...",
        "email": "admin@uce.edu.ec"
      }
    ]
  }
  ```

---

## 🛠️ Technologies Used

- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Security:** Passport.js, JWT, Bcrypt
- **Containerization:** Docker & Docker Compose
