import logging
from typing import Tuple, Optional
from sqlalchemy.orm import Session

from src.domains.notes.models import NoteCreate, NoteUpdate, NoteResponse
from src.domains.notes.repository import NotesRepository

logger = logging.getLogger(__name__)


class NotesService:
    """Service for note operations."""
    
    def __init__(self, db: Session):
        self.repository = NotesRepository(db)
    
    def create_note(self, note_data: NoteCreate) -> NoteResponse:
        """Create a new note for a character."""
        note = self.repository.create(
            character_id=note_data.character_id,
            content=note_data.content,
        )
        logger.info(f"Created note {note.id} for character {note_data.character_id}")
        return NoteResponse.model_validate(note)
    
    def get_notes_by_character(
        self, 
        character_id: int,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> list[NoteResponse]:
        """Get all notes for a specific character."""
        notes = self.repository.get_by_character_id(character_id, limit, offset)
        logger.debug(f"Found {len(notes)} notes for character {character_id}")
        return [NoteResponse.model_validate(note) for note in notes]
    
    def get_notes_with_count(
        self,
        character_id: int,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> Tuple[list[NoteResponse], int]:
        """Get notes and total count using repository."""
        notes = self.repository.get_by_character_id(character_id, limit, offset)
        total = self.repository.count_by_character_id(character_id)
        return [NoteResponse.model_validate(note) for note in notes], total
    
    def get_note(self, note_id: int) -> Optional[NoteResponse]:
        """Get a specific note by ID."""
        note = self.repository.get_by_id(note_id)
        if note:
            return NoteResponse.model_validate(note)
        return None
    
    def update_note(
        self, 
        note_id: int, 
        note_data: NoteUpdate
    ) -> Optional[NoteResponse]:
        """Update an existing note."""
        note = self.repository.update(note_id, content=note_data.content)
        if note:
            logger.info(f"Updated note {note_id}")
            return NoteResponse.model_validate(note)
        return None
    
    def delete_note(self, note_id: int) -> bool:
        """Delete a note."""
        deleted = self.repository.delete(note_id)
        if deleted:
            logger.info(f"Deleted note {note_id}")
        return deleted
    
    def count_notes_by_character(self, character_id: int) -> int:
        """Count total notes for a character."""
        return self.repository.count_by_character_id(character_id)
