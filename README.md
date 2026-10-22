# EverZone Backend

Express.js backend for EverZone Admin Dashboard and Frontend.

## Product repository

This service is also maintained as the [`api`](https://github.com/Khant26/everzone/tree/api) branch of the combined [EverZone repository](https://github.com/Khant26/everzone). The original repository is preserved.

## Features

- **Services Management**: Create, read, update, and delete services (image, title, description)
- **Projects Management**: Create, read, update, and delete projects with categories
- **Categories Management**: Manage project categories
- **Contact Forms**: Handle customer inquiries with status tracking

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL
- **Runtime**: Node.js
- **Package Manager**: npm

## Installation

Requires Node.js 20+ and PostgreSQL.

```bash
npm ci
cp .env.example .env      # then edit .env (never commit it)
createdb everzone_db      # or point DATABASE_URL at any Postgres database
npm run setup-db          # optional: create tables without starting the server
```

Tables are created automatically on startup. If the `admins` table is empty and
`ADMIN_PASSWORD` is set, a superadmin is seeded from `ADMIN_USERNAME` /
`ADMIN_EMAIL` / `ADMIN_PASSWORD`; otherwise create the first one with
`POST /api/admin/register` (only allowed while no admin exists).

## Running the Server

```bash
npm run dev     # nodemon, auto-reload
npm start       # production mode
npm test        # unit + HTTP smoke tests (no database needed)
```

The server listens on `HOST:PORT` (default `0.0.0.0:5000`). It refuses to start
without `JWT_SECRET` (and, when `NODE_ENV=production`, without a 32+ character
secret and a database setting).

### Docker

```bash
docker build -t everzone-api .
docker run --rm -p 5000:5000 --env-file .env everzone-api
```

The image is `node:20-alpine`, installs production dependencies only
(`npm ci --omit=dev`), runs as the `node` user, listens on `0.0.0.0:$PORT`, and
has a `HEALTHCHECK` against `/health`.

## API Endpoints

### Health Check
- `GET /health` (alias `GET /api/health`) - 200 JSON liveness check, no DB access

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

**Body:**
```json
{
  "title": "Service Title",
  "description": "Service Description",
  "image": "image_url"
}
```

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

**Body:**
```json
{
  "name": "Category Name",
  "description": "Category Description"
}
```

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/category/:categoryId` - Get projects by category
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Body:**
```json
{
  "name": "Project Name",
  "title": "Project Title",
  "category_id": 1,
  "location": "City, Country",
  "duration": "3 months",
  "area": "500 sq ft",
  "description": "Project Description",
  "image": "image_url"
}
```

### Contact Forms
- `GET /api/contact-forms` - Get all contact forms
- `GET /api/contact-forms/:id` - Get contact form by ID
- `POST /api/contact-forms` - Submit contact form
- `PUT /api/contact-forms/:id/status` - Update form status
- `DELETE /api/contact-forms/:id` - Delete contact form

**Body (Submit):**
```json
{
  "name": "Customer Name",
  "email": "customer@email.com",
  "phone": "+1234567890",
  "message": "How can we help?"
}
```

**Body (Update Status):**
```json
{
  "status": "pending | read | responded"
}
```

## Database Schema

### services
```sql
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### categories
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### projects
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  location VARCHAR(255),
  duration VARCHAR(100),
  area VARCHAR(100),
  description TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### contact_forms
```sql
CREATE TABLE contact_forms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
everzone-api/
├── src/
│   ├── config/
│   │   ├── env.js            # All environment configuration
│   │   ├── database.js       # Database connection
│   │   └── initDb.js         # Database initialization
│   ├── controllers/
│   │   ├── ServiceController.js
│   │   ├── CategoryController.js
│   │   ├── ProjectController.js
│   │   └── ContactFormController.js
│   ├── models/
│   │   ├── ServiceModel.js
│   │   ├── CategoryModel.js
│   │   ├── ProjectModel.js
│   │   └── ContactFormModel.js
│   ├── routes/
│   │   ├── serviceRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── projectRoutes.js
│   │   └── contactFormRoutes.js
│   ├── app.js                # Express app (middleware + routes), importable in tests
│   └── server.js             # Entry point: config check, DB init, listen
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Environment Variables

See `.env.example`.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `HOST` | `0.0.0.0` | Bind address |
| `NODE_ENV` | `development` | Environment mode |
| `DATABASE_URL` | - | Postgres connection URL (preferred) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `localhost` / `5432` / `everzone_db` / `postgres` / - | Used when `DATABASE_URL` is empty |
| `DB_SSL` | `false` | `true` for hosted Postgres that requires TLS |
| `JWT_SECRET` | - (required) | Secret for signing admin JWTs |
| `JWT_EXPIRES_IN` | `24h` | Token lifetime |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:3000` | Comma-separated allowed origins |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `superadmin` / `admin@everzone.local` / - | Optional first-run superadmin seed |

## Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Development

For development with auto-reload:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Notes

- All timestamps are in UTC
- IDs are auto-generated by PostgreSQL
- Email validation is performed on contact form submission
- Cascade delete is enabled for projects when a category is deleted
