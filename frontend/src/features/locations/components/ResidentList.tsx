import type { Location, Character } from '../types';
import ResidentItem from './ResidentItem';

interface ResidentListProps {
  location: Location | null;
  selectedCharacter: Character | null;
  onCharacterSelect: (character: Character) => void;
}

export default function ResidentList({
  location,
  selectedCharacter,
  onCharacterSelect,
}: ResidentListProps) {
  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Residents</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {location ? (
          location.residents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No residents at this location
            </div>
          ) : (
            <div className="space-y-3">
              {location.residents.map((character) => (
                <ResidentItem
                  key={character.id}
                  character={character}
                  isSelected={selectedCharacter?.id === character.id}
                  onClick={onCharacterSelect}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            Select a location to see residents
          </div>
        )}
      </div>
    </div>
  );
}

