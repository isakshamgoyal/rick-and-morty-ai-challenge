'use client';

import type { CharacterDetailed } from '../types';

interface CharacterDetailsProps {
  character: CharacterDetailed;
}

export default function CharacterDetails({ character }: CharacterDetailsProps) {
  const statusColor = {
    'Alive': 'bg-green-100 text-green-800',
    'Dead': 'bg-red-100 text-red-800',
    'unknown': 'bg-gray-100 text-gray-800',
  }[character.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-6">
          <img
            src={character.image}
            alt={character.name}
            className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold text-gray-900">{character.name}</h2>
              <span className={`px-2.5 py-1 text-xs font-medium rounded ${statusColor}`}>
                {character.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Species:</span>
                <span className="ml-2 font-medium text-gray-900">{character.species}</span>
              </div>
              <div>
                <span className="text-gray-500">Gender:</span>
                <span className="ml-2 font-medium text-gray-900">{character.gender}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-medium text-gray-900">{character.type || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Episodes:</span>
                <span className="ml-2 font-medium text-gray-900">{character.episode.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Origin</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-900 font-medium">{character.origin.name}</p>
                <p className="text-gray-500">{character.origin.type}</p>
                <p className="text-gray-500">{character.origin.dimension}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Location</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-900 font-medium">{character.location.name}</p>
                <p className="text-gray-500">{character.location.type}</p>
                <p className="text-gray-500">{character.location.dimension}</p>
              </div>
            </div>
          </div>
        </div>

        {character.episode.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Episodes ({character.episode.length})</h3>
            <div className="max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {character.episode.map((ep, index) => (
                  <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-900 font-medium">{ep.name}</span>
                    <span className="text-gray-500">{ep.air_date}</span>
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

