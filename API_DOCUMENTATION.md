# EverZone Backend - Complete API Documentation

## Base URL
```
http://localhost:5000
```

---

## 🔐 Authentication Summary

| Operation | Route | Authentication | Example |
|-----------|-------|-----------------|---------|
| **GET** (Read) | `/api/services`, `/api/categories`, `/api/projects`, `/api/contact-forms` | ✅ **Public** - No token needed | `GET /api/services` |
| **POST** (Create) | `/api/admin/services`, `/api/admin/categories`, `/api/admin/projects` | ⚡ **Admin Only** - Token required | `POST /api/admin/services` |
| **PUT** (Update) | `/api/admin/services/:id`, `/api/admin/categories/:id`, `/api/admin/projects/:id` | ⚡ **Admin Only** - Token required | `PUT /api/admin/services/1` |
| **DELETE** (Delete) | `/api/admin/services/:id`, `/api/admin/categories/:id`, `/api/admin/projects/:id` | ⚡ **Admin Only** - Token required | `DELETE /api/admin/services/1` |
| **POST** Contact Form | `/api/contact-forms` | ✅ **Public** - No token needed | `POST /api/contact-forms` |
| **Admin Login** | `/api/admin/login` | Public | `POST /api/admin/login` |

### ⚠️ Important Rules:
- ✅ **Only GET requests are public** - Anyone can read services, categories, projects, contact forms
- ⚡ **All CREATE/UPDATE/DELETE require admin token** - Only superadmin can modify data
- ✅ **Contact form submission is public** - Anyone can submit (but not delete/edit)

### To perform admin operations:
1. **Login:** `POST /api/admin/login` with username and password → Get JWT token
2. **Use token:** Add header `Authorization: Bearer <token>` to all admin requests
3. **Use `/api/admin/` routes:** All write operations (POST/PUT/DELETE) go through admin routes
4. **Token expires:** 24 hours

---

## Table of Contents
1. [Health Check](#health-check)
2. [Services](#services)
3. [Categories](#categories)
4. [Projects](#projects)
5. [Contact Forms](#contact-forms)
6. [Admin System](#admin-system)
7. [Response Format](#response-format)
8. [Testing Examples](#testing-examples)

---

## Health Check

### Check Server Status
**Endpoint:** `GET /health`

**Description:** Verify if the server is running

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-28T10:30:00.000Z"
}
```

---

## Services

### Get All Services
**Endpoint:** `GET /api/services`

**Description:** Retrieve all services

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Web Design",
      "description": "Professional web design services",
      "image": "https://example.com/web-design.jpg",
      "created_at": "2026-02-28T10:00:00.000Z",
      "updated_at": "2026-02-28T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Mobile App",
      "description": "Custom mobile applications",
      "image": "https://example.com/mobile-app.jpg",
      "created_at": "2026-02-28T10:05:00.000Z",
      "updated_at": "2026-02-28T10:05:00.000Z"
    }
  ],
  "message": "Services fetched successfully"
}
```

---

### Get Service by ID
**Endpoint:** `GET /api/services/:id`

**Parameters:**
- `id` (path) - Service ID (required)

**Example:** `GET /api/services/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Web Design",
    "description": "Professional web design services",
    "image": "https://example.com/web-design.jpg",
    "created_at": "2026-02-28T10:00:00.000Z",
    "updated_at": "2026-02-28T10:00:00.000Z"
  },
  "message": "Service fetched successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Service not found"
}
```

---

### Create Service
**Endpoint:** `POST /api/admin/services` ⚡ **REQUIRES ADMIN TOKEN**

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Web Design",
  "description": "Professional web design services",
  "image": "https://example.com/web-design.jpg"
}
```

**Required Fields:**
- `title` (string) - Service title
- `description` (string) - Service description

**Optional Fields:**
- `image` (string) - Image URL

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Web Design",
    "description": "Professional web design services",
    "image": "https://example.com/web-design.jpg",
    "created_at": "2026-02-28T10:00:00.000Z",
    "updated_at": "2026-02-28T10:00:00.000Z"
  },
  "message": "Service created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Title and description are required"
}
```

---

### Update Service
**Endpoint:** `PUT /api/admin/services/:id` ⚡ **REQUIRES ADMIN TOKEN**

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Parameters:**
- `id` (path) - Service ID (required)

**Request Body:**
```json
{
  "title": "Web Design Pro",
  "description": "Advanced web design services",
  "image": "https://example.com/web-design-pro.jpg"
}
```

**Notes:** All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Web Design Pro",
    "description": "Advanced web design services",
    "image": "https://example.com/web-design-pro.jpg",
    "created_at": "2026-02-28T10:00:00.000Z",
    "updated_at": "2026-02-28T10:30:00.000Z"
  },
  "message": "Service updated successfully"
}
```

---

### Delete Service
**Endpoint:** `DELETE /api/admin/services/:id` ⚡ **REQUIRES ADMIN TOKEN**

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parameters:**
- `id` (path) - Service ID (required)

**Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## Categories

### Get All Categories
**Endpoint:** `GET /api/categories`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Commercial",
      "description": "Commercial projects",
      "created_at": "2026-02-28T10:00:00.000Z",
      "updated_at": "2026-02-28T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Residential",
      "description": "Residential projects",
      "created_at": "2026-02-28T10:05:00.000Z",
      "updated_at": "2026-02-28T10:05:00.000Z"
    }
  ],
  "message": "Categories fetched successfully"
}
```

---

### Get Category by ID
**Endpoint:** `GET /api/categories/:id`

**Parameters:**
- `id` (path) - Category ID (required)

**Example:** `GET /api/categories/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Commercial",
    "description": "Commercial projects",
    "created_at": "2026-02-28T10:00:00.000Z",
    "updated_at": "2026-02-28T10:00:00.000Z"
  },
  "message": "Category fetched successfully"
}
```

---

### Create Category
**Endpoint:** `POST /api/admin/categories` ⚡ **REQUIRES ADMIN TOKEN**

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Commercial",
  "description": "Commercial building projects"
}
```

**Required Fields:**
- `name` (string) - Category name (must be unique)

**Optional Fields:**
- `description` (string) - Category description

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Commercial",
    "description": "Commercial building projects",
    "created_at": "2026-02-28T10:00:00.000Z",
    "updated_at": "2026-02-28T10:00:00.000Z"
  },
  "message": "Category created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Category name already exists"
}
```

---

### Update Category
**Endpoint:** `PUT /api/admin/categories/:id` ⚡ **REQUIRES ADMIN TOKEN**

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Parameters:**
- `id` (path) - Category ID (required)

**Request Body:**
```json
{
  "name": "Commercial Buildings",
  "description": "Large commercial building projects"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Commercial Buildings",
    "description": "Large commercial building projects",
    "created_at": "2026-02-28T10:00:00.000Z",
    "updated_at": "2026-02-28T10:30:00.000Z"
  },
  "message": "Category updated successfully"
}
```

---

### Delete Category
**Endpoint:** `DELETE /api/admin/categories/:id` ⚡ **REQUIRES ADMIN TOKEN**

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parameters:**
- `id` (path) - Category ID (required)

**Note:** Deleting a category will cascade delete all projects in that category.

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Projects

### Get All Projects
**Endpoint:** `GET /api/projects`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Downtown Plaza",
      "title": "Modern Shopping Complex",
      "category_id": 1,
      "category_name": "Commercial",
      "location": "New York, USA",
      "duration": "12 months",
      "area": "50,000 sq ft",
      "description": "A modern shopping complex with retail spaces",
      "image": "https://example.com/project1.jpg",
      "created_at": "2026-02-28T10:00:00.000Z",
      "updated_at": "2026-02-28T10:00:00.000Z"
    }
  ],
  "message": "Projects fetched successfully"
}
```

---

### Get Project by ID
**Endpoint:** `GET /api/projects/:id`

**Parameters:**
- `id` (path) - Project ID (required)

**Example:** `GET /api/projects/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Downtown Plaza",
    "title": "Modern Shopping Complex",
    "category_id": 1,
    "category_name": "Commercial",
    "location": "New York, USA",
    "duration": "12 months",
    "area": "50,000 sq ft",
    "description": "A modern shopping complex with retail spaces",
    "image": "https://example.com/project1.jpg",
    "created_at": "2026-02-28T10:00:00.000Z",
    "updated_at": "2026-02-28T10:00:00.000Z"
  },
  "message": "Project fetched successfully"
}
```

---

### Get Projects by Category
**Endpoint:** `GET /api/projects/category/:categoryId`

**Parameters:**
- `categoryId` (path) - Category ID (required)

**Example:** `GET /api/projects/category/1`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Downtown Plaza",
      "title": "Modern Shopping Complex",
      "category_id": 1,
      "category_name": "Commercial",
      "location": "New York, USA",
      "duration": "12 months",
      "area": "50,000 sq ft",
      "description": "A modern shopping complex with retail spaces",
      "image": "https://example.com/project1.jpg",
      "created_at": "2026-02-28T10:00:00.000Z",
      "updated_at": "2026-02-28T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Tech Park",
      "title": "Office Complex",
      "category_id": 1,
      "category_name": "Commercial",
      "location": "San Francisco, USA",
      "duration": "18 months",
      "area": "100,000 sq ft",
      "description": "State-of-the-art office complex",
      "image": "https://example.com/project2.jpg",
      "created_at": "2026-02-28T10:05:00.000Z",
      "updated_at": "2026-02-28T10:05:00.000Z"
    }
  ],
  "message": "Projects fetched successfully"
}
```

---

### Create Project
**Endpoint:** `POST /api/admin/projects` ⚡ **REQUIRES ADMIN TOKEN**

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Downtown Plaza",
  "title": "Modern Shopping Complex",
  "category_id": 1,
  "location": "New York, USA",
  "duration": "12 months",
  "area": "50,000 sq ft",
  "description": "A modern shopping complex with retail spaces",
  "image": "https://example.com/project1.jpg"
}
```

**Required Fields:**
- `name` (string) - Project name
- `title` (string) - Project title
- `category_id` (integer) - Category ID
- `description` (string) - Project description

**Optional Fields:**
- `location` (string) - Project location
- `duration` (string) - Project duration
- `area` (string) - Project area
- `image` (string) - Project image URL

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Downtown Plaza",
    "title": "Modern Shopping Complex",
    "category_id": 1,
    "location": "New York, USA",
    "duration": "12 months",
    "area": "50,000 sq ft",
    "description": "A modern shopping complex with retail spaces",
    "image": "https://example.com/project1.jpg",
    "created_at": "2026-02-28T10:00:00.000Z",
    "updated_at": "2026-02-28T10:00:00.000Z"
  },
  "message": "Project created successfully"
}
```

---

### Update Project
**Endpoint:** `PUT /api/admin/projects/:id` ⚡ **REQUIRES ADMIN TOKEN**

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Parameters:**
- `id` (path) - Project ID (required)

**Request Body:**
```json
{
  "name": "Downtown Plaza Expansion",
  "title": "Modern Shopping Complex - Extended",
  "category_id": 1,
  "location": "New York, USA",
  "duration": "18 months",
  "area": "75,000 sq ft",
  "description": "Expanded shopping complex with additional retail spaces",
  "image": "https://example.com/project1-updated.jpg"
}
```

**Notes:** All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Downtown Plaza Expansion",
    "title": "Modern Shopping Complex - Extended",
    "category_id": 1,
    "location": "New York, USA",
    "duration": "18 months",
    "area": "75,000 sq ft",
    "description": "Expanded shopping complex with additional retail spaces",
    "image": "https://example.com/project1-updated.jpg",
    "created_at": "2026-02-28T10:00:00.000Z",
    "updated_at": "2026-02-28T10:30:00.000Z"
  },
  "message": "Project updated successfully"
}
```

---

### Delete Project
**Endpoint:** `DELETE /api/admin/projects/:id` ⚡ **REQUIRES ADMIN TOKEN**

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parameters:**
- `id` (path) - Project ID (required)

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Contact Forms

### Get All Contact Forms
**Endpoint:** `GET /api/contact-forms`

**Description:** Get all submitted contact forms

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "message": "I would like to inquire about your services",
      "time": "2026-02-28T10:00:00.000Z",
      "status": "pending",
      "created_at": "2026-02-28T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+9876543210",
      "message": "Can you provide a quote for a project?",
      "time": "2026-02-28T10:05:00.000Z",
      "status": "read",
      "created_at": "2026-02-28T10:05:00.000Z"
    }
  ],
  "message": "Contact forms fetched successfully"
}
```

---

### Get Contact Form by ID
**Endpoint:** `GET /api/contact-forms/:id`

**Parameters:**
- `id` (path) - Contact form ID (required)

**Example:** `GET /api/contact-forms/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "I would like to inquire about your services",
    "time": "2026-02-28T10:00:00.000Z",
    "status": "pending",
    "created_at": "2026-02-28T10:00:00.000Z"
  },
  "message": "Contact form fetched successfully"
}
```

---

### Submit Contact Form
**Endpoint:** `POST /api/contact-forms`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "I would like to inquire about your services"
}
```

**Required Fields:**
- `name` (string) - Contact person name
- `email` (string) - Email address (valid format required)
- `message` (string) - Message/inquiry

**Optional Fields:**
- `phone` (string) - Phone number

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "I would like to inquire about your services",
    "time": "2026-02-28T10:00:00.000Z",
    "status": "pending",
    "created_at": "2026-02-28T10:00:00.000Z"
  },
  "message": "Contact form submitted successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

---

### Update Contact Form Status
**Endpoint:** `PUT /api/contact-forms/:id/status`

**Parameters:**
- `id` (path) - Contact form ID (required)

**Request Body:**
```json
{
  "status": "read"
}
```

**Required Fields:**
- `status` (string) - Status value: `pending`, `read`, or `responded`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "I would like to inquire about your services",
    "time": "2026-02-28T10:00:00.000Z",
    "status": "read",
    "created_at": "2026-02-28T10:00:00.000Z"
  },
  "message": "Contact form status updated successfully"
}
```

---

### Delete Contact Form
**Endpoint:** `DELETE /api/contact-forms/:id`

**Parameters:**
- `id` (path) - Contact form ID (required)

**Response:**
```json
{
  "success": true,
  "message": "Contact form deleted successfully"
}
```

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation description"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development mode)"
}
```

---

## Testing Examples

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Get all services
curl http://localhost:5000/api/services

# Get all categories
curl http://localhost:5000/api/categories

# Get all projects
curl http://localhost:5000/api/projects

# Get all contact forms
curl http://localhost:5000/api/contact-forms

# === LOGIN FIRST TO GET TOKEN ===
# Login to get your admin token
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "<your ADMIN_PASSWORD>"
  }' | jq -r '.data.token')

# === CREATE/UPDATE/DELETE (REQUIRES TOKEN) ===

# Create a service (admin only)
curl -X POST http://localhost:5000/api/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Web Design",
    "description": "Professional web design services",
    "image": "https://example.com/design.jpg"
  }'

# Create a category (admin only)
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Commercial",
    "description": "Commercial projects"
  }'

# Create a project (admin only)
curl -X POST http://localhost:5000/api/admin/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Downtown Plaza",
    "title": "Modern Shopping Complex",
    "category_id": 1,
    "location": "New York, USA",
    "duration": "12 months",
    "area": "50,000 sq ft",
    "description": "A modern shopping complex",
    "image": "https://example.com/project.jpg"
  }'

# Submit contact form (public)
curl -X POST http://localhost:5000/api/contact-forms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "I would like to inquire"
  }'

# Update service (admin only)
curl -X PUT http://localhost:5000/api/admin/services/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Advanced Web Design"
  }'

# Update contact form status (admin only)
curl -X PUT http://localhost:5000/api/admin/contact-forms/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "read"}'

# Delete service (admin only)
curl -X DELETE http://localhost:5000/api/admin/services/1 \
  -H "Authorization: Bearer $TOKEN"

# Delete project (admin only)
curl -X DELETE http://localhost:5000/api/admin/projects/1 \
  -H "Authorization: Bearer $TOKEN"

# Delete contact form (admin only)
curl -X DELETE http://localhost:5000/api/admin/contact-forms/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Using JavaScript/Fetch

```javascript
// ✅ GET - Public (no token needed)
fetch('http://localhost:5000/api/services')
  .then(res => res.json())
  .then(data => console.log(data));

// ✅ POST - Admin only (token required)
fetch('http://localhost:5000/api/admin/services', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Mobile App Development',
    description: 'Custom mobile applications',
    image: 'https://example.com/mobile.jpg'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));

// ✅ PUT - Admin only (token required)
fetch('http://localhost:5000/api/admin/services/1', {
  method: 'PUT',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Advanced Mobile App Development'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));

// ✅ DELETE - Admin only (token required)
fetch('http://localhost:5000/api/admin/services/1', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log(data));

// ✅ Submit contact form (public, no token)
fetch('http://localhost:5000/api/contact-forms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+9876543210',
    message: 'Interested in your services'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Using Postman/Insomnia

1. **Create a new request**
2. **Set method**: GET, POST, PUT, or DELETE
3. **Set URL**: `http://localhost:5000/api/services` (or other endpoints)
4. **For POST/PUT requests:**
   - Go to **Body** tab
   - Select **raw**
   - Choose **JSON** from dropdown
   - Paste the JSON body

---

## Admin System

For complete admin documentation including superadmin authentication, category management, service management, project management, and contact form management, see [ADMIN_DOCUMENTATION.md](./ADMIN_DOCUMENTATION.md).

**Quick Reference:**
- **First superadmin:** seeded from `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars, or via `POST /api/admin/register`
- **Login Endpoint:** `POST /api/admin/login`
- **All admin endpoints require JWT token** in Authorization header
- **Admin can create/edit/delete** all resources
- **Token expires in 24 hours**

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Notes

- All timestamps are in UTC format (ISO 8601)
- IDs are auto-generated by PostgreSQL (auto-increment)
- Email validation is performed on contact form submission
- Cascade delete is enabled for projects when a category is deleted
- All string fields should be non-empty
- Category names must be unique
