'use client';

import { useState, useCallback, useMemo } from 'react';
import type { LocationDetailed, Character } from './types';
import { useLocations } from './hooks/useLocations';
import { useInfiniteScroll } from '@/src/shared/hooks';
import LocationList from './components/LocationList';
import ResidentList from './components/ResidentList';
import CharacterDetails from './components/CharacterDetails';
import { NotesPanel } from '@/src/features/notes';

export default function BrowsePage() {
  const { locations, loading, error, paginationError, hasMore, loadMore, retry, retryPagination } = useLocations(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetailed | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  const observerTarget = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    error: error || paginationError,
  });

  const handleLocationSelect = useCallback((location: LocationDetailed) => {
    setSelectedLocation(location);
    setSelectedCharacter(null);
  }, []);

  const handleCharacterSelect = useCallback((character: Character) => {
    setSelectedCharacter(character);
  }, []);

  const hasErrorAndNoData = error && locations.length === 0;

  return (
    <div className="bg-gray-50 h-full overflow-hidden">
      <div className="p-8 h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Browse Locations</h1>
          <p className="text-sm text-gray-500">Select a location to view its residents</p>
        </div>
      
        {paginationError && locations.length > 0 && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 px-4 py-3 rounded-md shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">Warning</p>
                <p className="text-sm mt-1 text-yellow-700">Unable to load more locations. {paginationError}</p>
              </div>
              <button
                onClick={retryPagination}
                disabled={loading}
                className="ml-4 px-3 py-1.5 text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        )}
      
        <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
          <LocationList
            locations={locations}
            selectedLocation={selectedLocation}
            loading={loading}
            hasMore={hasMore}
            observerTarget={observerTarget}
            onLocationSelect={handleLocationSelect}
            error={hasErrorAndNoData ? error : null}
            onRetry={hasErrorAndNoData ? retry : undefined}
          />

          <ResidentList
            location={selectedLocation}
            selectedCharacter={selectedCharacter}
            onCharacterSelect={handleCharacterSelect}
          />

          <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 bg-white border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Resident Details</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedCharacter ? (
                <div>
                  <CharacterDetails character={selectedCharacter} />

                  <div className="border-t border-gray-200 pt-6">
                    <NotesPanel 
                      characterId={selectedCharacter.id}
                      characterName={selectedCharacter.name}
                    />
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

