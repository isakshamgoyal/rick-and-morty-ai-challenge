import type { Character } from '../types';
import { getStatusColor } from '@/src/shared/utils';

interface CharacterDetailsProps {
  character: Character;
}

export default function CharacterDetails({ character }: CharacterDetailsProps) {
  return (
    <div className="text-center mb-6">
      <img
        src={character.image}
        alt={character.name}
        className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-4 border-gray-100 shadow-sm"
      />
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{character.name}</h2>
      <div className="flex items-center justify-center gap-6">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Status</span>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(character.status)}`}>
            {character.status}
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Species</span>
          <div className="text-gray-900 text-sm">
            {character.species}
          </div>
        </div>
      </div>
    </div>
  );
}

