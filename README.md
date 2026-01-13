# IT Lab Inventory — CMS

Simple prototype web-based CMS to manage inventory for an IT training center computer lab.

## Run (local)

1. Install dependencies:

```bash
cd itlab-cms
npm install
```

2. Start server:

```bash
npm start
```

3. Open http://localhost:3000 in your browser.

## What is included

- server.js — Express server exposing a small JSON API (CRUD) under `/api/items`.
- db.json — simple JSON persistence file (auto-created).
- public/index.html + public/app.js — minimal UI to add/edit/delete inventory items.

This is a minimal prototype you can extend: add authentication, CSV import/export, reporting, or migrate `db.json` to SQLite/Postgres.

## Docker

Build and run with Docker Compose (persists the `db.json` in a Docker volume):

```bash
cd itlab-cms
docker compose up --build -d
```

Stop and remove containers:

```bash
docker compose down
```

The app will be available on http://localhost:3000
