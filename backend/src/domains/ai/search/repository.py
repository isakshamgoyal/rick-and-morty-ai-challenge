from typing import Optional

from sqlalchemy import text, select
from sqlalchemy.orm import Session

from src.core.database.repository import BaseRepository
from src.domains.ai.search.models import SearchIndex


class SearchRepository(BaseRepository[SearchIndex]):
    """Repository for SearchIndex model and search_index table."""

    def __init__(self, db: Session):
        super().__init__(SearchIndex, db)

    def get_id_by_entity(self, entity_id: int, entity_type: str) -> Optional[int]:
        """Get row id for an entity if it exists."""
        select_sql = text(
            """
            SELECT id
            FROM search_indexes
            WHERE entity_id = :entity_id
              AND entity_type = :entity_type
            """
        )
        row_id = self.db.execute(
            select_sql,
            {"entity_id": entity_id, "entity_type": entity_type},
        ).scalar()
        return int(row_id) if row_id is not None else None

    def search(
        self,
        query_embedding: list[float],
        limit: int = 5,
    ) -> list[tuple[SearchIndex, float]]:
        """Perform semantic search and return ORM rows with similarity scores."""
        distance_expr = SearchIndex.embedding.cosine_distance(query_embedding)
        similarity_expr = (1 - distance_expr).label("similarity")

        stmt = (
            select(SearchIndex, similarity_expr)
            .order_by(distance_expr)
            .limit(limit)
        )

        rows = self.db.execute(stmt).all()
        return rows

