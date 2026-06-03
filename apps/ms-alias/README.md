<div align="center">
  <h1>🕵️ MS-Alias (Anonymization Microservice)</h1>
  <p><strong>The Privacy Engine of AnonyGate</strong></p>
</div>

---

## 📖 What is this microservice?

`ms-alias` is the heart of the university's anonymous complaint system. Its primary function is to receive sensitive complaint data, hide the identity of the complainant by generating a random "Cryptographic Alias", and store this data extremely fast. To achieve sub-millisecond response times, this microservice strictly uses an in-memory database (Redis).

## ✨ Key Features

- **Unique Alias Generation:** Algorithms to create untraceable anonymous identifiers (e.g. `ANON-9F3B2`).
- **In-Memory Storage (Redis):** Instead of using a slow traditional relational database like PostgreSQL, `ms-alias` relies exclusively on **Redis**. This ensures lightning-fast read/write speeds, which is crucial for high-traffic environments where complaints need to be processed instantly.
- **Hexagonal Architecture (Ports and Adapters):** Strict separation of concerns between Use Cases (Application Layer) and the Database interactions (Infrastructure Layer).
- **Perimeter Protection:** Although it doesn't generate tokens, it validates the JWT sent by `ms-auth` to ensure the user is authorized to submit data.

---

## 🚀 How to use it? (Endpoints)

All routes pass through the Bastion/Nginx. The public base route is `http://<BASTION_IP>/aliases/`.

### 1. Generate Anonymous Complaint
Takes the complaint data, generates the alias, and saves it instantly in Redis.

- **Method:** `POST`
- **Route:** `/aliases/generate`
- **Required Headers:** `Authorization: Bearer <access_token_from_ms_auth>`
- **Body (JSON):**
  ```json
  {
    "title": "Harassment in laboratories",
    "description": "The physics professor asked for favors in exchange for grades.",
    "faculty": "Engineering"
  }
  ```
- **Successful Response (201 Created):**
  ```json
  {
    "message": "Complaint successfully saved. Please save your secret alias.",
    "alias": "ANON-8X9P1"
  }
  ```

### 2. Check Complaint Status
Allows a student to review the status of their complaint using only their secret alias.

- **Method:** `GET`
- **Route:** `/aliases/{your_secret_alias}/status`
- **Example Route:** `/aliases/ANON-8X9P1/status`
- **Successful Response (200 OK):**
  ```json
  {
    "alias": "ANON-8X9P1",
    "status": "PENDING",
    "faculty": "Engineering",
    "submittedAt": "2026-06-03T18:00:00Z"
  }
  ```

---

## 🛠️ Technologies Used

- **Framework:** NestJS
- **Design Pattern:** Hexagonal Architecture
- **In-Memory Database:** Redis 
- **Security Validation:** JWT validation
- **Containerization:** Docker & Docker Compose
