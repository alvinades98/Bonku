# API Guide — Backend

Spesifikasi lengkap REST API Invoice Generator.

---

## Overview

| Item | Detail |
|------|--------|
| **Base URL** | `http://localhost:8080/api/v1` |
| **Auth** | JWT via httpOnly cookie (`jwt`) |
| **Content-Type** | `application/json` |
| **CORS** | Allow origin `http://localhost:3000` |

---

## Authentication

Semua endpoint kecuali `/auth/register` dan `/auth/login` memerlukan autentikasi.

JWT dikirim otomatis via **httpOnly cookie**. Frontend harus set `credentials: 'include'` di setiap request.

### Error: Unauthorized

```json
{
  "message": "Missing authentication token"
}
```

atau

```json
{
  "message": "Invalid or expired token"
}
```

---

## Endpoints

### Auth

#### POST /auth/register

Register user baru.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

| Field | Type | Required | Validasi |
|-------|------|----------|----------|
| `name` | string | ✅ | min: 2, max: 255 |
| `email` | string | ✅ | valid email, max: 255 |
| `password` | string | ✅ | min: 6, max: 255 |

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "company_name": "",
    "company_address": "",
    "company_phone": "",
    "npwp": "",
    "company_logo_path": ""
  }
}
```

**Error (422):**
```json
{
  "message": "Email already registered"
}
```

---

#### POST /auth/login

Login & set JWT cookie.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "company_name": "My Company",
    "company_address": "Jl. Contoh No. 123",
    "company_phone": "081234567890",
    "npwp": "12.345.678.9-012.000",
    "company_logo_path": ""
  }
}
```

**Set-Cookie Header:**
```
Set-Cookie: jwt=<token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400
```

**Error (422):**
```json
{
  "message": "Invalid email or password",
  "errors": {
    "email": ["Email or password is incorrect"]
  }
}
```

---

#### POST /auth/logout

Logout & clear JWT cookie.

**Response (204 No Content):** _(empty body)_

---

#### GET /auth/me

Get current user data. **Protected.**

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "company_name": "My Company",
  "company_address": "Jl. Contoh No. 123",
  "company_phone": "081234567890",
  "npwp": "12.345.678.9-012.000",
  "company_logo_path": ""
}
```

---

### Clients

Semua endpoint clients **Protected**.

#### GET /clients

List semua klien milik user.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "PT Maju Jaya",
    "email": "info@majujaya.com",
    "phone": "081234567890",
    "address": "Jl. Sudirman No. 1, Jakarta",
    "created_at": "2024-05-20T10:00:00Z",
    "updated_at": "2024-05-20T10:00:00Z"
  }
]
```

---

#### GET /clients/:id

Detail klien. **Protected.**

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "PT Maju Jaya",
  "email": "info@majujaya.com",
  "phone": "081234567890",
  "address": "Jl. Sudirman No. 1, Jakarta",
  "created_at": "2024-05-20T10:00:00Z",
  "updated_at": "2024-05-20T10:00:00Z"
}
```

**Error (404):**
```json
{
  "message": "Client not found"
}
```

---

#### POST /clients

Buat klien baru. **Protected.**

**Request Body:**
```json
{
  "name": "PT Teknologi Indonesia",
  "email": "contact@tekindo.com",
  "phone": "081987654321",
  "address": "Jl. Gatot Subroto No. 45, Jakarta"
}
```

| Field | Type | Required | Validasi |
|-------|------|----------|----------|
| `name` | string | ✅ | min: 1, max: 255 |
| `email` | string | ❌ | valid email |
| `phone` | string | ❌ | max: 20 |
| `address` | string | ❌ | max: 1000 |

**Response (201 Created):**
```json
{
  "id": 2,
  "user_id": 1,
  "name": "PT Teknologi Indonesia",
  "email": "contact@tekindo.com",
  "phone": "081987654321",
  "address": "Jl. Gatot Subroto No. 45, Jakarta",
  "created_at": "2024-05-20T11:00:00Z",
  "updated_at": "2024-05-20T11:00:00Z"
}
```

---

#### PUT /clients/:id

Update klien. **Protected.**

**Request Body:** (semua field optional)
```json
{
  "name": "PT Teknologi Indonesia Tbk",
  "phone": "081111222333"
}
```

**Response (200 OK):** Updated client object.

---

#### DELETE /clients/:id

Hapus klien. **Protected.**

**Response (204 No Content):** _(empty body)_

---

### Invoices

Semua endpoint invoices **Protected**.

#### GET /invoices

List invoice dengan pagination & filter.

**Query Parameters:**

| Parameter | Type | Default | Deskripsi |
|-----------|------|---------|-----------|
| `status` | string | — | Filter: `draft`, `sent`, `paid`, `cancelled` |
| `page` | number | 1 | Page number |
| `limit` | number | 50 | Items per page |

**Example:** `GET /invoices?status=draft&page=1&limit=20`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "client_id": 1,
    "invoice_number": "INV-001",
    "issue_date": "2024-05-20T00:00:00Z",
    "due_date": "2024-06-20T00:00:00Z",
    "status": "draft",
    "subtotal": 10000000,
    "tax_percent": 11,
    "tax_amount": 1100000,
    "total": 11100000,
    "notes": "Pembayaran via transfer BCA",
    "client": {
      "id": 1,
      "user_id": 1,
      "name": "PT Maju Jaya",
      "email": "info@majujaya.com",
      "phone": "081234567890",
      "address": "Jl. Sudirman No. 1, Jakarta",
      "created_at": "2024-05-20T10:00:00Z",
      "updated_at": "2024-05-20T10:00:00Z"
    },
    "items": [
      {
        "id": 1,
        "invoice_id": 1,
        "description": "Logo Design",
        "quantity": 1,
        "unit_price": 5000000,
        "amount": 5000000
      },
      {
        "id": 2,
        "invoice_id": 1,
        "description": "UI Design",
        "quantity": 10,
        "unit_price": 500000,
        "amount": 5000000
      }
    ],
    "created_at": "2024-05-20T12:00:00Z",
    "updated_at": "2024-05-20T12:00:00Z"
  }
]
```

---

#### GET /invoices/:id

Detail invoice dengan client & items. **Protected.**

**Response (200 OK):** Single invoice object (sama seperti di list).

**Error (404):**
```json
{
  "message": "Invoice not found"
}
```

---

#### POST /invoices

Buat invoice baru. **Protected.**

**Request Body:**
```json
{
  "client_id": 1,
  "invoice_number": "INV-001",
  "issue_date": "2024-05-20",
  "due_date": "2024-06-20",
  "status": "draft",
  "items": [
    {
      "description": "Logo Design",
      "quantity": 1,
      "unit_price": 5000000,
      "amount": 5000000
    },
    {
      "description": "UI Design",
      "quantity": 10,
      "unit_price": 500000,
      "amount": 5000000
    }
  ],
  "notes": "Pembayaran via transfer BCA",
  "tax_percent": 11
}
```

| Field | Type | Required | Validasi |
|-------|------|----------|----------|
| `client_id` | number | ✅ | must exist & belong to user |
| `invoice_number` | string | ✅ | max: 100 |
| `issue_date` | string | ✅ | date format (YYYY-MM-DD) |
| `due_date` | string | ✅ | date format (YYYY-MM-DD) |
| `status` | string | ❌ | `draft`/`sent`/`paid`/`cancelled` (default: `draft`) |
| `items` | array | ✅ | min: 1 item |
| `items[].description` | string | ✅ | min: 1 |
| `items[].quantity` | number | ✅ | > 0 |
| `items[].unit_price` | number | ✅ | >= 0 |
| `items[].amount` | number | ✅ | >= 0 |
| `notes` | string | ❌ | max: 2000 |
| `tax_percent` | number | ✅ | 0-100 |

**Auto-Calculation:**
- `subtotal` = sum of all `items[].amount`
- `tax_amount` = `subtotal` × `tax_percent` / 100
- `total` = `subtotal` + `tax_amount`

**Response (201 Created):** Full invoice object with calculated values.

---

#### PUT /invoices/:id

Update invoice. **Protected.**

**Request Body:** (semua field optional)
```json
{
  "status": "sent",
  "notes": "Sudah dikirim via email"
}
```

Jika `items` di-update, semua items lama akan di-replace dengan items baru.

**Response (200 OK):** Updated invoice object.

---

#### DELETE /invoices/:id

Soft delete invoice. **Protected.**

**Response (204 No Content):** _(empty body)_

---

#### GET /invoices/:id/pdf

Generate & download PDF invoice. **Protected.**

**Response:** File PDF binary dengan headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=INV-001.pdf
```

---

### Dashboard

#### GET /dashboard/stats

Get dashboard statistics. **Protected.**

**Response (200 OK):**
```json
{
  "total_invoices": 25,
  "outstanding": 10,
  "paid": 15,
  "month_total": 50000000
}
```

| Field | Type | Deskripsi |
|-------|------|-----------|
| `total_invoices` | number | Total semua invoice |
| `outstanding` | number | Invoice dengan status `draft` atau `sent` |
| `paid` | number | Invoice dengan status `paid` |
| `month_total` | number | Total revenue bulan ini (invoice `paid`) |

---

### Health Check

#### GET /health

Public health check endpoint.

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

## Error Response Format

Semua error response menggunakan format yang konsisten:

### General Error
```json
{
  "message": "User-friendly error message"
}
```

### Validation Error (422)
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "name": ["Name must be at least 2 characters"]
  }
}
```

### HTTP Status Codes

| Code | Deskripsi |
|------|-----------|
| `200` | Success (GET, PUT) |
| `201` | Created (POST) |
| `204` | No Content (DELETE) |
| `400` | Bad Request (invalid JSON) |
| `401` | Unauthorized (missing/invalid JWT) |
| `404` | Not Found |
| `422` | Unprocessable Entity (validation error) |
| `500` | Internal Server Error |

---

## cURL Examples

### Register
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create Client (with cookie)
```bash
curl -X POST http://localhost:8080/api/v1/clients \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"PT Maju Jaya","email":"info@majujaya.com"}'
```

### Create Invoice
```bash
curl -X POST http://localhost:8080/api/v1/invoices \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "client_id": 1,
    "invoice_number": "INV-001",
    "issue_date": "2024-05-20",
    "due_date": "2024-06-20",
    "items": [
      {"description": "Web Design", "quantity": 1, "unit_price": 5000000, "amount": 5000000}
    ],
    "tax_percent": 11
  }'
```

### Download PDF
```bash
curl http://localhost:8080/api/v1/invoices/1/pdf \
  -b cookies.txt \
  -o INV-001.pdf
```
