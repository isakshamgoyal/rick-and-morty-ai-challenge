'use client';

import type { EpisodeDetailed } from '../types';

interface EpisodeDetailsProps {
  episode: EpisodeDetailed;
}

export default function EpisodeDetails({ episode }: EpisodeDetailsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10.5V6m0 0L5 3v11l10 3m0-11l4.553 1.517A2 2 0 0121 9.423V15.5"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{episode.name}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">
                  {episode.episode}
                </span>
                <span>·</span>
                <span>{episode.air_date}</span>
                <span>·</span>
                <span>{episode.characters.length} character{episode.characters.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Characters list */}
        {episode.characters.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Characters in this episode ({episode.characters.length})
            </h3>
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {episode.characters.map((character) => (
                  <div
                    key={character.id}
                    className="flex flex-col items-center text-center p-2 border border-gray-200 rounded-md bg-white"
                  >
                    <img
                      src={character.image}
                      alt={character.name}
                      className="w-12 h-12 rounded-md object-cover mb-2"
                    />
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">{character.name}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{character.species}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{character.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


