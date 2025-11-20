export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
}

export interface CharacterLocation {
  name: string;
  type: string;
  dimension: string;
}

export interface Episode {
  name: string;
  air_date: string;
}

export interface CharacterDetailed {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: CharacterLocation;
  location: CharacterLocation;
  image: string;
  episode: Episode[];
  created: string;
}

export interface PaginationInfo {
  count: number;
  pages: number;
  next: number | null;
  prev: number | null;
}

export interface CharactersPage {
  info: PaginationInfo;
  results: Character[];
}

