import { useState, useEffect } from 'react';
import { apiClient } from '@/src/shared/lib/api';
import type { Note, NoteCreate, NoteUpdate } from '../types';

export function useNotes(characterId: number | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (characterId) {
      loadNotes();
    } else {
      setNotes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const createNote = async (noteData: NoteCreate) => {
    setSaving(true);
    setError(null);
    try {
      const newNote = await apiClient.createNote(noteData);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateNote = async (noteId: number, noteData: NoteUpdate) => {
    setSaving(true);
    setError(null);
    try {
      const updatedNote = await apiClient.updateNote(noteId, noteData);
      setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note));
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (noteId: number) => {
    setSaving(true);
    setError(null);
    try {
      await apiClient.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    notes,
    loading,
    saving,
    error,
    createNote,
    updateNote,
    deleteNote,
    refresh: loadNotes,
  };
}

