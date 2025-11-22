# 🏗️ Architecture

## Overview

This project implements a full-stack AI-augmented application using the Rick & Morty API, featuring semantic search, AI-generated content, and comprehensive evaluation metrics. The architecture follows clean architecture principles with clear separation of concerns across domain boundaries.

## Key Architectural Patterns

1. **Bounded Contexts**: Each domain (`characters/`, `locations/`, `episodes/`, `notes/`, `ai/`) represents a separate bounded context with isolated business logic
2. **Service Layer Pattern**: Business logic is encapsulated in dedicated service classes, keeping HTTP concerns separate from domain logic
3. **Repository Pattern**: Data access abstraction provides a clean interface to the persistence layer
4. **Dependency Injection**: FastAPI's dependency injection system enables testable, loosely-coupled components

## Technology Stack

**Backend:**
- FastAPI - Modern Python web framework with automatic OpenAPI documentation
- GraphQL (gql) - Efficient data fetching from Rick & Morty API
- Pydantic - Data validation and serialization
- PostgreSQL - Production-grade relational database
- pgvector - Vector similarity search extension
- SQLAlchemy - ORM for database operations
- Azure OpenAI - LLM for generation and embeddings

**Frontend:**
- Next.js 15 - React framework with App Router
- TypeScript - Type safety and developer experience
- Tailwind CSS - Utility-first styling

## System Design

### Component Architecture
```
Frontend (Next.js)
  ↓ REST API
Backend (FastAPI)
  ├── API Layer (routes, validation)
  ├── Domain Layer (business logic)
  └── Integration Layer (GraphQL client)
      ↓ GraphQL
Rick & Morty API (External)
```

### Data Flow

1. **Frontend Request**: Next.js makes REST call to `/api/v1/locations?page=1`
2. **Backend Processing**: FastAPI router → Domain Service → Integration Client
3. **GraphQL Query**: Backend constructs GraphQL query with only required fields
4. **Response Transformation**: GraphQL response → Pydantic models → REST JSON
5. **Frontend Display**: Next.js receives validated, type-safe data

## Architecture Decision Records

### Why GraphQL for Rick & Morty API?

**Decision:** Use GraphQL to fetch data from the Rick & Morty API instead of REST endpoints

**Rationale:**

1. **Efficiency**: Fetch only required fields, reducing payload size by ~60%
2. **Request Consolidation**: Single paginated request retrieves location and resident data, eliminating N+1 query problems
3. **Performance**: 99% reduction in HTTP requests (7 GraphQL queries vs 850+ REST calls for full dataset)
4. **Flexibility**: Easy to extend queries with additional fields without API versioning
5. **Type Safety**: GraphQL schema provides strong typing for API contracts

**Impact:**
- REST approach: 850+ requests (1 per location + 1 per character batch)
- GraphQL approach: 7 requests (pagination only)
- Result: **99% fewer requests, 60% less data transfer**

---

### Why GraphQL in Backend, Not Frontend?

**Decision:** Implement GraphQL client in the backend; expose REST API to frontend

**Rationale:**

1. **Security**: API keys and credentials remain server-side, never exposed to clients
2. **Abstraction**: Frontend remains simple with standard REST calls; GraphQL complexity is hidden
3. **Caching Strategy**: Backend controls caching policies and can implement Redis or in-memory caching
4. **Rate Limiting**: Centralized control over external API usage prevents abuse
5. **Error Handling**: Backend transforms GraphQL errors into user-friendly REST responses
6. **Future-Proof**: Can migrate GraphQL providers or add new data sources without frontend changes

**Architecture Flow:**
```
Frontend (Next.js) → REST → Backend (FastAPI) → GraphQL → Rick & Morty API
```

---

### Why REST for Notes API?

**Decision:** Use REST endpoints for notes CRUD operations instead of GraphQL

**Rationale:**

1. **Internal API**: Notes are stored in our PostgreSQL database, not fetched from external GraphQL services
2. **CRUD Semantics**: REST's HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) naturally map to CRUD operations
3. **Simplicity**: RESTful routes are intuitive and self-documenting
4. **FastAPI Integration**: Automatic OpenAPI documentation and request validation
5. **Consistency**: Frontend uses REST for all backend communication, maintaining uniform API surface

**Notes API Endpoints:**
- `GET /notes/character/{character_id}` - Retrieve all notes for a character
- `POST /notes` - Create a new note
- `GET /notes/{note_id}` - Retrieve a specific note
- `PUT /notes/{note_id}` - Update an existing note
- `DELETE /notes/{note_id}` - Delete a note

---

### Why PostgreSQL as DB?

**Decision:** Use PostgreSQL with `pgvector` extension instead of SQLite or dedicated vector databases

**Rationale:**

1. **Production-Ready**: PostgreSQL provides ACID compliance, concurrent connections, and proven scalability
2. **Native Vector Support**: `pgvector` extension offers first-class vector embedding storage and similarity search
3. **Unified Architecture**: Single database for both relational data and vector embeddings eliminates operational complexity
4. **Advanced Indexing**: IVFFlat and HNSW indexes enable efficient similarity search at scale
5. **SQL Integration**: Seamlessly combine vector search with traditional SQL queries, joins, and filters
6. **Cost Effective**: Open-source solution with no SaaS fees or vendor lock-in

**Why Not Alternatives?**
- **SQLite**: Lacks native vector support and production-grade concurrency
- **ChromaDB/Pinecone**: Adds deployment complexity and operational overhead for our scale (~1000 vectors)
- **Local Storage**: Browser-only, no server-side processing or vector search capabilities

---

### Why pgvector Over Dedicated Vector Databases?

**Decision:** Use `pgvector` extension in PostgreSQL instead of specialized vector databases (Pinecone, Weaviate, ChromaDB)

**Rationale:**

1. **Simplified Architecture**: Single database eliminates need for separate vector database service
2. **Operational Efficiency**: No additional services to deploy, monitor, or maintain
3. **Scale Appropriate**: For ~1000 vectors (characters + locations + generated content), `pgvector` provides sub-100ms queries
4. **Cost Effective**: Zero additional infrastructure costs vs SaaS vector databases ($70+/month)
5. **SQL Synergy**: Native integration with relational queries enables complex filtering and aggregations
6. **Reliability**: Inherits PostgreSQL's battle-tested durability and replication capabilities

**Performance Characteristics:**
- Query latency: <100ms for cosine similarity search
- Storage efficiency: ~6KB per 1536-dimension embedding
- Index build time: Sub-second for 1000 vectors

**Future Considerations:** If dataset scales beyond 100K vectors or requires sub-10ms queries, migration to dedicated vector database would be reconsidered.

---

### Why Backend Enrichment for Semantic Search?

**Decision:** Backend enriches vector search results with full entity data before returning to frontend

**Rationale:**

1. **Performance**: Single network round-trip vs N+1 requests from frontend
2. **Parallel Fetching**: Backend can fetch multiple entities concurrently
3. **Error Handling**: Centralized error recovery for failed entity fetches
4. **Response Consistency**: Frontend always receives uniform, enriched result format
5. **Caching Opportunity**: Backend can implement intelligent caching strategies
6. **Security**: Hides external API implementation details from clients

**Flow:**
```
User Query → Backend Vector Search → Backend Entity Fetch (parallel) → Enriched Results
```

**Performance Impact:**
- Backend enrichment: ~400ms, 1 HTTP request
- Frontend fetching: ~1100ms, 11 HTTP requests
- **Result: 3x faster with backend enrichment**

---


## AI Evaluation Framework

The system implements comprehensive evaluation metrics for AI-generated content, combining automated scoring with optional LLM-based assessment.

### Evaluation Architecture

All evaluation metrics are normalized to 0-1.0 scale and combined using weighted averages. The framework includes:

1. **Shared Base Metrics**: Implemented once in `BaseEvaluator`, used across all AI features
2. **Feature-Specific Metrics**: Customized for character backstories and location adventures
3. **LLM Judge (Optional)**: GPT-4 provides qualitative assessment and improvement suggestions

### Shared Evaluation Metrics

**1. Source Semantic Alignment** (0-1.0)
- **Purpose**: Measures semantic similarity between generated text and source context
- **Method**: Cosine similarity of OpenAI embeddings (text-embedding-3-small)
- **Weight**: 20-25% depending on feature

**2. Cosine Similarity** (0-1.0) - *Conditional*
- **Purpose**: Compares generated output against reference/golden examples
- **Availability**: Only computed when reference embeddings are provided
- **Weight**: 25% when available

**3. Tone/Style** (0-1.0)
- **Purpose**: Validates Rick & Morty's distinctive narrative style
- **Method**: Token-based similarity (Jaccard + fuzzy matching)
- **Validates**: Sci-fi markers, humor/cynicism, world references
- **Weight**: 10-15%

**4. Narrative Coherence** (0-1.0)
- **Purpose**: Evaluates logical flow and story structure
- **Method**: Analyzes transitions, sentence structure, contradiction detection
- **Weight**: 5-10%

**5. Factual Consistency** (0-1.0)
- **Purpose**: Validates accuracy against source data
- **Method**: Exact matching with fuzzy partial credit, contradiction penalties
- **Weight**: 30%

### Character Backstory Evaluation

**Weight Distribution:**
- Factual Consistency: 30%
- Source Semantic Alignment: 25%
- Narrative Relevance: 20% *(backstory-specific)*
- Tone/Style: 15%
- Narrative Coherence: 10%
- Cosine Similarity: 25% *(if reference provided)*

**Feature-Specific Metric:**

**Narrative Relevance** (0-1.0)
- Character grounding: Validates character name presence
- Backstory components: Origin markers, journey markers, events, turning points
- Deep context bonus: Influence/shaping elements

### Location Adventure Story Evaluation

**Weight Distribution:**
- Factual Consistency: 30%
- Resident Relevance: 20% *(adventure-specific)*
- Source Semantic Alignment: 20%
- Narrative Relevance: 15% *(adventure-specific)*
- Tone/Style: 10%
- Narrative Coherence: 5%
- Cosine Similarity: 25% *(if reference provided)*

**Feature-Specific Metrics:**

**Resident Relevance** (0-1.0)
- Measures story's integration of location residents
- Scoring: 0 residents → 0.0, 1 resident → 0.5, 2+ residents → 1.0

**Narrative Relevance** (0-1.0)
- Location groundedness, adventure/action markers, resident involvement

### LLM Judge Evaluation

When enabled (`use_llm_judge=true`):
- **Model**: GPT-4o (for now as it was the only model I had deployed else we can use a reasoning model as well)
- **Output**: Structured assessment with reasoning, strengths, issues, and improvement suggestions
- **Metrics**: Factual consistency and creativity (qualitative evaluation)
- **Purpose**: Provides human-like contextual understanding complementing automated metrics

### Overall Score Calculation

- Individual metrics normalized to [0, 1.0]
- Overall score: `Σ(metric_score × weight) / Σ(weights)`
- Automatic weight normalization when conditional metrics unavailable
- LLM judge scores provided separately without affecting automated score

---

## Future Considerations

### Caching Strategy
- **Redis Integration**: Cache frequently accessed Rick & Morty API responses to reduce latency and external API calls
- **TTL Strategy**: Implement time-to-live policies (24h for static character data, 1h for dynamic content)
- **Cache Invalidation**: Smart invalidation on data updates or manual refresh triggers

### Performance Optimization
- **Rate Limiting**: Implement request throttling for external API calls to prevent quota exhaustion
- **Database Connection Pooling**: Optimize PostgreSQL connection management for concurrent requests
- **Query Optimization**: Add database query performance monitoring and indexing improvements

### Semantic Search Enhancements

**Automatic Re-indexing:**
- Trigger vector embedding updates when notes are created or modified
- Re-index on AI backstory generation to include new narrative content in search
- Re-index on location adventure story generation for comprehensive search coverage
- Implement background job queue (Celery/RQ) for async re-indexing

**Search Quality Metrics:**
- Measure search relevance (precision, recall, NDCG)
- Track user engagement (click-through rates, result interactions)
- Implement A/B testing framework for search algorithm improvements
- Add search analytics dashboard

**Advanced Search Features:**
- Multi-factor ranking (relevance, popularity, recency)
- Search history and saved searches
- Autocomplete with semantic suggestions
- Complex query support (e.g., "alive scientists from dimension C-137")

### AI Generation Improvements

**Generation Quality:**
- Fine-tune prompts based on historical evaluation metrics
- Support multiple narrative styles (humorous, serious, cosmic horror)
- Implement dynamic prompt templates based on entity attributes
- Enrich context with user notes and previous generations

**Evaluation Infrastructure:**
- Persist evaluation results for trend analysis and model comparison
- Build evaluation dashboard with time-series metrics visualization
- Add user feedback mechanism to calibrate automated scores
- Implement side-by-side generation comparison view

### UI/UX Enhancements
- Add filtering capabilities (status, species, type, dimension) to character and location pages
- Implement name-based and semantic search on backstory and adventure pages
- Add pagination for large result sets
- Improve mobile responsiveness

### Scalability Considerations
- **Vector Database Migration**: If dataset exceeds 100K vectors or requires sub-10ms queries, evaluate Qdrant or Weaviate
- **Horizontal Scaling**: Prepare for multi-instance backend deployment with load balancing
- **Async Processing**: Move expensive operations (embedding generation, LLM calls) to background workers

---