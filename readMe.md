# AI-Based Question Evaluation System

A web app that presents predefined technical questions one at a time and uses
Gemini to judge whether a free-text answer demonstrates real understanding —
not whether it matches expected wording exactly. See the [Product Requirements
Document](./AI-Based_Question_Evaluation_System__Architecture.md) for the full spec.

```text
question-eval-system/
├── backend/    FastAPI + SQLAlchemy + Gemini evaluator
├── frontend/   React + Vite + Tailwind ("Qualify AI" UI)
├── render.yaml         Render deploy config (backend)
└── DEPLOYMENT.md        Step-by-step Render + Vercel guide
```

## How it works

1. The frontend asks the backend for the current question. It never sees
   the expected answer.
2. The user types a free-text answer and submits it.
3. The backend sends the question, expected answer, and user's answer to
   Gemini, which returns `{ correct, confidence, reason }` as JSON.
4. The backend logs `confidence`/`reason` for debugging but **never** returns
   them to the client — only `correct`/`incorrect` and a short message.
5. Correct or skipped → the backend advances to the next question. Incorrect
   → the user stays on the same question and can retry, unlimited times.
6. Every attempt (correct, incorrect, or skipped) is recorded in the database.

The frontend holds no business logic of its own — it only renders whatever
the backend says the current state is. This means someone can't bypass a
question by manipulating the client.

## Prerequisites

- Python 3.11+
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/apikey)

## Running the backend locally

​```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and set GEMINI_API_KEY

uvicorn app.main:app --reload
​```

The API starts at `http://localhost:8000`. On first boot it creates a SQLite
database (`assessment.db`) and seeds it from `data/questions_seed.json`.
Interactive API docs are available at `http://localhost:8000/docs`.

Run the test suite:

​```bash
python -m pytest tests/ -v
​```

## Running the frontend locally

​```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_BASE_URL should point at your backend, e.g. http://localhost:8000

npm run dev
​```

Open `http://localhost:5173`. The backend's default CORS settings already
allow this origin.

## Editing the question set

Predefined questions live in `backend/data/questions_seed.json`. Each entry
follows:

​```json
{
  "id": "q006",
  "question": "What is polymorphism?",
  "expected_answer": "The ability of different objects to respond to the same method call in different ways.",
  "topic": "OOP",
  "difficulty": "medium",
  "required_concepts": ["method call", "different behavior"]
}
​```

The seed only loads when the `questions` table is empty, so to change the
question set on an existing database, clear the table (or delete
`assessment.db` locally) and restart the server.

## Deploying

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for a full walkthrough of deploying the
backend to **Render** and the frontend to **Vercel**.