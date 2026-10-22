# SuperAdmin System Documentation

## Overview
Your EverZone backend now includes a complete **superadmin system** with role-based access control. A superadmin can create, edit, and delete all resources (categories, services, projects) and manage contact form submissions.

---

## 🔐 Authentication System

### Default Superadmin Account
No hard-coded default account exists. On first startup, when the `admins` table
is empty, a superadmin is seeded from the `ADMIN_USERNAME`, `ADMIN_EMAIL` and
`ADMIN_PASSWORD` environment variables (skipped if `ADMIN_PASSWORD` is empty).
Alternatively call `POST /api/admin/register` while no admin exists.

### Login
Get a JWT token to access protected admin endpoints. Token expires in 24 hours.

**Endpoint:** `POST /api/admin/login`

**Request:**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "<your ADMIN_PASSWORD>"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "superadmin",
      "email": "admin@everzone.com",
      "role": "superadmin"
    }
  }
}
```

**Response (Invalid Credentials):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

## 📦 Category Management

### Create Category
**Endpoint:** `POST /api/admin/categories`

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request:**
```bash
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Cloud Services",
    "description": "AWS, Azure, GCP solutions"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 3,
    "name": "Cloud Services",
    "description": "AWS, Azure, GCP solutions",
    "created_at": "2026-02-27T21:58:00.000Z",
    "updated_at": "2026-02-27T21:58:00.000Z"
  }
}
```

### Update Category
**Endpoint:** `PUT /api/admin/categories/:id`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/categories/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Cloud & DevOps",
    "description": "Cloud infrastructure and DevOps services"
  }'
```

### Delete Category
**Endpoint:** `DELETE /api/admin/categories/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/admin/categories/3 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💼 Service Management

### Create Service
**Endpoint:** `POST /api/admin/services`

**Request:**
```bash
curl -X POST http://localhost:5000/api/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "API Development",
    "description": "RESTful and GraphQL API development",
    "image": "https://example.com/api.jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id": 2,
    "title": "API Development",
    "description": "RESTful and GraphQL API development",
    "image": "https://example.com/api.jpg",
    "created_at": "2026-02-27T21:58:00.000Z",
    "updated_at": "2026-02-27T21:58:00.000Z"
  }
}
```

### Update Service
**Endpoint:** `PUT /api/admin/services/:id`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/services/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Web API Development",
    "description": "Build scalable REST and GraphQL APIs",
    "image": "https://example.com/api-new.jpg"
  }'
```

### Delete Service
**Endpoint:** `DELETE /api/admin/services/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/admin/services/2 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🏗️ Project Management

### Create Project
**Endpoint:** `POST /api/admin/projects`

**Request:**
```bash
curl -X POST http://localhost:5000/api/admin/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "E-Commerce Platform",
    "title": "Enterprise Shopping Solution",
    "category_id": 1,
    "location": "Singapore",
    "duration": "6 months",
    "area": "20,000 sqm",
    "description": "Full-stack e-commerce with inventory management",
    "image": "https://example.com/ecommerce.jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 1,
    "name": "E-Commerce Platform",
    "title": "Enterprise Shopping Solution",
    "category_id": 1,
    "location": "Singapore",
    "duration": "6 months",
    "area": "20,000 sqm",
    "description": "Full-stack e-commerce with inventory management",
    "image": "https://example.com/ecommerce.jpg",
    "created_at": "2026-02-27T21:58:00.000Z",
    "updated_at": "2026-02-27T21:58:00.000Z"
  }
}
```

### Update Project
**Endpoint:** `PUT /api/admin/projects/:id`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/projects/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "E-Commerce Platform v2",
    "title": "Advanced Shopping Solution",
    "category_id": 1,
    "location": "Singapore",
    "duration": "9 months",
    "area": "25,000 sqm",
    "description": "Enhanced e-commerce with AI recommendations",
    "image": "https://example.com/ecommerce-v2.jpg"
  }'
```

### Delete Project
**Endpoint:** `DELETE /api/admin/projects/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/admin/projects/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Contact Form Management

### Get All Contact Forms
**Endpoint:** `GET /api/admin/contact-forms`

**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/contact-forms \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Contact forms fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "message": "Interested in web services",
      "status": "pending",
      "time": "2026-02-27T20:00:00.000Z",
      "created_at": "2026-02-27T20:00:00.000Z"
    }
  ]
}
```

### Update Contact Form Status
**Endpoint:** `PUT /api/admin/contact-forms/:id/status`

**Valid Statuses:** `pending`, `reviewed`, `responded`, `archived`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/contact-forms/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "responded"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Contact form status updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "Interested in web services",
    "status": "responded",
    "time": "2026-02-27T20:00:00.000Z",
    "created_at": "2026-02-27T20:00:00.000Z"
  }
}
```

### Delete Contact Form
**Endpoint:** `DELETE /api/admin/contact-forms/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/admin/contact-forms/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔑 Security Features

✅ **Password Hashing:** All admin passwords are securely hashed with bcryptjs (10 salt rounds)

✅ **JWT Authentication:** All protected endpoints require valid JWT token with 24-hour expiration

✅ **Role-Based Access:** Only superadmin role users can access admin endpoints

✅ **Input Validation:** All inputs are validated before processing

✅ **Rate Limiting:** API rate limiters protect against abuse

✅ **HTTPS Ready:** All credentials transmitted securely

---

## 📝 Error Handling

### Missing Token
```json
{
  "success": false,
  "message": "Access token required. Please login."
}
```

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or malformed token"
}
```

### Token Expired
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

### Unauthorized (Not Superadmin)
```json
{
  "success": false,
  "message": "Only superadmins can perform this action"
}
```

### Resource Not Found
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

## 🚀 Quick Start

### Step 1: Start Server
The default superadmin account is automatically created on startup.
```bash
cd everzone-api
npm run dev
```

### Step 2: Login to Get Token
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "<your ADMIN_PASSWORD>"
  }'
```

### Step 3: Use Token for All Admin Operations
```bash
# Save token from login response
TOKEN="your_token_here"

# Create a category
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"New Category","description":"Description here"}'
```

---

## 📱 Frontend Integration

When integrating with your React frontend, store the JWT token and include it in all admin API requests:

```javascript
// Login
const response = await fetch('http://localhost:5000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    username: 'superadmin', 
    password: 'SecurePassword123!' 
  })
});

const { data: { token } } = await response.json();
localStorage.setItem('adminToken', token);

// Use token for protected requests
const createCategory = async (categoryData) => {
  const token = localStorage.getItem('adminToken');
  return fetch('http://localhost:5000/api/admin/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(categoryData)
  });
};
```

---

## 🔍 Database Schema

### admins table
```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'superadmin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✨ Features Summary

| Feature | Status |
|---------|--------|
| Default Superadmin Account | ✅ |
| Authentication (JWT) | ✅ |
| Category CRUD | ✅ |
| Service CRUD | ✅ |
| Project CRUD | ✅ |
| Contact Form Management | ✅ |
| Password Hashing (bcryptjs) | ✅ |
| Role-Based Access | ✅ |
| Input Validation | ✅ |
| Error Handling | ✅ |
| Rate Limiting | ✅ |
| Audit Logging (last_login) | ✅ |
| Auto-Created on Startup | ✅ |

---

**Your superadmin system is ready to deploy! 🎉**
