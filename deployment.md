# Deployment Guide — Render (backend) + Vercel (frontend)

This assumes the repository is pushed to GitHub (or GitLab/Bitbucket) with
`backend/` and `frontend/` at the root, as in this project.

The order matters: deploy the **backend first**, because the frontend needs
its live URL, and the backend needs the frontend's live URL for CORS. You'll
circle back and update one env var on each side once both are up.

---

## Part 1 — Backend on Render

### 1. Create the Postgres database

Render's free-tier disks are ephemeral, so SQLite (the local-dev default)
will lose data on every redeploy. Use Render's managed Postgres instead.

1. In the Render dashboard: **New → PostgreSQL**
2. Name it (e.g. `question-eval-db`), choose a region close to your backend,
   free plan is fine to start.
3. Once created, copy the **Internal Database URL** — you'll use this as
   `DATABASE_URL` in step 2 (internal URLs are faster and free; only use the
   external URL if you need to connect from outside Render).

### 2. Create the web service

1. **New → Web Service**, connect your repo.
2. **Root Directory:** `backend`
3. **Runtime:** Python 3
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   (Render injects `$PORT`; the app must bind to it, not a hardcoded port.)
6. **Environment Variables** — add these under the service's Environment tab:

   | Key | Value |
   |---|---|
   | `GEMINI_API_KEY` | your key from Google AI Studio |
   | `GEMINI_MODEL` | `gemini-1.5-flash` |
   | `DATABASE_URL` | the Internal Database URL from step 1 |
   | `QUESTIONS_SEED_PATH` | `data/questions_seed.json` |
   | `LOG_LEVEL` | `INFO` |
   | `ALLOWED_ORIGINS` | `http://localhost:5173` for now — you'll add the Vercel URL after Part 2 |

7. Click **Create Web Service**. Render builds and deploys; watch the logs
   for `Application startup complete`.
8. Note your backend's URL, e.g. `https://question-eval-backend.onrender.com`.
   Visit `<that-url>/health` — you should see `{"status": "ok"}`.

> **Using `render.yaml` instead:** if you'd rather not click through the
> dashboard, this repo includes a `render.yaml` at the root. In Render,
> choose **New → Blueprint**, point it at the repo, and it will create both
> the web service and the database from that file. You'll still need to set
> `GEMINI_API_KEY` and `ALLOWED_ORIGINS` manually afterward, since secrets
> aren't stored in the blueprint.

### Notes specific to Render

- **Free tier sleeps.** Free web services spin down after inactivity; the
  first request after a while takes ~30–60s to wake up. This can make the
  frontend's first `/assessments/start` call look like it's hanging — that's
  expected on the free plan, not a bug.
- **`postgres://` vs `postgresql://`:** Render's connection string uses the
  `postgres://` scheme, which older SQLAlchemy versions reject. The backend
  already normalizes this automatically (see `app/db/database.py`), so no
  action needed here.
- **Tables are created automatically** on first startup (`init_db()` in
  `app/main.py`). For a real production setup you'd eventually switch to
  Alembic migrations instead of `create_all`, but this is fine to start.

---

## Part 2 — Frontend on Vercel

### 1. Import the project

1. In Vercel: **Add New → Project**, import the same repo.
2. **Root Directory:** `frontend`
3. Vercel should auto-detect the Vite framework preset (build command
   `npm run build`, output directory `dist`) from the included `vercel.json`
   — double check these match if it doesn't detect automatically.

### 2. Set the environment variable

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | your Render backend URL, e.g. `https://question-eval-backend.onrender.com` |

Vite only bakes `VITE_*` env vars in at **build time**, so if you change this
later you'll need to trigger a redeploy for it to take effect.

### 3. Deploy

Click **Deploy**. Once it finishes, note your frontend URL, e.g.
`https://question-eval-system.vercel.app`.

---

## Part 3 — Close the loop: update CORS

Go back to your Render web service → Environment, and update:

​```text
ALLOWED_ORIGINS=https://question-eval-system.vercel.app
​```

(Comma-separate multiple values if you also want to keep `localhost:5173`
working for local dev against the deployed backend.) Save — Render will
redeploy the service automatically.

---

## Verifying the deployed app

1. Open the Vercel URL.
2. Click **Start Assessment** — this calls `POST /assessments/start` on
   Render. If it fails, open your browser's dev tools → Network tab and
   check for a CORS error (means `ALLOWED_ORIGINS` doesn't match yet) or a
   timeout (likely just the free-tier cold start — try again after ~30s).
3. Submit an answer. Check the Render service logs — you should see the
   `[Evaluator]` log line from `app/logging/evaluator_logger.py` showing the
   question, answer, and Gemini's reasoning, confirming the evaluator ran.

## Custom domains (optional)

Both platforms support custom domains under their project settings. If you
add one for the frontend, remember to add that domain to `ALLOWED_ORIGINS`
on Render as well, or the deployed app will get CORS errors.