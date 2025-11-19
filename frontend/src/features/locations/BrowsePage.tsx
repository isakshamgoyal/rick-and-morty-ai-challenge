'use client';

import { useState } from 'react';
import type { Location, Character } from './types';
import { useLocations } from './hooks/useLocations';
import { useInfiniteScroll } from '@/src/shared/hooks';
import LocationList from './components/LocationList';
import ResidentList from './components/ResidentList';
import CharacterDetails from './components/CharacterDetails';
import { NotesPanel } from '@/src/features/notes';

export default function BrowsePage() {
  const { locations, loading, error, hasMore, loadMore } = useLocations();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const observerTarget = useInfiniteScroll(hasMore, loading, loadMore);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setSelectedCharacter(null);
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Browse Locations</h1>
          <p className="text-sm text-gray-500">Select a location to view its residents</p>
        </div>
      
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md shadow-sm">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm mt-1 text-red-600">{error}</p>
          </div>
        )}
      
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-240px)]">
          <LocationList
            locations={locations}
            selectedLocation={selectedLocation}
            loading={loading}
            hasMore={hasMore}
            observerTarget={observerTarget}
            onLocationSelect={handleLocationSelect}
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

