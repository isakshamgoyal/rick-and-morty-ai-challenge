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

### Characters
```http
GET /api/v1/characters?page=1
GET /api/v1/characters/{character_id}
GET /api/v1/characters/{character_id}/context
```

### Locations
```http
GET /api/v1/locations?page=1&include_residents=true
GET /api/v1/locations/{location_id}
```

### Episodes
```http
GET /api/v1/episodes?page=1
GET /api/v1/episodes/{episode_id}
```

### Notes
```http
GET /api/v1/notes/character/{character_id}
POST /api/v1/notes
PUT /api/v1/notes/{note_id}
DELETE /api/v1/notes/{note_id}
```

### AI Features
```http
POST /api/v1/ai/character-backstory/generate
POST /api/v1/ai/character-backstory/evaluate?use_llm_judge=true
POST /api/v1/ai/location-adventure-story/generate
POST /api/v1/ai/location-adventure-story/evaluate?use_llm_judge=true
GET /api/v1/ai/search?query={query}&limit={limit}
POST /api/v1/ai/search/index
```

## 🛠️ Tech Stack

**Backend**: 
- FastAPI - Modern Python web framework
- GraphQL (gql) - Efficient data fetching from Rick & Morty API
- PostgreSQL + pgvector - Database with vector similarity search
- SQLAlchemy - ORM for database operations
- Azure OpenAI - LLM for generation and embeddings
- Pydantic - Data validation and transformation

**Frontend**: 
- Next.js 15 - React framework with App Router
- TypeScript - Type safety
- Tailwind CSS - Styling

## 🏗️ Key Architectural Decisions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanations of all architectural decisions.