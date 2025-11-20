import { memo } from 'react';
import type { Character } from '../types';
import CharacterCard from './CharacterCard';

interface CharacterGridProps {
  characters: Character[];
  selectedCharacter: Character | null;
  loading: boolean;
  hasMore: boolean;
  observerTarget: React.RefObject<HTMLDivElement | null>;
  onCharacterSelect: (character: Character) => void;
  error?: string | null;
  onRetry?: () => void;
}

function CharacterGrid({
  characters,
  selectedCharacter,
  loading,
  hasMore,
  observerTarget,
  onCharacterSelect,
  error,
  onRetry,
}: CharacterGridProps) {
  const isEmpty = characters.length === 0;
  const isInitialLoad = loading && isEmpty && !error;
  const hasErrorAndNoData = error && isEmpty;

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-full">
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Characters</h2>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-6 min-h-0">
        {isInitialLoad ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-sm text-gray-500">Loading characters...</p>
          </div>
        ) : hasErrorAndNoData ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="mb-4">
              <svg className="w-12 h-12 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1 text-center">Failed to load characters</p>
            <p className="text-xs text-gray-500 mb-4 text-center">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Retrying...' : 'Retry'}
              </button>
            )}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-gray-500">No characters found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-w-full">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={selectedCharacter?.id === character.id}
                onClick={onCharacterSelect}
              />
            ))}
            
            {hasMore && <div ref={observerTarget} className="h-4 col-span-full" />}
            
            {loading && (
              <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                Loading more characters...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CharacterGrid);

