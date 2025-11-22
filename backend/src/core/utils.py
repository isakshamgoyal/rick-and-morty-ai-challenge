import re


def clean_prompt(text: str) -> str:
    """Clean text by removing extra whitespace and normalizing."""
    cleaned = text.replace("\n", " ")
    cleaned = cleaned.replace("\t", " ")
    cleaned = re.sub(' +', ' ', cleaned)
    return cleaned.strip()


def contains_exact(text: str, value: str) -> bool:
    """Check if text contains an exact match for a value."""
    if not value:
        return False
    pattern = rf"\b{re.escape(value.lower())}\b"
    return re.search(pattern, text.lower()) is not None


def tokenize(text: str) -> list[str]:
    """Lightweight tokenizer for text processing."""
    return [w for w in re.findall(r"[a-zA-Z]+", text.lower())]


def format_residents_info(residents: list, limit: int = 5) -> str:
    """Formats resident characters into a readable list for the prompt."""
    if not residents:
        return "No known residents"
    
    residents_list = []
    for resident in residents:
        residents_list.append(f"{resident.name} ({resident.species}, {resident.status})")
    
    residents_list = residents_list[:limit]
    return "\n".join(residents_list)


def build_character_context(character, include_all_episodes_info: bool = True) -> str:
    """Build structured context string for a character."""
    episodes = character.episode or []
    
    context = f"""Character Name: {character.name}
Species: {character.species}
Status: {character.status}
Gender: {character.gender}
Type: {character.type or "Unknown"}
Origin: {character.origin.name} ({character.origin.dimension})
Current Location: {character.location.name} ({character.location.dimension})
Total Episodes: {len(episodes)} episode(s)"""

    if include_all_episodes_info:
        episode_names = ", ".join(episode.name for episode in episodes) if episodes else "None"
    else:
        episode_names = ", ".join(episode.name for episode in episodes[:5]) if episodes else "None"
    
    context += f"\nEpisodes Info: {episode_names}"

    return context.strip()


def build_location_context(location, include_all_residents_info: bool = True) -> str:
    """Build structured context string for a location."""
    residents = location.residents or []
    residents_count = len(residents)
    residents_limit = residents_count if include_all_residents_info else 5
    
    context = f"""Location: {location.name}
Type: {location.type}
Dimension: {location.dimension}
Total Residents: {residents_count}
Residents Info: {format_residents_info(residents, residents_limit)}
"""

    return context.strip()

def build_episode_context(episode, include_all_characters_info: bool = True) -> str:
    """Build structured context string for an episode."""
    characters = episode.characters or []
    character_count = len(characters)
    character_limit = character_count if include_all_characters_info else 5
    character_names = ", ".join(character.name for character in characters[:character_limit]) if characters else "None"
    
    context = f"""Episode: {episode.name}
Episode Number: {episode.episode}
Air Date: {episode.air_date}
Total Characters: {character_count}
Characters Info: "{character_names}"
"""

    
    return context.strip()
