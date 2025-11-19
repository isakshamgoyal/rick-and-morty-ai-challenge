'use client';

import { useState, useEffect } from 'react';
import { apiClient, type Note, type NoteCreate, type NoteUpdate } from '@/lib/api';

interface NotesPanelProps {
  characterId: number | null;
  characterName: string | null;
}

export default function NotesPanel({ characterId, characterName }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    if (characterId) {
      loadNotes();
    } else {
      setNotes([]);
    }
  }, [characterId]);

  const loadNotes = async () => {
    if (!characterId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getCharacterNotes(characterId);
      setNotes(data.notes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!characterId || !newNoteContent.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const newNote = await apiClient.createNote({
        character_id: characterId,
        content: newNoteContent.trim(),
      });
      setNotes(prev => [newNote, ...prev]);
      setNewNoteContent('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!editContent.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const updatedNote = await apiClient.updateNote(noteId, {
        content: editContent.trim(),
      });
      setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note));
      setEditingNoteId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    setError(null);
    try {
      await apiClient.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!characterId) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Select a character to view notes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Notes</h2>
          {characterName && (
            <p className="text-xs text-gray-500 mt-0.5">{characterName}</p>
          )}
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Note
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded-md text-xs">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note here..."
              className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCreateNote}
                disabled={loading || !newNoteContent.trim()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewNoteContent('');
                }}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Add a note to get started</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 rounded-md p-3 bg-white hover:shadow-sm transition-shadow"
            >
              {editingNoteId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={loading || !editContent.trim()}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {formatDate(note.created_at)}
                      {note.updated_at !== note.created_at && ' (edited)'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(note)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

