-- Migration: Create notes table
-- Created: Initial schema setup

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on character_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_notes_character_id ON notes(character_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on row update
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

