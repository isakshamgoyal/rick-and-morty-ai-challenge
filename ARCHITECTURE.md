# 🏗️ Architecture

## Overview

This project follows Domain-Driven Design (DDD) principles with clean architecture patterns.

## Key Patterns

1. **Bounded Contexts**: `locations/` is a separate domain
2. **Service Layer**: Business logic in `LocationService`
3. **Dependency Injection**: Clean separation via FastAPI routers

## Design Decisions

### Why GraphQL in Backend, Not Frontend?

**Decision:** GraphQL client lives in the backend, frontend uses REST API

**Rationale:**

1. **API Key Security**: GraphQL API keys stay on the server, never exposed to clients
2. **Abstraction**: Frontend doesn't need to know about GraphQL - simpler client code
3. **Caching**: Backend can implement caching strategies (future: Redis, SQLite cache)
4. **Rate Limiting**: Centralized control over external API calls
5. **Error Handling**: Backend can handle GraphQL errors and transform to user-friendly REST responses
6. **Future Flexibility**: Can switch GraphQL providers or add REST endpoints without frontend changes
7. **Type Safety**: Backend validates and transforms data with Pydantic before sending to frontend

**Architecture Flow:**
```
Frontend (Next.js) 
  → REST API call 
  → Backend (FastAPI) 
  → GraphQL client 
  → Rick & Morty API
```

**Benefits:**
- Frontend stays simple (just REST calls)
- Backend handles complexity (GraphQL queries, error handling, caching)
- Better security (no API keys in browser)
- Easier to test and maintain

### Why GraphQL?

The `RickMortyClient` uses GraphQL to fetch only needed data:

**REST would need:**
- 850+ HTTP requests (1 for locations, 850 for all characters)
- 15+ fields per character (wasted bandwidth)

**GraphQL needs:**
- 7 HTTP requests (pagination)
- 4 fields per character (60% less data)

**Result: 99% fewer requests!** 🚀

### Separation of Concerns

- **Core**: Configuration and shared utilities
- **Integrations**: External API clients (isolated from business logic)
- **Domains**: Pure business logic (no HTTP, no DB details)
- **API**: HTTP layer (routes, error handling)

### Benefits

1. **Testable**: Each layer can be tested independently
2. **Maintainable**: Clear structure, easy to navigate
3. **Scalable**: Add new domains without affecting existing ones
4. **Professional**: Industry-standard architecture

## System Design

### Component Flow

```
Frontend (Next.js)
  ↓ REST API
Backend (FastAPI)
  ├── API Layer (routes, validation)
  ├── Domain Layer (business logic)
  └── Integration Layer (GraphQL client)
      ↓ GraphQL
Rick & Morty API
```

### Data Flow

1. **Frontend Request**: Next.js makes REST call to `/api/v1/locations?page=1`
2. **Backend Processing**: FastAPI router → LocationService → RickMortyClient
3. **GraphQL Query**: Backend constructs GraphQL query with only needed fields
4. **Response Transformation**: GraphQL response → Pydantic models → REST JSON
5. **Frontend Display**: Next.js receives clean, validated data

## Technology Stack

**Backend:**
- FastAPI - Modern Python web framework
- GraphQL (gql) - Efficient data fetching
- Pydantic - Data validation and transformation

**Frontend:**
- Next.js 15 - React framework with App Router
- TypeScript - Type safety
- Tailwind CSS - Styling

## Principles

This project follows:
- **Clean Architecture** principles
- **Domain-Driven Design** tactical patterns
- **Separation of Concerns** - Clear boundaries between layers
- **API Gateway Pattern** - Backend acts as gateway to external services
