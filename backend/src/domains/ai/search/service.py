import logging

from sqlalchemy.orm import Session

from src.domains.ai.search import models as search_models
from src.domains.ai.search.repository import SearchRepository
from src.domains.characters.service import characters_service
from src.domains.episodes.service import episodes_service
from src.domains.locations.service import locations_service
from src.integrations.azure_openai_client import azure_openai_client


logger = logging.getLogger(__name__)


class SearchService:
    """Search indexing and retrieval."""

    def __init__(self, db: Session):
        self.repository = SearchRepository(db)

    async def search(self, query: str, limit: int = 5) -> search_models.SearchResponse:
        """Run semantic text search over indexed entities."""
        logger.info("Semantic Search called", extra={"query": query})

        # Generate embedding for the query
        embedding = await azure_openai_client.generate_embedding(query)

        # Search the search index for the query
        base_rows = self.repository.search(embedding, limit=limit)

        # Enrich results with detailed entity data
        enriched_results: list[search_models.SearchResult] = []
        for entry, similarity in base_rows:
            entity_id = entry.entity_id
            entity_type = entry.entity_type

            if entity_type == "character":
                entity = characters_service.get_character_by_id(entity_id)
            elif entity_type == "location":
                entity = locations_service.get_location_by_id(entity_id)
            elif entity_type == "episode":
                entity = episodes_service.get_episode_by_id(entity_id)
            else:
                entity = None

            entity_data = entity.model_dump() if entity is not None else {}

            enriched_results.append(
                search_models.SearchResult(
                    score=float(similarity),
                    entity_id=entity_id,
                    entity_type=entity_type,
                    entity_data=entity_data,
                )
            )

        info = search_models.SearchInfo(
            query=query,
            limit=limit,
            total_results=len(enriched_results),
        )

        return search_models.SearchResponse(info=info, results=enriched_results)
    
    
    async def index_entity(
        self, payload: search_models.EntityIndexRequest
    ) -> search_models.EntityIndexResponse:
        """Index or re-index an entity context."""

        entity_id = payload.id
        entity_type = payload.type

        # Build base context from the appropriate domain service
        if entity_type == "character":
            base_context = characters_service.get_character_context(entity_id, include_all_episodes_info=False)
        elif entity_type == "location":
            base_context = locations_service.get_location_context(entity_id, include_all_residents_info=False)
        elif entity_type == "episode":
            base_context = episodes_service.get_episode_context(entity_id, include_all_characters_info=True)
        else:
            raise ValueError(f"Unsupported entity type: {entity_type}")

        # Enrich with additional context (empty string by default)
        full_context = f"entity_type: {entity_type}\n{base_context}\n\n{payload.additional_context}".strip()

        # Generate embedding for the full context   
        embedding = await azure_openai_client.generate_embedding(full_context)

        # Check if the entity already exists in the search index
        existing_id = self.repository.get_id_by_entity(entity_id, entity_type)
        if existing_id is not None:
            # If the entity already exists in the search index, update it
            instance = self.repository.update(
                id=existing_id,
                context=full_context,
                embedding=embedding,
            )
        else:
            # If the entity does not exist in the search index, create it
            instance = self.repository.create(
                entity_id=entity_id,
                entity_type=entity_type,
                context=full_context,
                embedding=embedding,
            )

        logger.info(f"Indexed entity into search_index; id: {instance.id}, entity_id: {entity_id}, entity_type: {entity_type}")

        return search_models.EntityIndexResponse(
            id=instance.id,
            entity_id=entity_id,
            entity_type=entity_type,
            context=full_context,
        )
