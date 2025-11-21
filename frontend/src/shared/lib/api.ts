'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
}

export interface CharactersPage {
  info: PaginationInfo;
  results: Character[];
}

// Location for paginated list (minimal fields)
export interface Location {
  id: number;
  name: string;
  type: string;
  dimension: string;
}

// Location with residents (detailed view)
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

// Paginated locations without residents
export interface LocationsPage {
  info: PaginationInfo;
  results: Location[];
}

// Paginated locations with residents
export interface LocationsWithResidentsPage {
  info: PaginationInfo;
  results: LocationDetailed[];
}

// Character detail types
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

// AI Generation Types
export interface BackstoryRequest {
  character: CharacterDetailed;
}

export interface LocationAdventureStoryRequest {
  location: LocationDetailed;
}

export interface GenerationResponse {
  generated_content: string;
}

// AI Evaluation Types
export interface EvaluationRequest {
  generated_output: string;
  expected_output?: string | null;
  expected_output_embeddings?: number[] | null;
  metadata?: Record<string, any> | null;
}

export interface LLMJudgeSubMetric {
  score: number;
  reasoning: string;
  issues?: string[];
  strengths?: string[];
  improvements?: string[];
}

export interface LLMJudgeMetrics {
  factual_consistency?: LLMJudgeSubMetric;
  creativity?: LLMJudgeSubMetric;
  [key: string]: LLMJudgeSubMetric | undefined;
}

export interface EvaluationResponse {
  evaluation_metrics: Record<string, number>;
  llm_judge_metrics?: LLMJudgeMetrics | null;
  generated_output: string;
  expected_output?: string | null;
}

export interface AIHealthResponse {
  status: string;
  azure_openai: boolean;
}

// Semantic Search Types
export interface SearchResult {
  entity_id: number;
  entity_type: 'character' | 'location' | 'episode';
  score?: number | null;
  entity_data?: any;
}

export interface SearchInfo {
  query: string;
  limit: number;
  total_results: number;
}

export interface SearchResponse {
  info: SearchInfo;
  results: SearchResult[];
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

  async getLocations(page: number = 1, includeResidents: boolean = false): Promise<LocationsPage | LocationsWithResidentsPage> {
    const params = new URLSearchParams({ page: page.toString() });
    if (includeResidents) {
      params.append('include_residents', 'true');
    }
    return this.fetch<LocationsPage | LocationsWithResidentsPage>(`/locations?${params.toString()}`);
  }

  async getLocation(locationId: number): Promise<LocationDetailed> {
    return this.fetch<LocationDetailed>(`/locations/${locationId}`);
  }

  async getCharacters(page: number = 1): Promise<CharactersPage> {
    return this.fetch<CharactersPage>(`/characters?page=${page}`);
  }

  async getCharacter(characterId: number): Promise<CharacterDetailed> {
    return this.fetch<CharacterDetailed>(`/characters/${characterId}`);
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

  // Semantic Search
  async semanticSearch(query: string, limit: number = 5): Promise<SearchResponse> {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
    });
    return this.fetch<SearchResponse>(`/ai/search?${params.toString()}`);
  }

  // AI Generation Methods
  async checkAIHealth(): Promise<AIHealthResponse> {
    return this.fetch<AIHealthResponse>('/ai/health');
  }

  async generateCharacterBackstory(request: BackstoryRequest): Promise<GenerationResponse> {
    return this.fetch<GenerationResponse>('/ai/character-backstory/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateLocationAdventureStory(request: LocationAdventureStoryRequest): Promise<GenerationResponse> {
    return this.fetch<GenerationResponse>('/ai/location-adventure-story/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async evaluateLocationAdventureStory(request: EvaluationRequest): Promise<EvaluationResponse> {
    return this.fetch<EvaluationResponse>('/ai/location-adventure-story/evaluate?use_llm_judge=true', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async evaluateCharacterBackstory(request: EvaluationRequest): Promise<EvaluationResponse> {
    return this.fetch<EvaluationResponse>('/ai/character-backstory/evaluate?use_llm_judge=true', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Export the class
export { ApiClient };

// Create instance - using function to avoid Next.js evaluation issues
function createApiClient() {
  return new ApiClient();
}

// Export singleton instance
export const apiClient = createApiClient();

