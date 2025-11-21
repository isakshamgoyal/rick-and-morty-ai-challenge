from typing import Optional
from sqlalchemy.orm import Session

from src.core.database.repository import BaseRepository


class NotesRepository(BaseRepository):
    """Repository for Note model."""
    
    def __init__(self, db: Session):
        from src.domains.notes.models import Note
        super().__init__(Note, db)
    
    def get_by_character_id(
        self, 
        character_id: int,
        limit: Optional[int] = None,
        offset: int = 0
    ):
        """Get notes for a character ordered by creation date."""
        query = self.db.query(self.model).filter(
            self.model.character_id == character_id
        ).order_by(self.model.created_at.desc())
        
        if offset:
            query = query.offset(offset)
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def count_by_character_id(self, character_id: int) -> int:
        """Count notes for a character."""
        return self.db.query(self.model).filter(
            self.model.character_id == character_id
        ).count()
