'use client';

import { useState } from 'react';
import { useNotes } from './hooks/useNotes';
import NoteCard from './components/NoteCard';

interface NotesPanelProps {
  characterId: number | null;
  characterName?: string | null;
}

export function NotesPanel({ characterId, characterName }: NotesPanelProps) {
  const { notes, loading, saving, error, createNote, updateNote, deleteNote } = useNotes(characterId);
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleCreateNote = async () => {
    if (!characterId || !newNoteContent.trim()) return;
    
    try {
      await createNote({
        character_id: characterId,
        content: newNoteContent.trim(),
      });
      setNewNoteContent('');
    } catch (err) {
      alert('Failed to create note');
    }
  };

  const handleUpdateNote = async (noteId: number, content: string) => {
    try {
      await updateNote(noteId, { content });
    } catch (err) {
      alert('Failed to update note');
      throw err;
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNote(noteId);
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  if (!characterId) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
        <div className="text-center py-4 text-gray-400 text-sm">
          No notes yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md shadow-sm text-xs">
          {error}
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Add a note about this character..."
          disabled={saving}
          className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          rows={3}
        />
        <button
          onClick={handleCreateNote}
          disabled={saving || !newNoteContent.trim()}
          className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>

      <div className="space-y-3">
        {loading && notes.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            No notes yet
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              loading={saving}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>
    </div>
  );
}

