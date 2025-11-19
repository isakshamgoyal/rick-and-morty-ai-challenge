'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient, type Location, type Character } from '@/lib/api';

export default function BrowsePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [error, setError] = useState<string | null>(null);
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
              <div className="text-center">
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

