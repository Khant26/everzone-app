# EverZone

Responsive customer storefront for the EverZone commerce platform.

**Live:** https://ever-zone-front-end.vercel.app/

## Product branches

| Branch | Application |
|---|---|
| [`main`](https://github.com/Khant26/everzone/tree/main) | Customer storefront |
| [`admin`](https://github.com/Khant26/everzone/tree/admin) | Administrative dashboard |
| [`api`](https://github.com/Khant26/everzone/tree/api) | Express REST API |

The original component repositories remain available; the combined repository presents the complete product without moving functional source files.

## Features

- Responsive product and service discovery
- Project and category content
- Customer contact journeys
- Localized interface content
- API-backed data and chatbot integration

## Tech stack

- React 19 and Vite 7
- React Router
- Tailwind CSS
- Axios
- i18next

## Local development

```bash
npm ci
npm run dev
```

Configure `VITE_API_BASE_URL` in a local environment file. Browser-exposed keys must be restricted appropriately and must never be treated as server secrets.

## Quality checks

```bash
npm run lint
npm run build
```

## License

No open-source license is currently declared. All rights are reserved unless a license is added by the repository owner.
