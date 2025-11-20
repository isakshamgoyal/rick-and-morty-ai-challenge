import type { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onClick: (character: Character) => void;
}

export default function CharacterCard({ character, isSelected, onClick }: CharacterCardProps) {
  const statusColor = {
    'Alive': 'bg-green-100 text-green-800',
    'Dead': 'bg-red-100 text-red-800',
    'unknown': 'bg-gray-100 text-gray-800',
  }[character.status] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className={`relative aspect-square border rounded-lg p-3 cursor-pointer transition-all flex flex-col ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
      }`}
      onClick={() => onClick(character)}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-2.5">
          <img
            src={character.image}
            alt={character.name}
            className="w-16 h-16 rounded-md object-cover mx-auto"
          />
        </div>
        <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 px-1">{character.name}</h3>
        <div className="flex flex-col items-center gap-1.5">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColor}`}>
            {character.status}
          </span>
          <span className="text-xs text-gray-500">{character.species}</span>
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

