# 🚀 LCArean Microservices Platform (Distributed Online Judge)

A production-grade, event-driven microservices architecture for an online judge coding platform (LeetCode clone). Built with **Node.js**, **Express**, **TypeScript**, **React 19**, **RabbitMQ**, **Redis**, **MongoDB**, **PostgreSQL (Prisma)**, **Docker Sandboxing**, **Socket.IO**, and **Razorpay**.

---

## 📐 System Architecture

### 1. High-Level Architecture

The platform follows a decoupled, event-driven microservices pattern with an API Gateway handling request routing and token validation, asynchronous worker queues for code execution, and real-time WebSockets for live execution feedback.

```mermaid
flowchart TD
    subgraph Client Layer
        FE["React 19 Frontend (Vite + Monaco Editor)"]
    end

    subgraph Gateway Layer
        GW["3000 API Gateway\n(Express Proxy + JWT Auth)"]
    end

    subgraph Service Mesh
        AUTH["3004 Auth Service\n(Port 3004)"]
        PROB["3001 Problem Service\n(Port 3001)"]
        SUBM["3002 Submission Service\n(Port 3002)"]
        EVAL["3003 Evaluation Service\n(Worker Node)"]
        PAY["3006 Payment Service\n(Port 3006)"]
        MAIL["3005 Mail Service\n(Port 3005)"]
        SOCK["3007 Sockets Service\n(Port 3007)"]
    end

    subgraph Data & Messaging Infrastructure
        MDB[("MongoDB\n(Problems, Submissions, Users)")]
        PG[("PostgreSQL / Neon\n(Prisma - Transactions)")]
        RDB[("Redis\n(OTP & Session Caching)")]
        RMQ{{"RabbitMQ\nMessage Broker"}}
        S3[("AWS S3\n(User Avatars)")]
    end

    subgraph Sandbox Engine
        DOCKER[["Docker Engine\n(C++, Python, Java Containers)"]]
    end

    %% Client Interactions
    FE -->|HTTP / REST| GW
    FE <-->|WebSockets| SOCK

    %% Gateway Routing
    GW -->|/api/v1/auth| AUTH
    GW -->|/api/v1/problems| PROB
    GW -->|/api/v1/submission| SUBM
    GW -->|/api/v1/payment| PAY

    %% Service Connections
    AUTH --> MDB
    AUTH --> RDB
    AUTH --> S3
    AUTH -.->|OTP Dispatches| MAIL

    PROB --> MDB
    SUBM --> MDB
    PAY --> PG

    %% Async Execution Pipeline
    SUBM -->|1. Publish submission.created| RMQ
    RMQ -->|2. Consume submission.created| EVAL
    EVAL -->|3. Spawn Sandbox Container| DOCKER
    EVAL -->|4. Update Submission Status| SUBM
    EVAL -->|5. Publish submission.completed| RMQ
    RMQ -->|6. Consume submission.completed| SOCK
    SOCK -->|7. Emit submissionCompleted Event| FE
```

---

### 2. Async Submission Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant FE as Frontend (Monaco Editor)
    participant GW as API Gateway (3000)
    participant SUB as Submission Service (3002)
    participant RMQ as RabbitMQ Broker
    participant EV as Evaluation Worker (3003)
    participant DOC as Docker Sandboxing
    participant SOC as Sockets Service (3007)

    User->>FE: Click "Submit Code"
    FE->>GW: POST /api/v1/submission (JWT Cookie/Header)
    GW->>GW: Validate JWT & Inject x-user-id / x-user-role
    GW->>SUB: Forward Payload
    SUB->>SUB: Save Record with Status: "Pending"
    SUB->>RMQ: Publish to Queue: 'submission.created'
    SUB-->>GW: Return { submissionId, status: "Pending" }
    GW-->>FE: HTTP 200 OK

    RMQ->>EV: Consume 'submission.created'
    EV->>DOC: Spin up Container (cpp/python/java) & Exec Testcases
    DOC-->>EV: Return Execution Verdict (Accepted/WA/TLE/CE)
    EV->>SUB: PUT /submission/:id (Update Result & Status)
    EV->>RMQ: Publish to Queue: 'submission.completed'

    RMQ->>SOC: Consume 'submission.completed'
    SOC->>FE: WebSocket Emit: 'submissionCompleted' (payload)
    FE->>User: Display Real-Time Verdict & Benchmark Results
```

---

## 📦 Microservices Directory & Tech Stack

| Service | Directory | Port | Primary Responsibilities | Databases / External Tools |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | [`3000_apiGateway`](file:///d:/NewFolder/web/LCBackend2/3000_apiGateway) | `3000` | Central proxy, CORS, Cookie/JWT verification, header injection | Express, `express-http-proxy`, JWT |
| **Problem Service** | [`3001_problem`](file:///d:/NewFolder/web/LCBackend2/3001_problem) | `3001` | CRUD for problems, test cases, tags, and AI problem generation | MongoDB, OpenAI API |
| **Submission Service** | [`3002_submission`](file:///d:/NewFolder/web/LCBackend2/3002_submission) | `3002` | Submission management, state persistence, RabbitMQ event producer | MongoDB, RabbitMQ (`amqplib`) |
| **Evaluation Worker** | [`3003_evaluation`](file:///d:/NewFolder/web/LCBackend2/3003_evaluation) | `3003` | Code execution engine, container spawning, resource isolation | Docker (`dockerode`), RabbitMQ |
| **Auth Service** | [`3004_authentication`](file:///d:/NewFolder/web/LCBackend2/3004_authentication) | `3004` | Registration, auth, session caching, OTP generation, S3 uploads | MongoDB, Redis, AWS S3 |
| **Mail Service** | [`3005_mail`](file:///d:/NewFolder/web/LCBackend2/3005_mail) | `3005` | Transactional email dispatches, verification codes | Nodemailer |
| **Payment Service** | [`3006_payment`](file:///d:/NewFolder/web/LCBackend2/3006_payment) | `3006` | Premium subscriptions, payment orders, webhooks verification | PostgreSQL (Neon), Prisma, Razorpay |
| **Sockets Service** | [`3007_sockets`](file:///d:/NewFolder/web/LCBackend2/3007_sockets) | `3007` | Real-time WebSocket connections and execution event broadcasts | Socket.IO, RabbitMQ |
| **Frontend UI** | [`frontend`](file:///d:/NewFolder/web/LCBackend2/frontend) | `5173` | Code editor workspace, problem list, user auth, real-time feedback | React 19, Vite, Tailwind CSS, Monaco |

---

## ⚡ Quick Start & Setup Guide

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Docker Desktop / Docker Engine**: Must be running (required for code execution evaluation in `3003_evaluation`)
- **MongoDB**: Running locally (`mongodb://localhost:27017`) or a remote MongoDB Atlas URL
- **Redis**: Running locally (`localhost:6379`) or a remote instance
- **RabbitMQ**: Running locally (`amqp://localhost:5672`) or a CloudAMQP instance
- **PostgreSQL**: Neon DB connection string for Prisma (Payment Service)

---

### Step 1: Clone & Configure Environment

Clone the project and verify the environment configuration file `.env` at the root directory:

```bash
# Verify environment variables in the root directory
ls -la .env
```

The root `.env` file should contain:

```env
# Server Port Configuration
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3004
MAIL_SERVICE_PORT=3005
PROBLEM_SERVICE_PORT=3001
SUBMISSION_SERVICE_PORT=3002
EVALUATION_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3006

# Databases & Caching
MONGODB_URL=mongodb://localhost:27017/leetcode
NEON_DB_URL=postgresql://user:password@ep-sample.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@ep-sample.neon.tech/neondb?sslmode=require
REDIS_HOST=localhost
REDIS_PORT=6379

# Message Queue
RABBITMQ_URL=amqp://localhost

# JWT & Authentication
ACCESS_TOKEN_JWT_KEY=your_access_token_secret
REFRESH_TOKEN_JWT_KEY=your_refresh_token_secret

# Third-Party Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
OPENAI_API_KEY=your_openai_api_key
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password

# Microservice URLs
AUTH_SERVICE_URL=http://localhost:3004
MAIL_SERVICE_URL=http://localhost:3005/api/v1
PROBLEM_SERVICE_URL=http://localhost:3001
SUBMISSION_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3006
```

---

### Step 2: One-Command Installation

Install dependencies for the root orchestrator, all **8 microservices**, and the **frontend** with a single command:

```bash
npm run install:all
```

---

### Step 3: Database Setup & Migration

Push the Prisma schema for the Payment Service to PostgreSQL (Neon):

```bash
npm run prisma:push
```

---

### Step 4: Run Infrastructure Containers (Docker / Docker Desktop)

Ensure **Docker Desktop** (or Docker Engine) is active on your host system.

If running MongoDB, Redis, and RabbitMQ via Docker, you can start them easily:

```bash
# Example Docker run commands for local infra:
docker run -d --name redis -p 6379:6379 redis:latest
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

---

### Step 5: Launch All Microservices & Frontend

Run all backend microservices and the React frontend simultaneously with unified logging:

```bash
npm run dev:all
```

> **Alternatively**, launch services individually in separate terminal windows:
> - API Gateway: `npm run dev:gateway`
> - Auth Service: `npm run dev:auth`
> - Problem Service: `npm run dev:problem`
> - Submission Service: `npm run dev:submission`
> - Evaluation Service: `npm run dev:evaluation`
> - Mail Service: `npm run dev:mail`
> - Payment Service: `npm run dev:payment`
> - Sockets Service: `npm run dev:sockets`
> - Frontend UI: `npm run dev:frontend`

Once running, access the web platform at: **`http://localhost:5173`**

---

## 🛠️ Microservice Endpoint Reference

All client API requests pass through the **API Gateway** (`http://localhost:3000`).

### 1. Authentication (`/api/v1/auth/*`)
- `POST /api/v1/auth/register` - Create user account
- `POST /api/v1/auth/login` - User authentication (returns JWT & sets cookie)
- `POST /api/v1/auth/logout` - Invalidate session
- `POST /api/v1/auth/forgot-password` - Request OTP for password reset
- `POST /api/v1/auth/reset-password` - Reset password via OTP

### 2. Problems (`/api/v1/problems/*`)
- `GET /api/v1/problems` - Fetch list of coding problems
- `GET /api/v1/problems/:id` - Fetch detailed problem specification
- `POST /api/v1/problems` - Create a new problem (Admin only)
- `PUT /api/v1/problems/:id` - Update problem details (Admin only)
- `DELETE /api/v1/problems/:id` - Delete problem (Admin only)

### 3. Submissions (`/api/v1/submission/*`)
- `POST /api/v1/submission` - Submit code snippet for evaluation
- `GET /api/v1/submission/:id` - Fetch submission status & results

### 4. Payments (`/api/v1/payment/*`)
- `POST /api/v1/payment/order` - Create Razorpay payment order
- `POST /api/v1/payment/webhooks/razorpay/paymentCapture` - Razorpay capture webhook

### 5. WebSockets (`ws://localhost:3007`)
- Connect Query Param: `?userId=<USER_ID>`
- Real-Time Event Listened: `submissionCompleted`

---

## 🔒 Security & Sandboxing Architecture

1. **Dockerode Container Isolation**:
   Code evaluations in `3003_evaluation` run inside isolated, ephemeral Docker containers with strict resource bounds (CPU limits, execution timeout constraints, and memory caps) to prevent malicious execution.
2. **JWT & Header Propagation**:
   The API Gateway verifies client JWT tokens upon request, extracts claims, and securely attaches `x-user-id` and `x-user-role` headers to downstream internal service requests.
3. **Decoupled Architecture**:
   Heavy execution loads do not block HTTP request/response loops. RabbitMQ buffers incoming submission spikes seamlessly.

---

## ❓ Troubleshooting & FAQs

- **Docker Connection Error in Evaluation Service**:
  - *Fix*: Ensure Docker Engine is running on your machine. On Linux, grant user access to `/var/run/docker.sock` (`sudo chmod 666 /var/run/docker.sock`).
- **RabbitMQ Connection Timeout**:
  - *Fix*: Verify RabbitMQ service status and confirm `RABBITMQ_URL` in `.env` matches your broker (`amqp://localhost`).
- **Prisma PostgreSQL SSL Errors**:
  - *Fix*: Ensure `?sslmode=require` is present at the end of `NEON_DB_URL` in `.env`.

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).
