# Retail App

Retail App is a full-stack retail management system with role-based access for admin and staff users.
It includes product management, billing, reports, insights, inventory monitoring, and auth.

## Project Structure

- `backend/`: FastAPI API, auth, business logic, and database models/migrations
- `frontend/`: React + Vite UI with dashboard, billing, products, reports, and role-based routing

## Main Product Sections

- Dashboard: Business KPIs (revenue, profit, margin, inventory value, health score)
- Billing: Create invoices and complete sales transactions
- Products: View/manage catalog, prices, stock, and product images
- Reports: Financial summaries and profitability views
- Insights: Actionable low-stock and performance insights
- Returns: Return and loss tracking flow
- Customers: Customer list and history view
- Auth: Register/login with role-based access (`admin`, `staff`)

## Tech Stack And Why It Is Used

### Backend

- FastAPI: High-performance Python API framework with automatic OpenAPI docs
- SQLAlchemy: ORM for database models and queries
- Alembic: Versioned DB migrations for schema changes
- python-jose: JWT creation and verification for auth
- Pydantic: Request/response schema validation and serialization
- Uvicorn: ASGI server for running FastAPI

### Frontend

- React + TypeScript: Component-based UI with type safety
- Vite: Fast dev server and optimized production build
- React Router: Client-side routing for app sections
- Axios: API client with auth-token interceptors
- TanStack React Query: Async data fetching/caching patterns
- Tailwind CSS: Utility-first styling for fast UI development
- shadcn/ui + Radix UI: Accessible UI primitives and consistent components
- Recharts: KPI and trend visualizations
- Framer Motion: UI animations and transitions
- Sonner: Toast notifications

## Libraries To Install After Cloning

### Backend (Python)

Install from `backend/requirements.txt`:

- `fastapi`
- `uvicorn[standard]`
- `sqlalchemy`
- `alembic`
- `python-jose`
- `pydantic`

### Frontend (Node)

Install from `frontend/package.json` via npm:

- React ecosystem (`react`, `react-dom`, `react-router-dom`)
- UI libraries (`@radix-ui/*`, `shadcn` related deps)
- Data/HTTP (`@tanstack/react-query`, `axios`)
- Styling (`tailwindcss`, `postcss`, `autoprefixer`)
- Charts/animation (`recharts`, `framer-motion`)
- Tooling (`typescript`, `vite`, `eslint`, `vitest`)

## Local Setup (After Clone)

### 1. Clone

```bash
git clone <your-repo-url>
cd Retail-App
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
# Windows Git Bash
source .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host --port 5173
```

## Environment Variables

### Backend (`backend/.env`)

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT signing key (must be strong in production)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiry
- `ALLOWED_ORIGINS`: Comma-separated frontend origins for CORS

### Frontend (`frontend/.env`)

- `VITE_API_URL`: Backend API base URL (for example `http://localhost:8000`)

## API Docs

When backend is running:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## GitHub Safety Notes

- `.env` files are now ignored by git.
- Keep only `.env.example` in repository.
- If `.env` was already committed earlier, untrack it once:

```bash
git rm --cached backend/.env frontend/.env
```

Then commit the change.

## Production Notes

- Prefer PostgreSQL over SQLite for production
- Set strong `SECRET_KEY`
- Set strict `ALLOWED_ORIGINS` to deployed frontend domain
- Run migrations during deploy: `alembic upgrade head`
- Build frontend with `npm run build`

## License

Add your preferred license in a `LICENSE` file.
