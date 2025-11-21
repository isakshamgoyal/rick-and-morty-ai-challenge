export interface EpisodeCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
}

export interface EpisodeDetailed {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: EpisodeCharacter[];
  created: string;
}


