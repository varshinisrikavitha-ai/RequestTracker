# Backend — Online Request Status Tracker

Production-quality REST API built with **Node.js + Express + PostgreSQL + Prisma**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Running the Server](#running-the-server)
6. [API Reference](#api-reference)
7. [Authentication](#authentication)
8. [Frontend Integration](#frontend-integration)
9. [File Uploads](#file-uploads)
10. [Seed Accounts](#seed-accounts)

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| PostgreSQL | ≥ 14 |
| npm | ≥ 9 |

---

## Installation

```bash
cd backend
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` (already created) and update the values:

```dotenv
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/request_tracker_db?schema=public"
JWT_SECRET=change_this_to_a_long_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
CLIENT_URL=http://localhost:5173
```

> **Security:** Never commit `.env` to version control. Generate a strong `JWT_SECRET` with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## Database Setup

### 1. Create the database

```sql
CREATE DATABASE request_tracker_db;
```

### 2. Run migrations

```bash
npm run db:migrate        # development (creates migration files)
npm run db:migrate:prod   # production (applies existing migrations)
```

### 3. Generate Prisma client

```bash
npm run db:generate
```

### 4. Seed initial data

```bash
npm run db:seed
```

### 5. (Optional) Open Prisma Studio

```bash
npm run db:studio
```

---

## Running the Server

```bash
npm run dev   # development (nodemon hot-reload)
npm start     # production
```

The server starts at `http://localhost:5000`.

**Health check:**
```
GET http://localhost:5000/health
```

---

## API Reference

All API routes are prefixed with `/api`.

### Standard Response Shape

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Paginated responses include:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

---

### 1️⃣ Auth `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login and receive JWT |
| GET | `/auth/me` | ✅ | Get current user profile |

**POST /auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Secret@123",
  "role": "STAFF",
  "departmentId": "clxxx..."
}
```

**POST /auth/login**
```json
{ "email": "john@example.com", "password": "Secret@123" }
```
Response includes `token` — send this as `Authorization: Bearer <token>`.

---

### 2️⃣ Admin `/api/admin` *(ADMIN only)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/departments` | Create department |
| GET | `/admin/departments` | List departments (paginated) |
| GET | `/admin/departments/:id` | Get department by ID |
| PUT | `/admin/departments/:id` | Update department |
| DELETE | `/admin/departments/:id` | Delete department |
| POST | `/admin/categories` | Create category |
| GET | `/admin/categories` | List categories (paginated, filterable by `?departmentId=`) |
| GET | `/admin/categories/:id` | Get category by ID |
| PUT | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete category |
| GET | `/admin/users` | List users (search, filter by role/dept) |
| GET | `/admin/users/:id` | Get user by ID |
| POST | `/admin/users` | Create user |
| PUT | `/admin/users/:id` | Update user (role, dept, active status, password) |
| DELETE | `/admin/users/:id` | Delete user |

---

### 3️⃣ Requests `/api/requests`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/requests` | ✅ | Create request (multipart/form-data + optional `attachment` file) |
| GET | `/requests` | ✅ | List requests (see filters below) |
| GET | `/requests/:id` | ✅ | Get single request with full status history |
| PUT | `/requests/:id` | ✅ | Update request (creator only, SUBMITTED status) |
| DELETE | `/requests/:id` | ✅ | Delete request (creator only, SUBMITTED; or ADMIN) |

**Query filters for GET /requests:**

| Param | Values | Description |
|-------|--------|-------------|
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 10, max 100) |
| `status` | SUBMITTED \| UNDER_REVIEW \| APPROVED \| REJECTED \| PROCESSING \| COMPLETED | Filter by status |
| `priority` | LOW \| MEDIUM \| HIGH \| CRITICAL | Filter by priority |
| `departmentId` | cuid | Filter by department (ADMIN only) |
| `categoryId` | cuid | Filter by category |
| `search` | string | Full-text search on title/description |
| `sortBy` | createdAt \| updatedAt \| priority \| status | Sort field |
| `order` | asc \| desc | Sort direction |

---

### 4️⃣ Status Tracking `/api/requests/:id`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/requests/:id/status` | ✅ | ADMIN, DEPARTMENT_HEAD | Update request status |
| GET | `/requests/:id/status-history` | ✅ | All | Get full status history |

**POST /requests/:id/status**
```json
{
  "status": "UNDER_REVIEW",
  "comment": "We have received your request and it is being reviewed."
}
```

**Status transition rules:**

```
SUBMITTED → UNDER_REVIEW or REJECTED
UNDER_REVIEW → APPROVED or REJECTED
APPROVED → PROCESSING
PROCESSING → COMPLETED
REJECTED → (terminal)
COMPLETED → (terminal)
```

---

### 5️⃣ Reports `/api/reports` *(ADMIN, DEPARTMENT_HEAD)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/requests-summary` | Total, by-status, by-priority breakdown |
| GET | `/reports/department-performance` | Per-department completion rates |
| GET | `/reports/monthly` | Last 12 months trend data |

---

### 6️⃣ Notifications `/api/notifications`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/notifications` | ✅ | All | Get your notifications (paginated, filterable by `?read=true/false`) |
| POST | `/notifications` | ✅ | ADMIN | Create notification for a user |
| POST | `/notifications/mark-read` | ✅ | All | Mark notifications as read (send `notificationIds[]` or empty for all) |
| DELETE | `/notifications/:id` | ✅ | Owner | Delete a notification |

---

### 7️⃣ Dashboard `/api/dashboard`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/dashboard/admin` | ✅ | ADMIN | Global statistics + recent activity |
| GET | `/dashboard/user` | ✅ | All | Personal statistics + recent requests |

---

## Authentication

Send the JWT in every protected request header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role permissions matrix

| Resource | ADMIN | DEPARTMENT_HEAD | STAFF | VIEWER |
|----------|-------|-----------------|-------|--------|
| Admin panel | ✅ | ❌ | ❌ | ❌ |
| All requests | ✅ | Own dept only | Own only | Own only |
| Update status | ✅ | Own dept only | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |
| Notifications | ✅ Send & receive | Receive | Receive | Receive |

---

## Frontend Integration

Replace `mockData.js` calls with `axios` or `fetch`:

```js
// src/api/axiosClient.js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

**Auth example:**
```js
const { data } = await api.post('/auth/login', { email, password });
localStorage.setItem('token', data.data.token);
```

**Fetch requests example:**
```js
// Was: mockData.requests
const { data } = await api.get('/requests', {
  params: { page: 1, limit: 10, status: 'SUBMITTED' }
});
// data.data  → array of requests
// data.pagination → { total, page, totalPages, ... }
```

**Create request with file:**
```js
const form = new FormData();
form.append('title', title);
form.append('description', description);
form.append('priority', 'HIGH');
form.append('categoryId', categoryId);
form.append('departmentId', departmentId);
form.append('attachment', fileInput.files[0]); // optional

await api.post('/requests', form, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## File Uploads

Uploaded files are stored in `backend/uploads/` and served at:
```
GET http://localhost:5000/uploads/<filename>
```

Allowed types: PDF, Word (.doc/.docx), JPEG, PNG, GIF, WEBP, TXT  
Max size: configurable via `MAX_FILE_SIZE_MB` (default 10 MB)

---

## Seed Accounts

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@requesttracker.com | Admin@123 |
| Dept Head | ithead@requesttracker.com | Head@123 |
| Staff | staff@requesttracker.com | Staff@123 |
