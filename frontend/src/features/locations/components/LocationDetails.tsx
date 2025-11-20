'use client';

import type { LocationDetailed } from '../types';
import { getLocationTypeColor } from '../utils';

interface LocationDetailsProps {
  location: LocationDetailed;
}

export default function LocationDetails({ location }: LocationDetailsProps) {
  const typeColor = getLocationTypeColor(location.type);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl font-bold text-gray-900">{location.name}</h2>
            <span className={`px-2.5 py-1 text-xs font-medium rounded ${typeColor}`}>
              {location.type}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Dimension:</span>
              <span className="ml-2 font-medium text-gray-900">{location.dimension}</span>
            </div>
            <div>
              <span className="text-gray-500">Residents:</span>
              <span className="ml-2 font-medium text-gray-900">{location.residents.length}</span>
            </div>
          </div>
        </div>

        {location.residents.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Residents ({location.residents.length})</h3>
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {location.residents.map((resident) => (
                  <div key={resident.id} className="flex flex-col items-center text-center p-2 border border-gray-200 rounded-md">
                    <img
                      src={resident.image}
                      alt={resident.name}
                      className="w-12 h-12 rounded-md object-cover mb-2"
                    />
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">{resident.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{resident.species}</p>
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

