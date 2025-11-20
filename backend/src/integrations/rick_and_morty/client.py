import logging
from typing import Dict, Any
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

from src.core.config import settings
from src.core.exceptions import ExternalServiceException

logger = logging.getLogger(__name__)


class GraphQLClient:
    """Handles GraphQL connection and query execution for Rick & Morty API."""
    
    def __init__(self):
        """Initializes the GraphQL client with transport configuration."""
        transport = RequestsHTTPTransport(
            url=settings.RICK_MORTY_GRAPHQL_URL,
            retries=3,
            timeout=30
        )
        self.client = Client(transport=transport, fetch_schema_from_transport=False)
    
    def execute(self, query: str, variables: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Executes a GraphQL query against the API.
        
        Args:
            query: GraphQL query string
            variables: Query variables dictionary
            
        Returns:
            Query result as dictionary
            
        Raises:
            ExternalServiceException: If query execution fails
        """
        try:
            gql_query = gql(query)
            result = self.client.execute(gql_query, variable_values=variables or {})
            return result
        except Exception as e:
            logger.error(f"GraphQL query execution failed: {e}")
            raise ExternalServiceException(f"Failed to execute GraphQL query: {str(e)}")
