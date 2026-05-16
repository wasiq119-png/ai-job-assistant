# AI Job Assistant - Project Overview

## 1. Tech Stack
The application uses a decoupled, modern architecture separating the frontend client from the RESTful backend API.

### Backend
* **Language:** Java 17
* **Framework:** Spring Boot 3.5.13
* **Security:** Spring Security 6 with custom JSON Web Tokens (JWT)
* **Core Libraries:** 
  * `Spring Data JPA` (ORM)
  * `Spring Web` (REST Controllers)
  * `Spring AI` (LLM Orchestration)
  * `Apache PDFBox` & `Apache POI` (Document parsing for PDF, DOCX, DOC)
  * `spring-dotenv` (Secure environment variable management)

### Frontend
* **Framework:** React 18 
* **Build Tool:** Vite
* **Core Libraries:** `react-markdown` (for rendering structured AI responses)

---

## 2. Database Schema & Connection Method
* **Database Engine:** PostgreSQL
* **Connection Method:** JDBC via Hibernate (`org.hibernate.dialect.PostgreSQLDialect`). 
* **DDL Strategy:** `update` (auto-syncs schema based on Java entities).

### `User` Table (Authentication)
| Column | Type | Details |
| :--- | :--- | :--- |
| `id` | `Long` | Primary Key, Auto-Increment |
| `email` | `String` | Unique, Not Null (Used as username) |
| `password` | `String` | Hashed via BCrypt, Not Null |
| `name` | `String` | User's display name |
| `createdAt` | `LocalDateTime` | Auto-generated on persist |

### `AnalysisReport` Table (Job Matches)
| Column | Type | Details |
| :--- | :--- | :--- |
| `id` | `Long` | Primary Key, Auto-Increment |
| `jobTitle` | `String` | `VARCHAR` |
| `matchScore` | `Integer` | Computed fuzzy Jaccard similarity score (0-100) |
| `missingSkills` | `String` | `@Lob`, length=5000 (Stores AI tip analysis) |
| `coverLetter` | `String` | `@Lob`, `TEXT` (Stores generated cover letter) |
| `user_id` | `Long` | Foreign Key (`ManyToOne` relationship to `User`) |
| `createdAt` | `LocalDateTime` | Auto-generated on persist |

---

## 3. Key API Endpoints
All endpoints are cross-origin enabled (`http://localhost:5173`).

### Public Authentication Endpoints (`/api/auth/**`)
| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| **POST** | `/login` | Authenticates user, returns JWT VIP pass. | `{"email", "password"}` |
| **POST** | `/signup` | Hashes password, creates new User in DB. | `{"name", "email", "password"}` |

### Secured Core Endpoints (`/api/ai/**`)
*Requires `Authorization: Bearer <JWT>` header.*

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| **POST** | `/analyze` | Extracts text, calls AI for math/match analysis, saves report. | `multipart/form-data`: `jobFile`, `resumeFile` |
| **GET** | `/history` | Retrieves previously generated reports (tied to the user). | None |
| **DELETE** | `/history/{id}`| Deletes a specific analysis report. | Path variable `id` |
| **POST** | `/cover-letter`| Regenerates tailored cover letter from uploaded files. | `multipart/form-data`: `jobFile`, `resumeFile`, `reportId` (opt) |

---

## 4. External Integrations
* **Authentication:** Custom JWT stateless authentication managed by Spring Security. Passwords are mathematically hashed via `BCryptPasswordEncoder`. All core endpoints are guarded by an `AuthTokenFilter`.
* **LLM Provider:** **Groq** (via OpenAI-compatible endpoint).
* **Model Used:** `llama-3.1-8b-instant` (Extremely fast, open-source model).

---

## 5. Environment Variables
Sensitive data is abstracted away from the source code and securely loaded into Spring Boot using `spring-dotenv`.

To run this project, you must create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/ai_job_assistant
DB_USERNAME=postgres
DB_PASSWORD=your_db_password

# AI / LLM Configuration
GROQ_API_KEY=your_groq_api_key_here

# JWT Configuration
# Must be a complex, secure string used to digitally sign authentication tokens
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
