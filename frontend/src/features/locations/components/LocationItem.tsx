import type { Location } from '../types';

interface LocationItemProps {
  location: Location;
  isSelected: boolean;
  onClick: (location: Location) => void;
}

export default function LocationItem({ location, isSelected, onClick }: LocationItemProps) {
  return (
    <div
      className={`border rounded-md p-3 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-sm' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => onClick(location)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{location.name}</p>
          <p className="text-xs text-gray-500 mt-1.5">
            <span className="font-medium">{location.type}</span>
            <span className="mx-1.5">·</span>
            <span>{location.dimension}</span>
            <span className="mx-1.5">·</span>
            <span>{location.residents.length} {location.residents.length === 1 ? 'resident' : 'residents'}</span>
          </p>
        </div>
        {isSelected && (
          <div className="ml-2 flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}

