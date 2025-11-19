import type { Character } from '../types';

interface ResidentItemProps {
  character: Character;
  isSelected: boolean;
  onClick: (character: Character) => void;
}

export default function ResidentItem({ character, isSelected, onClick }: ResidentItemProps) {
  return (
    <div
      className={`border rounded-md p-3 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-sm' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => onClick(character)}
    >
      <div className="flex items-center gap-3">
        <img
          src={character.image}
          alt={character.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{character.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            <span>{character.species}</span>
            <span className="mx-1.5">·</span>
            <span className="capitalize">{character.status}</span>
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

