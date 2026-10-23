# EverZone Backend

Express.js backend for EverZone Admin Dashboard and Frontend.

**Live demo:** API https://api-everzone.khantmaung.com (health:
`GET /health`), used by https://everzone.khantmaung.com (admin at `/admin`).

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

Requires Node.js 20+ (22 LTS recommended) and PostgreSQL.

```bash
npm ci
cp .env.example .env      # then edit .env (never commit it)
createdb everzone_db      # or point DATABASE_URL at any Postgres database
npm run setup-db          # optional: create tables without starting the server
```

Tables are created automatically on startup (`CREATE TABLE IF NOT EXISTS`), so
an empty database works. If the `admins` table is empty and
`ADMIN_PASSWORD` is set, a superadmin is seeded from `ADMIN_USERNAME` /
`ADMIN_EMAIL` / `ADMIN_PASSWORD`; otherwise create the first one with
`POST /api/admin/register` (only allowed while no admin exists). Admins can sign
in with either their username or their email.

### Demo data (`SEED_DEMO=1`)

With `SEED_DEMO=1` the server fills an empty database with fictional content on
startup: the three project categories the storefront shows (Residential,
Commercial, Industrial), 6 services, 11 projects and 3 sample inquiries, with
images hot-linked from `images.unsplash.com`. Content is inserted only when the
`categories`, `services` and `projects` tables are all empty, inquiries only when
`contact_forms` is empty, inside one transaction guarded by an advisory lock, so
restarts never duplicate rows or overwrite edits made in `/admin`. The demo
admin comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (never hard-coded).

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

Example for production behind a reverse proxy on a shared Docker network:

```bash
docker run -d --name everzone-api --restart unless-stopped --network <net> \n  -e NODE_ENV=production -e PORT=5000 \n  -e DATABASE_URL=postgres://everzone:<password>@db:5432/everzone \n  -e JWT_SECRET=<random 48+ chars> -e CORS_ORIGIN=https://everzone.khantmaung.com \n  -e SEED_DEMO=1 -e ADMIN_EMAIL=<email> -e ADMIN_PASSWORD=<password> \n  everzone-api
```

The image is `node:22-alpine`, installs production dependencies only
(`npm ci --omit=dev`), runs as the `node` user, listens on `0.0.0.0:$PORT`, and
has a `HEALTHCHECK` against `/health`, caps the V8 heap at 192 MB
(`NODE_OPTIONS`) and uses about 20-70 MB of RAM idle. It stops cleanly on
SIGTERM.

## API Endpoints

### Health Check
- `GET /health` (alias `GET /api/health`) - 200 JSON liveness check, no DB access

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST|PUT|DELETE /api/admin/services[/:id]` - Admin only (JWT); multipart with optional `image` file

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
- `POST|PUT|DELETE /api/admin/categories[/:id]` - Admin only (JWT)

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
- `POST|PUT|DELETE /api/admin/projects[/:id]` - Admin only (JWT); multipart with optional `image` file

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
- `POST /api/contact-forms` - Submit contact form (public, rate-limited)
- `GET /api/admin/contact-forms` - List inquiries (admin only)
- `PUT /api/admin/contact-forms/:id/status` - Update status (admin only)
- `DELETE /api/admin/contact-forms/:id` - Delete inquiry (admin only)

### Admin auth
- `POST /api/admin/login` - `{ "username": "<username or email>", "password": "..." }` returns a JWT (5 failed attempts per 15 min per IP)

### Chatbot
- `POST /api/chat` - `{ "message": "..." }` returns `{ data: { reply } }`; proxies Gemini with the server-side `GEMINI_API_KEY` (503 when unset, 20 requests per 15 min per IP)

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
  "status": "pending | reviewed | responded | archived"
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
│   │   ├── initDb.js         # Creates tables, seeds first admin
│   │   └── seedDemo.js       # Optional demo content (SEED_DEMO=1)
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
│   │   ├── contactFormRoutes.js
│   │   └── chatRoutes.js     # Chatbot proxy (GEMINI_API_KEY)
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
| `DB_SSL` | `false` | `true` for hosted Postgres that requires TLS (leave `false` for a Postgres container on the same Docker network) |
| `DB_POOL_MAX` | `5` | Max pooled DB connections |
| `JWT_SECRET` | - (required) | Secret for signing admin JWTs |
| `JWT_EXPIRES_IN` | `24h` | Token lifetime |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:3000` | Comma-separated allowed origins; required in production (`https://everzone.khantmaung.com`) |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `superadmin` / `admin@everzone.local` / - | Optional first-run superadmin (demo admin); password min 8 chars |
| `SEED_DEMO` | `0` | `1` seeds fictional demo content into empty tables on startup |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | - / `gemini-2.5-flash-lite` | Optional chatbot proxy |

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
