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

