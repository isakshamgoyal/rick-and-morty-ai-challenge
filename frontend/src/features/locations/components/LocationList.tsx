import type { Location } from '../types';
import LocationItem from './LocationItem';

interface LocationListProps {
  locations: Location[];
  selectedLocation: Location | null;
  loading: boolean;
  hasMore: boolean;
  observerTarget: React.RefObject<HTMLDivElement> | null;
  onLocationSelect: (location: Location) => void;
}

export default function LocationList({
  locations,
  selectedLocation,
  loading,
  hasMore,
  observerTarget,
  onLocationSelect,
}: LocationListProps) {
  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Locations</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {locations.map((location) => (
          <LocationItem
            key={location.id}
            location={location}
            isSelected={selectedLocation?.id === location.id}
            onClick={onLocationSelect}
          />
        ))}
        
        {hasMore && <div ref={observerTarget} className="h-4" />}
        
        {loading && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Loading more locations...
          </div>
        )}
      </div>
    </div>
  );
}

