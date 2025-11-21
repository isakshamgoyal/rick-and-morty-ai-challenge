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

def format_residents_info(residents: list) -> str:
    """Formats resident characters into a readable list for the prompt."""
    if not residents:
        return "No known residents"
    
    residents_list = []
    for resident in residents:
        residents_list.append(f"{resident.name} ({resident.species}, {resident.status})")
    
    return "\n".join(residents_list)


def build_character_context(character) -> str:
    """Build structured context string for a character."""
    episodes = character.episode or []
    episode_count = len(episodes)
    episode_names = ", ".join(episode.name for episode in episodes) if episodes else "None"
    
    context = f"""Name: {character.name}
Species: {character.species}
Status: {character.status}
Gender: {character.gender}
Type: {character.type}
Origin: {character.origin.name} ({character.origin.dimension})
Current Location: {character.location.name} ({character.location.dimension})
Total Episodes: {episode_count} episode(s)
All the episodes in which the character appeared: {episode_names}"""
    
    return context.strip()


def build_location_context(location) -> str:
    """Build structured context string for a location."""
    residents = location.residents or []
    residents_count = len(residents)
    residents_info = format_residents_info(residents)
    
    context = f"""Location: {location.name}
Type: {location.type}
Dimension: {location.dimension}
Residents ({residents_count}):
{residents_info}"""
                    
    return context.strip()
