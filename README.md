# SilverSync — care home management with an agentic RAG assistant

React + Vite frontend (`src/`) and a FastAPI backend (`backend/`) with role-based access, a ChromaDB vector index and a Gemini-powered agent.

## Quick start

```bash
# Backend (Python 3.11–3.13, uses uv)
cd backend
cp .env.example .env            # add GEMINI_API_KEY to enable AI features
uv sync
uv run python -m app.scripts.seed   # demo data + vector index
uv run uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal, repo root)
npm install
npm run dev                      # http://localhost:8080, proxies /api to :8000
```

Demo logins: `admin@`, `doctor@`, `nurse@`, `accountant@`, `hr@`, `receptionist@silversync.com`, with the password set by `SEED_PASSWORD` in `backend/.env`.

Without `GEMINI_API_KEY` everything except the LLM works: CRUD, auth, alerts, and search (on an offline hashing embedder). After adding a key, run `uv run python -m app.scripts.reindex` so the index uses Gemini embeddings.

Docker: `docker compose up --build`.

## AI features

| Feature | Where | How |
|---|---|---|
| Assistant chat | "Ask AI" in the header | Gemini function-calling agent over 18 tools, streamed over SSE with tool steps and citations |
| Human-in-the-loop writes | Assistant action cards | New medical records, payments and leave decisions are proposals until the user confirms them |
| Semantic search | Header search bar | ChromaDB vector search over every record and uploaded-document chunk the user may read |
| Document Q&A + auto-tagging | Documents page / upload dialog | Text extraction (PDF, DOCX, TXT), multimodal transcription for scans, and a suggested category, resident and summary |
| Report drafting and alerts | Reports page, Dashboard | Narrative Markdown reports from live data (PDF export); role-scoped alerts for refills, overdue invoices and approvals |

## Backend architecture

```
api (FastAPI routers: HTTP only)
 ├─► domain/<module>   service → repository → SQLAlchemy models   (no AI, no SDKs)
 │      └─ publishes EntityChanged / DocumentFileStored events (core/events.py)
 └─► ai/                search · docintel · reports · agent       (depends on ports only)
        ├─ ai/ports.py    LLMProvider · EmbeddingProvider · VectorStore · AgentStore
        ├─ ai/gateway.py  DomainGateway (read/write domain data through services)
        └─ ai/indexing    subscribes to domain events → keeps ChromaDB in sync
infra/      Gemini, ChromaDB, local file storage and SQL agent-store adapters
adapters/   DomainGateway implementation over the domain services
container.py  composition root, the only place that wires concrete classes
```

`backend/.importlinter` enforces the layering. Run `uv run lint-imports`:

- `core` depends on nothing else in the app.
- `domain` never imports AI, infrastructure, FastAPI, ChromaDB or Gemini.
- `ai` uses ports and DTOs only: no SDKs, repositories, ORM models or SQLAlchemy.
- `infra` adapters never reach into domain or HTTP code.
- Routers never touch the database or repositories directly.

### Access control and safety

- RBAC (mirrors `src/lib/rbac.ts`) is enforced in three places:
  - **API**: `require(...)` dependencies.
  - **Retrieval**: Chroma `where module $in allowed_modules`.
  - **Agent tools**: tools a role cannot use are never shown to the model, and every call is checked again when it runs.
- Every tool call is written to `agent_audit`. Mutating tools only create `agent_actions` rows until the owning user confirms them.
- The system prompt forbids clinical advice. Review Gemini API data-use terms before processing real patient data.

## Tests

```bash
cd backend && uv run pytest     # unit + integration, scripted fake LLM, no API key needed
cd backend && uv run lint-imports
npx tsc --noEmit -p tsconfig.app.json
```
