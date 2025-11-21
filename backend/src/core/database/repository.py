from typing import Optional, TypeVar, Generic, Type

from sqlalchemy.orm import Session, DeclarativeBase
from sqlalchemy import func

ModelType = TypeVar("ModelType", bound=DeclarativeBase)

class BaseRepository(Generic[ModelType]):
    """Base repository for centralized ORM query execution."""
    
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db
    
    def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get a single record by ID."""
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def create(self, **kwargs) -> ModelType:
        """Create a new record."""
        instance = self.model(**kwargs)
        self.db.add(instance)
        self.db.flush()  # Gets ID back
        self.db.refresh(instance)  # Gets created_at, updated_at from DB
        return instance
    
    def update(self, id: int, **kwargs) -> Optional[ModelType]:
        """Update a record by ID."""
        instance = self.db.query(self.model).filter(self.model.id == id).first()
        if not instance:
            return None
        
        for key, value in kwargs.items():
            setattr(instance, key, value)
        
        self.db.flush()
        self.db.refresh(instance)
        return instance
    
    def delete(self, id: int) -> bool:
        """Delete a record by ID."""
        instance = self.db.query(self.model).filter(self.model.id == id).first()
        if not instance:
            return False
        
        self.db.delete(instance)
        return True
    
    def filter(self, *conditions, limit: Optional[int] = None, offset: int = 0, order_by=None):
        """Filter records with optional pagination and ordering."""
        query = self.db.query(self.model)
        
        if conditions:
            for condition in conditions:
                query = query.filter(condition)
        
        if order_by:
            query = query.order_by(order_by)
        
        if offset:
            query = query.offset(offset)
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    def count(self, *conditions) -> int:
        """Count records matching conditions."""
        query = self.db.query(func.count(self.model.id))
        
        if conditions:
            for condition in conditions:
                query = query.filter(condition)
        
        return query.scalar() or 0
