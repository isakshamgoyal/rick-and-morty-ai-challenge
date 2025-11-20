class CharacterQueries:
    """GraphQL query strings for fetching character data."""
    
    GET_CHARACTERS_PAGE = """
        query GetCharactersPage($page: Int!) {
            characters(page: $page) {
                info {
                    count
                    pages
                    next
                    prev
                }
                results {
                    id
                    name
                    status
                    species
                    image
                }
            }
        }
    """
    
    GET_CHARACTER_BY_ID = """
        query GetCharacter($id: ID!) {
            character(id: $id) {
                id
                name
                status
                species
                type
                gender
                origin {
                    name
                    type
                    dimension
                }
                location {
                    name
                    type
                    dimension
                }
                image
                episode {
                    name
                    air_date
                }
                created
            }
        }
    """
