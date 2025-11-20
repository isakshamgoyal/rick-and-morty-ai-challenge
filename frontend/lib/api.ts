const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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

export interface Note {
  id: number;
  character_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  character_id: number;
  content: string;
}

export interface NoteUpdate {
  content: string;
}

export interface NotesListResponse {
  notes: Note[];
  total: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText || response.statusText}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async getLocations(page: number = 1): Promise<LocationsPage> {
    return this.fetch<LocationsPage>(`/locations?page=${page}`);
  }

  async getCharacterNotes(characterId: number, limit?: number, offset?: number): Promise<NotesListResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const query = params.toString();
    return this.fetch<NotesListResponse>(`/notes/character/${characterId}${query ? `?${query}` : ''}`);
  }

  async createNote(noteData: NoteCreate): Promise<Note> {
    return this.fetch<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(noteId: number, noteData: NoteUpdate): Promise<Note> {
    return this.fetch<Note>(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(noteId: number): Promise<void> {
    return this.fetch<void>(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

