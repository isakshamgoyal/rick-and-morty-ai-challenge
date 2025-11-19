import logging
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from src.core.database import db_connection
from src.domains.notes import models as notes_models
from src.domains.notes.service import NotesService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.post("", response_model=notes_models.NoteResponse, status_code=201)
async def create_note(
    note_data: notes_models.NoteCreate,
    db: Session = Depends(db_connection.get_db)
):
    """Create a new note for a character."""
    try:
        service = NotesService(db)
        note = service.create_note(note_data)
        return note
    except Exception as e:
        logger.error(f"Error creating note: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create note: {str(e)}")


@router.get("/character/{character_id}", response_model=notes_models.NotesListResponse)
async def get_character_notes(
    character_id: int,
    limit: int = Query(None, ge=1, le=100, description="Maximum number of notes to return"),
    offset: int = Query(0, ge=0, description="Number of notes to skip"),
    db: Session = Depends(db_connection.get_db)
):
    """Get all notes for a specific character."""
    try:
        service = NotesService(db)
        notes, total = service.get_notes_with_count(character_id, limit, offset)
        return notes_models.NotesListResponse(notes=notes, total=total)
    except Exception as e:
        logger.error(f"Error fetching notes for character {character_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch notes: {str(e)}")


@router.get("/{note_id}", response_model=notes_models.NoteResponse)
async def get_note(note_id: int, db: Session = Depends(db_connection.get_db)):
    """Get a specific note by ID."""
    service = NotesService(db)
    note = service.get_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail=f"Note {note_id} not found")
    return note


@router.put("/{note_id}", response_model=notes_models.NoteResponse)
async def update_note(
    note_id: int,
    note_data: notes_models.NoteUpdate,
    db: Session = Depends(db_connection.get_db)
):
    """Update an existing note."""
    service = NotesService(db)
    note = service.update_note(note_id, note_data)
    if not note:
        raise HTTPException(status_code=404, detail=f"Note {note_id} not found")
    return note


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: int, db: Session = Depends(db_connection.get_db)):
    """Delete a note."""
    service = NotesService(db)
    deleted = service.delete_note(note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Note {note_id} not found")
