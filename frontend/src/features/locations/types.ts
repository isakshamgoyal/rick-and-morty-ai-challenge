export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
}

// Location for paginated list
export interface Location {
  id: number;
  name: string;
  type: string;
  dimension: string;
}

// Location with residents
export interface LocationDetailed {
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

// Paginated locations
export interface LocationsPage {
  info: PaginationInfo;
  results: Location[];
}

// Paginated locations with residents
export interface LocationsWithResidentsPage {
  info: PaginationInfo;
  results: LocationDetailed[];
}

