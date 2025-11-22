'use client';

import { useState } from 'react';
import {
  apiClient,
  type SearchResponse,
  type SearchResult,
  type Character as ApiCharacter,
  type Location as ApiLocation,
} from '@/src/shared/lib/api';
import CharacterCard from '@/src/features/characters/components/CharacterCard';
import CharacterDetails from '@/src/features/characters/components/CharacterDetails';
import LocationCard from '@/src/features/locations/components/LocationCard';
import LocationDetails from '@/src/features/locations/components/LocationDetails';
import EpisodeCard from '@/src/features/episodes/components/EpisodeCard';
import EpisodeDetails from '@/src/features/episodes/components/EpisodeDetails';
import type { CharacterDetailed as UiCharacterDetailed } from '@/src/features/characters/types';
import type { LocationDetailed as UiLocationDetailed } from '@/src/features/locations/types';
import type { EpisodeDetailed as UiEpisodeDetailed } from '@/src/features/episodes/types';

export default function SearchView() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: SearchResponse = await apiClient.semanticSearch(query.trim(), limit);
      setResults(response.results ?? []);
      setLastQuery(response.info?.query ?? null);
      setTotalResults(response.info?.total_results ?? null);
      setSelectedResult(null);
    } catch (err: any) {
      console.error('Semantic search error', err);
      setError(err?.message ?? 'Search failed');
      setResults([]);
      setLastQuery(null);
      setTotalResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Semantic Search</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
          Search across characters, locations, and episodes using semantic similarity.
        </p>
      </header>

      <main className="flex-1 min-h-0 flex flex-col gap-4">
        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row items-stretch md:items-end gap-3 rounded-xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Search query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about any character, location, or episode..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Max results
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="rounded-md border border-gray-300 bg-white px-2 py-2 text-xs text-black shadow-inner focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[5, 10, 20].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed md:mt-0"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Results */}
        <section className="relative flex-1 min-h-0 overflow-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-3" />
              <p className="text-xs font-medium text-gray-600">Searching the multiverse…</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm space-y-2">
              <p className="font-medium text-gray-500">No results yet</p>
              <p>Type a natural language query above and hit Search to see semantic matches.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              {lastQuery && (
                <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-1">
                  <p>
                    Showing{' '}
                    <span className="font-semibold text-gray-700">
                      {results.length}
                    </span>{' '}
                    result{results.length !== 1 ? 's' : ''} for{' '}
                    <span className="font-medium text-gray-800">“{lastQuery}”</span>
                  </p>
                  {typeof totalResults === 'number' && (
                    <p className="hidden sm:block">
                      Total matches:{' '}
                      <span className="font-semibold text-gray-700">
                        {totalResults}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-w-full">
                {results.map((result) => {
                  const key = `${result.entity_type}-${result.entity_id}-${result.score ?? 'na'}`;

                  let card: JSX.Element | null = null;
                  if (result.entity_type === 'character' && result.entity_data) {
                    const character = result.entity_data as ApiCharacter;
                    card = (
                      <CharacterCard
                        character={character}
                        isSelected={selectedResult?.entity_type === 'character' && selectedResult.entity_id === result.entity_id}
                        onClick={() => setSelectedResult(result)}
                      />
                    );
                  } else if (result.entity_type === 'location' && result.entity_data) {
                    const location = result.entity_data as ApiLocation;
                    card = (
                      <LocationCard
                        location={location}
                        isSelected={selectedResult?.entity_type === 'location' && selectedResult.entity_id === result.entity_id}
                        onClick={() => setSelectedResult(result)}
                      />
                    );
                  } else if (result.entity_type === 'episode' && result.entity_data) {
                    const episode = result.entity_data as UiEpisodeDetailed;
                    card = (
                      <EpisodeCard
                        episode={episode}
                        isSelected={selectedResult?.entity_type === 'episode' && selectedResult.entity_id === result.entity_id}
                        onClick={() => setSelectedResult(result)}
                      />
                    );
                  } else {
                    card = (
                      <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <p className="text-sm font-medium text-gray-900">
                          Entity #{result.entity_id}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Type: <span className="font-mono">{result.entity_type}</span>
                        </p>
                      </div>
                    );
                  }

                  return (
                    <article
                      key={key}
                      className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                          {result.entity_type}
                        </span>
                        {typeof result.score === 'number' && (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                            Score {(result.score * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      {card}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {selectedResult && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl p-4">
            <button
              type="button"
              onClick={() => setSelectedResult(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close details"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 6l8 8M6 14L14 6"
                />
              </svg>
            </button>

            <h2 className="text-sm font-semibold text-gray-900 mb-3">Selected Result Details</h2>

            {selectedResult.entity_type === 'character' && selectedResult.entity_data && (
              <CharacterDetails character={selectedResult.entity_data as UiCharacterDetailed} />
            )}

            {selectedResult.entity_type === 'location' && selectedResult.entity_data && (
              <LocationDetails location={selectedResult.entity_data as UiLocationDetailed} />
            )}

            {/* For episodes we keep it minimal for now; can add EpisodeDetails later */}
            {selectedResult.entity_type === 'episode' && selectedResult.entity_data && (
              <EpisodeDetails episode={selectedResult.entity_data as UiEpisodeDetailed} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}


