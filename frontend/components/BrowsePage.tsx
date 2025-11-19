'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient, type Location, type Character, type Note } from '@/lib/api';

export default function BrowsePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingPagesRef = useRef<Set<number>>(new Set());

  const loadLocations = useCallback(async (page: number) => {
    if (loadingPagesRef.current.has(page)) return;
    
    loadingPagesRef.current.add(page);
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getLocations(page);
      
      setLocations(prev => {
        if (page === 1) {
          return data.results;
        }
        return [...prev, ...data.results];
      });
      
      setHasMore(data.info.next !== null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading locations:', error);
      setError('Failed to load locations. Make sure the backend is running.');
    } finally {
      setLoading(false);
      loadingPagesRef.current.delete(page);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = currentPage + 1;
    loadLocations(nextPage);
  }, [loading, hasMore, currentPage, loadLocations]);

  useEffect(() => {
    loadLocations(1);
  }, [loadLocations]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setSelectedCharacter(null);
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    loadNotes(character.id);
  };

  const loadNotes = async (characterId: number) => {
    setNotesLoading(true);
    try {
      const data = await apiClient.getCharacterNotes(characterId);
      setNotes(data.notes);
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCharacter || !newNoteContent.trim() || savingNote) return;

    setSavingNote(true);
    try {
      const newNote = await apiClient.createNote({
        character_id: selectedCharacter.id,
        content: newNoteContent.trim(),
      });
      setNotes(prev => [newNote, ...prev]);
      setNewNoteContent('');
    } catch (err) {
      console.error('Error creating note:', err);
      alert('Failed to create note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!editContent.trim()) return;

    setSavingNote(true);
    try {
      const updatedNote = await apiClient.updateNote(noteId, {
        content: editContent.trim(),
      });
      setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note));
      setEditingNoteId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating note:', err);
      alert('Failed to update note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setSavingNote(true);
    try {
      await apiClient.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note');
    } finally {
      setSavingNote(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Alive':
        return 'text-green-600 bg-green-50';
      case 'Dead':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Rick & Morty AI</h1>
        <p className="text-xs text-gray-500 mt-1">Character Database</p>
      </div>
      <div className="p-8">
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md shadow-sm">
          <p className="text-sm font-medium">Error</p>
          <p className="text-sm mt-1 text-red-600">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-white border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Locations</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {locations.map((location) => {
              const isSelected = selectedLocation?.id === location.id;
              return (
                <div
                  key={location.id}
                  className={`border rounded-md p-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{location.name}</p>
                      <p className="text-xs text-gray-500 mt-1.5">
                        <span className="font-medium">{location.type}</span>
                        <span className="mx-1.5">·</span>
                        <span>{location.dimension}</span>
                        <span className="mx-1.5">·</span>
                        <span>{location.residents.length} {location.residents.length === 1 ? 'resident' : 'residents'}</span>
                      </p>
                    </div>
                    {isSelected && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {hasMore && <div ref={observerTarget} className="h-4" />}
            
            {loading && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Loading more locations...
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-white border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Residents</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedLocation ? (
              selectedLocation.residents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No residents at this location
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedLocation.residents.map((character) => {
                    const isSelected = selectedCharacter?.id === character.id;
                    return (
                      <div
                        key={character.id}
                        className={`border rounded-md p-3 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleCharacterSelect(character)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={character.image}
                            alt={character.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{character.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              <span>{character.species}</span>
                              <span className="mx-1.5">·</span>
                              <span className="capitalize">{character.status}</span>
                            </p>
                          </div>
                          {isSelected && (
                            <div className="ml-2 flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a location to see residents
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-white border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Resident Details</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedCharacter ? (
              <div>
                <div className="text-center mb-6">
                  <img
                    src={selectedCharacter.image}
                    alt={selectedCharacter.name}
                    className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-4 border-gray-100 shadow-sm"
                  />
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{selectedCharacter.name}</h2>
                  <div className="flex items-center justify-center gap-6">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Status</span>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCharacter.status)}`}>
                        {selectedCharacter.status}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Species</span>
                      <div className="text-gray-900 text-sm">
                        {selectedCharacter.species}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
                  
                  <div className="mb-4">
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Add a note about this character..."
                      disabled={savingNote}
                      className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      rows={3}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={savingNote || !newNoteContent.trim()}
                      className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingNote ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {notesLoading ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Loading notes...
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No notes yet
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
                                disabled={savingNote}
                                className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                rows={3}
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleUpdateNote(note.id)}
                                  disabled={savingNote || !editContent.trim()}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  disabled={savingNote}
                                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-900 whitespace-pre-wrap mb-2">{note.content}</p>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-500">
                                  {formatDate(note.created_at)}
                                  {note.updated_at !== note.created_at && ' (edited)'}
                                </span>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => startEditing(note)}
                                    disabled={savingNote}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    disabled={savingNote}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                  >
                                    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
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
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">Select a resident to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

