# 🏋️ IronLedger

> A workout tracking web app built to **showcase SQL analytics skills** for fresher placement.

**Live demo**: _coming soon (Vercel + Railway)_

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 + React + Tailwind CSS |
| Charts | Apache ECharts |
| Backend API | FastAPI (Python) |
| Database | PostgreSQL |
| Data Import | Python + Pandas |
| Hosting | Vercel (FE) + Railway (BE + DB) |

---

## 🗄️ SQL Showcase

The `/sql` folder contains the core SQL work — the main portfolio artifact.

| File | Contents |
|------|----------|
| [`sql/schema.sql`](sql/schema.sql) | Table design, constraints, indexes, seed data |
| [`sql/views.sql`](sql/views.sql) | 6 PostgreSQL views used by the API |
| [`sql/analytics_queries.sql`](sql/analytics_queries.sql) | 7 annotated queries covering window functions, CTEs, LAG, RANK, date arithmetic |

### SQL Concepts Demonstrated

- **Aggregation** — `SUM`, `COUNT`, `AVG` with `GROUP BY`
- **Window Functions** — `RANK()`, `LAG()`, `SUM() OVER(...)` with `PARTITION BY` and `ORDER BY`
- **CTEs** — `WITH` clauses for readable multi-step queries
- **Date Functions** — `DATE_TRUNC`, `TO_CHAR`, date subtraction for streak detection
- **JOINs** — `workouts` joined to `exercises` master table
- **Views** — Pre-built named queries for fast API reads
- **Indexes** — On `logged_on`, `exercise`, `category` for query performance

---

## 🚀 Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in your PostgreSQL DATABASE_URL
uvicorn main:app --reload
```

Run the SQL files against your database:

```bash
psql $DATABASE_URL -f sql/schema.sql
psql $DATABASE_URL -f sql/views.sql
```

### Frontend

```bash
cd frontend
npm install
# .env.local already set to http://localhost:8000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
IronLedger/
├── sql/                        # ← SQL showcase (main portfolio artifact)
│   ├── schema.sql              #   Table definitions + seed data
│   ├── views.sql               #   6 PostgreSQL views
│   └── analytics_queries.sql  #   7 annotated analytics queries
├── backend/                    # FastAPI + Python
│   ├── main.py
│   ├── routes/
│   │   ├── workouts.py
│   │   └── stats.py
│   ├── db/connection.py
│   └── utils/importer.py       # Pandas CSV/Excel import
└── frontend/                   # Next.js app
    ├── app/
    │   ├── page.tsx            # Dashboard
    │   ├── log/page.tsx        # Log workout
    │   ├── history/page.tsx    # Session history
    │   ├── progress/page.tsx   # Progression charts
    │   └── import/page.tsx     # CSV/Excel upload
    ├── components/charts/      # ECharts wrappers
    └── lib/api.ts              # API client
```

---

## Pages

| Page | Description |
|------|-------------|
| `/` | Dashboard — volume stats, recent sessions, category breakdown |
| `/log` | Log a workout set |
| `/history` | Full history table with filter by exercise |
| `/progress` | Strength progression charts + week-over-week + personal records |
| `/import` | Upload CSV/Excel with validation preview |
