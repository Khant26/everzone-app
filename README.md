# EverZone

One React + Vite app that serves both the EverZone customer storefront and the
administrator dashboard.

**Live demo:** https://everzone.khantmaung.com (admin at `/admin`) — API at
https://api-everzone.khantmaung.com (health: `/health`). The demo shows
fictional sample projects, services and inquiries seeded by the backend.

## Branches

| Branch | Contents |
|---|---|
| `main` | This app: storefront at `/` and admin dashboard at `/admin` |
| `backend` | Express + PostgreSQL REST API used by both (local branch, built from `api`) |
| `admin`, `api` | Original standalone component branches (kept for history) |

## Routes

| Path | Page | Access |
|---|---|---|
| `/` | Storefront: home, about, services, projects, contact (single page with `#home`, `#about`, `#services`, `#projects`, `#contact` sections) and chatbot | Public |
| `/admin/login` | Admin sign-in | Public |
| `/admin` | Dashboard: stats and contact-form inbox | Superadmin |
| `/admin/services` | Manage services | Superadmin |
| `/admin/projects` | Manage projects and categories | Superadmin |

Unknown paths redirect to `/` (or to `/admin` under `/admin/*`). Signed-out
visitors to protected admin pages are sent to `/admin/login` and returned to the
page they wanted after signing in. Only accounts with the `superadmin` role can
use the dashboard. The JWT is kept in `localStorage` and dropped when it expires
or the API answers 401/403.

## Project layout

```
src/
  main.jsx, routes/index.jsx   app entry and the one router (storefront + admin)
  config/api.js                API base URL, read from VITE_API_BASE_URL
  pages/, components/          storefront
  admin/                       admin dashboard (pages, components, auth, hooks)
public/admin/                  admin images
vercel.json                    SPA rewrites for Vercel
```

## Environment variables

Copy `.env.example` to `.env` (git-ignored) and fill it in. All `VITE_*` values
are compiled into the browser bundle, so they are **public**.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | yes (production) | API base. Production: `https://api-everzone.khantmaung.com`. The trailing `/api` is optional. If unset, `npm run dev` uses `http://localhost:5000`; a production build falls back to same-origin `/api` (never localhost). |

No secrets belong in `VITE_*` variables. The chatbot calls the backend's
`POST /api/chat`, which holds the AI key server-side (`GEMINI_API_KEY`).

The API must allow the site's origin in its `CORS_ORIGIN` setting
(`https://everzone.khantmaung.com` in production).

## Run and build

Requires Node.js 20.19 or later.

```bash
npm ci            # install
npm run dev       # dev server at http://localhost:5173 (admin at /admin)
npm run lint      # ESLint
npm run build     # production build in dist/
npm run preview   # serve the built app locally
```

## Deploying to Vercel

`vercel.json` builds with `npm run build`, serves `dist/`, and rewrites every
non-file path to `index.html` so deep links such as `/admin/projects` work. Set
`VITE_API_BASE_URL=https://api-everzone.khantmaung.com` in the Vercel project's
environment settings (it is read at build time, so redeploy after changing it)
and add the custom domain `everzone.khantmaung.com`.

## License

No open-source license is currently declared. All rights are reserved unless a
license is added by the repository owner.
