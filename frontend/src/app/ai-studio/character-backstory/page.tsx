'use client';

import { useState, useCallback } from 'react';
import { useCharacters, CharacterGrid, CharacterDetails, type Character, type CharacterDetailed } from '@/src/features/characters';
import { useInfiniteScroll } from '@/src/shared/hooks';
import { apiClient, type BackstoryRequest, type GenerationResponse } from '@/src/shared/lib/api';

type ViewState = 'selection' | 'details' | 'generating' | 'result';

export default function CharacterBackstoryPage() {
  const { characters, loading, error, paginationError, hasMore, loadMore, retry, retryPagination } = useCharacters();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [characterDetails, setCharacterDetails] = useState<CharacterDetailed | null>(null);
  const [viewState, setViewState] = useState<ViewState>('selection');
  const [backstory, setBackstory] = useState<GenerationResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingBackstory, setLoadingBackstory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const observerTarget = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    error: error || paginationError,
  });

  const handleCharacterSelect = useCallback((character: Character) => {
    // Only allow character selection when in selection view
    // This prevents accidental resets when viewing details/backstory
    if (viewState !== 'selection') {
      return;
    }
    setSelectedCharacter(character);
    setCharacterDetails(null);
    setBackstory(null);
    setErrorMessage(null);
  }, [viewState]);

  const handleGenerateBackstory = useCallback(async () => {
    if (!selectedCharacter) return;

    setLoadingDetails(true);
    setErrorMessage(null);
    setViewState('details');

    try {
      // Fetch character details
      const details = await apiClient.getCharacter(selectedCharacter.id);
      setCharacterDetails(details);
      setLoadingDetails(false);

      // Start backstory generation
      setViewState('generating');
      setLoadingBackstory(true);

      // Prepare backstory request
      const backstoryRequest: BackstoryRequest = {
        character: details,
      };

      // Generate backstory
      const response = await apiClient.generateCharacterBackstory(backstoryRequest);
      setBackstory(response);
      setViewState('result');
      setLoadingBackstory(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate backstory');
      setLoadingDetails(false);
      setLoadingBackstory(false);
      // If we have character details, stay in details view to show error
      // Otherwise, go back to selection
      if (!characterDetails) {
        setViewState('selection');
      } else {
        // Stay in current view (details) to show error message
        setViewState('details');
      }
    }
  }, [selectedCharacter, characterDetails]);

  const hasErrorAndNoData = error && characters.length === 0;

  const handleBackToSelection = useCallback(() => {
    setViewState('selection');
    setSelectedCharacter(null);
    setCharacterDetails(null);
    setBackstory(null);
    setErrorMessage(null);
    setLoadingDetails(false);
    setLoadingBackstory(false);
  }, []);

  if (viewState === 'details' || viewState === 'generating' || viewState === 'result') {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleBackToSelection}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Selection
          </button>
        </div>

        {loadingDetails ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading character details...</p>
            </div>
          </div>
        ) : characterDetails ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mb-6">
              <CharacterDetails character={characterDetails} />
            </div>

            {viewState === 'generating' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm font-medium text-gray-900">Backstory generation in progress...</p>
                </div>
              </div>
            )}

            {viewState === 'result' && backstory && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Backstory</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{backstory.generated_content}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-md shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Error</p>
                    <p className="text-sm mt-1 text-red-700">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500">Failed to load character details</p>
              <button
                onClick={handleBackToSelection}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex-shrink-0 min-w-0">
        {selectedCharacter ? (
          <div className="flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={selectedCharacter.image}
                alt={selectedCharacter.name}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{selectedCharacter.name}</h2>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs text-gray-600">{selectedCharacter.species}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${
                    selectedCharacter.status === 'Alive' ? 'bg-green-100 text-green-800' :
                    selectedCharacter.status === 'Dead' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCharacter.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateBackstory}
              disabled={loadingDetails || loadingBackstory}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors shadow-sm flex-shrink-0"
            >
              Generate Backstory
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Select a character to generate backstory for</p>
              </div>
            </div>
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed shadow-sm flex-shrink-0"
            >
              Generate Backstory
            </button>
          </div>
        )}
      </div>

      {paginationError && characters.length > 0 && (
        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 px-4 py-3 rounded-md shadow-sm flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Warning</p>
              <p className="text-sm mt-1 text-yellow-700">Unable to load more characters. {paginationError}</p>
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

      <div className="flex-1 min-h-0 overflow-hidden pb-6">
        <CharacterGrid
          characters={characters}
          selectedCharacter={selectedCharacter}
          loading={loading}
          hasMore={hasMore}
          observerTarget={observerTarget}
          onCharacterSelect={handleCharacterSelect}
          error={hasErrorAndNoData ? error : null}
          onRetry={hasErrorAndNoData ? retry : undefined}
        />
      </div>
    </div>
  );
}

