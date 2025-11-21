CREATE TABLE IF NOT EXISTS search_indexes (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER NOT NULL,            -- Rick & Morty entity ID: 1, 42, etc.
    entity_type TEXT NOT NULL,          -- "character", "location", "episode"
    context TEXT NOT NULL,              -- The text used to generate embeddings
    embedding VECTOR(1536),             -- OpenAI text-embedding-3-small
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Enforce 1 row per entity (useful for UPSERT)
    CONSTRAINT unique_entity UNIQUE (entity_id, entity_type)
);


-- Faster upserts and search filtering by (entity_type + entity_id)
CREATE INDEX IF NOT EXISTS idx_search_indexes_entity_type_entity_id
ON search_indexes (entity_type, entity_id);

-- Individual indexes (optional but good for filtering/debug)
CREATE INDEX IF NOT EXISTS idx_search_indexes_entity_id
ON search_indexes (entity_id);

CREATE INDEX IF NOT EXISTS idx_search_indexes_entity_type
ON search_indexes (entity_type);


-- Trigger to update updated_at on row update
CREATE TRIGGER update_search_indexes_updated_at
    BEFORE UPDATE ON search_indexes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- Vector Index (IVFFlat + cosine similarity)
-- Highly recommended for semantic search performance
-- =============================================================

-- NOTE: Requires enough rows; run ANALYZE afterwards.
CREATE INDEX IF NOT EXISTS idx_search_indexes_embedding_cosine
ON search_indexes
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- -- Train the IVFFlat index
-- ANALYZE search_indexes;