class LocationQueries:
    """GraphQL query strings for fetching location data."""
    
    GET_LOCATIONS_PAGE = """
        query GetLocationsPage($page: Int!) {
            locations(page: $page) {
                info {
                    count
                    pages
                    next
                    prev
                }
                results {
                    id
                    name
                    type
                    dimension
                }
            }
        }
    """
    
    GET_LOCATION_BY_ID = """
        query GetLocation($id: ID!) {
            location(id: $id) {
                id
                name
                type
                dimension
                residents {
                    id
                    name
                    status
                    species
                    image
                }
            }
        }
    """
    
    GET_LOCATIONS_WITH_RESIDENTS_PAGE = """
        query GetLocationsWithResidentsPage($page: Int!) {
            locations(page: $page) {
                info {
                    count
                    pages
                    next
                    prev
                }
                results {
                    id
                    name
                    type
                    dimension
                    residents {
                        id
                        name
                        status
                        species
                        image
                    }
                }
            }
        }
    """
