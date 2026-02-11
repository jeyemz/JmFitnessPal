<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1KHw7glRo-du4JGubFJmVk-AcJ95AYKzm

## Run Locally

**Prerequisites:** Node.js, MySQL (for the backend).

1. Install dependencies: `npm install`
2. Copy [.env.example](.env.example) to `.env` and set your database and API keys.
3. **Database:** Create the DB and run [database/schema.sql](database/schema.sql). If you already have a database from an older version, run the migrations in [database/migrations/](database/migrations/) (see [database/migrations/README.md](database/migrations/README.md)).
4. Run the backend (e.g. `python backend/app.py` or as in your setup) and the app: `npm run dev`

## Run with Docker (Backend + MySQL)

If you use **Docker Desktop** for the backend and database:

1. **Start the stack:** From the project root run:
   ```bash
   docker compose up -d
   ```
   This starts MySQL and the Flask backend. The API is available at **http://127.0.0.1:5000**.

2. **Frontend:** Run the app on your machine (not in Docker):
   ```bash
   npm install
   npm run dev
   ```
   The app defaults to `http://127.0.0.1:5000/api` for the backend. If login still says "Failed to fetch", add to your `.env`:
   ```
   VITE_API_URL=http://127.0.0.1:5000/api
   ```
   Then restart the dev server (`npm run dev`).

   **Using a custom domain (e.g. suario.divinelifememorialpark.com):** Add the host to `server.allowedHosts` in `vite.config.ts` (already done for that domain). The app uses same-origin `/api`; Vite proxies `/api` to the backend, so no `VITE_API_URL` is needed. Start backend and `npm run dev`, then open the app at your domain (pointing to this machine’s port 3000).

3. **Ensure containers are running:** In Docker Desktop, check that `jmfitnesspal-backend` and `jmfitnesspal-db` are running. If the backend just started, wait a few seconds and try logging in again.

## Login troubleshooting

If you **can't log in**:

1. **"Cannot connect to the server"** – The backend isn't running. Start it with `python backend/app.py` (from the project root) or `docker compose up -d`. The frontend uses same-origin `/api` (proxied by Vite in dev), so the backend must be running on port 5000. To use a different API URL, set `VITE_API_URL` in `.env` and restart `npm run dev`.
2. **"Invalid email or password"** – Use an existing account or create one via **Sign Up**. For a pre-made admin account, run `python backend/seed_data.py` (after DB and schema are set up); then log in with the credentials it prints (e.g. the seed admin email and password).
3. **Database not set up** – Create the database, run `database/schema.sql`, and optionally `backend/seed_data.py` (see Database section below).

## Database

- **New install:** Run `database/schema.sql` against your MySQL database, then optionally run `backend/seed_data.py` to create an admin account and sample foods.
- **Existing database:** Run `database/migrations/001_add_nickname_and_activity.sql` once so profile and admin Recent Activity work (see [database/migrations/README.md](database/migrations/README.md)).
