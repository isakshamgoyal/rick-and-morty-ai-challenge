export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
}

export interface Location {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: Character[];
}

export interface PaginationInfo {
  count: number;
  pages: number;
  next: number | null;
  prev: number | null;
}

export interface LocationsPage {
  info: PaginationInfo;
  results: Location[];
}

