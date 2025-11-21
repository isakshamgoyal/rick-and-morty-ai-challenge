class EpisodeQueries:
    """GraphQL query strings for fetching episode data."""

    GET_EPISODES_PAGE = """
        query GetEpisodesPage($page: Int!) {
            episodes(page: $page) {
                info {
                    count
                    pages
                    next
                    prev
                }
                results {
                    id
                    name
                    air_date
                    episode
                }
            }
        }
    """

    GET_EPISODE_BY_ID = """
        query GetEpisode($id: ID!) {
            episode(id: $id) {
                id
                name
                air_date
                episode
                characters {
                    id
                    name
                    status
                    species
                    image
                }
                created
            }
        }
    """


