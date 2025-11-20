import type { Location } from '../types';
import { getLocationTypeColor } from '../utils';

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onClick: (location: Location) => void;
}

export default function LocationCard({ location, isSelected, onClick }: LocationCardProps) {
  const typeColor = getLocationTypeColor(location.type);
  
  return (
    <div
      className={`relative aspect-square border rounded-lg p-3 cursor-pointer transition-all flex flex-col ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
      }`}
      onClick={() => onClick(location)}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-2.5">
          <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 px-1">{location.name}</h3>
        <div className="flex flex-col items-center gap-1.5">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeColor}`}>
            {location.type}
          </span>
          <span className="text-xs text-gray-500 line-clamp-1">{location.dimension}</span>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        </div>
      )}
    </div>
  );
}

