# 🛸 Rick & Morty AI

A full-stack application for browsing Rick & Morty locations and characters.

## 📁 Project Structure

```
rick-and-morty-ai-challenge/
├── backend/              # FastAPI backend
│   ├── src/
│   │   ├── core/        # Configuration and exceptions
│   │   ├── integrations/ # External API clients
│   │   ├── domains/     # Business logic
│   │   └── api/         # HTTP routes
│   ├── requirements.txt
│   └── run.py
│
└── frontend/            # Next.js frontend
    ├── app/            # Pages
    ├── components/     # React components
    └── lib/            # Utilities
```

## 🚀 Setup

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python run.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

**Frontend** (create `frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📡 API Endpoints

```http
GET /api/v1/locations?page=1
```

Returns paginated locations with nested residents (characters).

## 🛠️ Tech Stack

**Backend**: FastAPI, GraphQL (gql), Pydantic  
**Frontend**: Next.js 15, TypeScript, Tailwind CSS