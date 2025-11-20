'use client';

import { useState, useCallback } from 'react';
import { LocationGrid, LocationDetails, useLocationsList, type Location, type LocationDetailed } from '@/src/features/locations';
import { useInfiniteScroll } from '@/src/shared/hooks';
import { apiClient, type LocationAdventureStoryRequest, type GenerationResponse } from '@/src/shared/lib/api';

type ViewState = 'selection' | 'details' | 'generating' | 'result';

export default function LocationAdventurePage() {
  const { locations, loading, error, paginationError, hasMore, loadMore, retry, retryPagination } = useLocationsList();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationDetails, setLocationDetails] = useState<LocationDetailed | null>(null);
  const [viewState, setViewState] = useState<ViewState>('selection');
  const [adventureStory, setAdventureStory] = useState<GenerationResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingAdventureStory, setLoadingAdventureStory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const observerTarget = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    error: error || paginationError,
  });

  const handleLocationSelect = useCallback((location: Location) => {
    // Only allow location selection when in selection view
    // This prevents accidental resets when viewing details/adventure story
    if (viewState !== 'selection') {
      return;
    }
    setSelectedLocation(location);
    setLocationDetails(null);
    setAdventureStory(null);
    setErrorMessage(null);
  }, [viewState]);

  const handleGenerateAdventureStory = useCallback(async () => {
    if (!selectedLocation) return;

    setLoadingDetails(true);
    setErrorMessage(null);
    setViewState('details');

    try {
      // Fetch location details with residents
      const details = await apiClient.getLocation(selectedLocation.id);
      setLocationDetails(details);
      setLoadingDetails(false);

      // Start adventure story generation
      setViewState('generating');
      setLoadingAdventureStory(true);

      // Prepare adventure story request
      const adventureStoryRequest: LocationAdventureStoryRequest = {
        location: details,
      };

      // Generate adventure story
      const response = await apiClient.generateLocationAdventureStory(adventureStoryRequest);
      setAdventureStory(response);
      setViewState('result');
      setLoadingAdventureStory(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate adventure story');
      setLoadingDetails(false);
      setLoadingAdventureStory(false);
      // If we have location details, stay in details view to show error
      // Otherwise, go back to selection
      if (!locationDetails) {
        setViewState('selection');
      } else {
        // Stay in current view (details) to show error message
        setViewState('details');
      }
    }
  }, [selectedLocation, locationDetails]);

  const hasErrorAndNoData = error && locations.length === 0;

  const handleBackToSelection = useCallback(() => {
    setViewState('selection');
    setSelectedLocation(null);
    setLocationDetails(null);
    setAdventureStory(null);
    setErrorMessage(null);
    setLoadingDetails(false);
    setLoadingAdventureStory(false);
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
              <p className="text-sm text-gray-500">Loading location details...</p>
            </div>
          </div>
        ) : locationDetails ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mb-6">
              <LocationDetails location={locationDetails} />
            </div>

            {viewState === 'generating' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm font-medium text-gray-900">Adventure story generation in progress...</p>
                </div>
              </div>
            )}

            {viewState === 'result' && adventureStory && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Adventure Story</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{adventureStory.generated_content}</p>
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
              <p className="text-sm text-gray-500">Failed to load location details</p>
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
        {selectedLocation ? (
          <div className="flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{selectedLocation.name}</h2>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs text-gray-600">{selectedLocation.type}</span>
                  <span className="text-xs text-gray-500">·</span>
                  <span className="text-xs text-gray-500 truncate">{selectedLocation.dimension}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateAdventureStory}
              disabled={loadingDetails || loadingAdventureStory}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors shadow-sm flex-shrink-0"
            >
              Generate Adventure Story
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Select a location to generate adventure story for</p>
              </div>
            </div>
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed shadow-sm flex-shrink-0"
            >
              Generate Adventure Story
            </button>
          </div>
        )}
      </div>

      {paginationError && locations.length > 0 && (
        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 px-4 py-3 rounded-md shadow-sm flex-shrink-0">
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

      <div className="flex-1 min-h-0 overflow-hidden pb-6">
        <LocationGrid
          locations={locations}
          selectedLocation={selectedLocation}
          loading={loading}
          hasMore={hasMore}
          observerTarget={observerTarget}
          onLocationSelect={handleLocationSelect}
          error={hasErrorAndNoData ? error : null}
          onRetry={hasErrorAndNoData ? retry : undefined}
        />
      </div>
    </div>
  );
}

