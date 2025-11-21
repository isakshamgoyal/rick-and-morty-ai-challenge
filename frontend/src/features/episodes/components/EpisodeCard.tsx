import type { EpisodeDetailed } from '../types';

interface EpisodeCardProps {
  episode: EpisodeDetailed;
  isSelected: boolean;
  onClick: (episode: EpisodeDetailed) => void;
}

export default function EpisodeCard({ episode, isSelected, onClick }: EpisodeCardProps) {
  return (
    <div
      className={`relative aspect-square border rounded-lg p-3 cursor-pointer transition-all flex flex-col ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
      }`}
      onClick={() => onClick(episode)}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-2.5">
          <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10.5V6m0 0L5 3v11l10 3m0-11l4.553 1.517A2 2 0 0121 9.423V15.5"
              />
            </svg>
          </div>
        </div>
        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 px-1">
          {episode.name}
        </h3>
        <div className="flex flex-col items-center gap-1.5">
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
            {episode.episode}
          </span>
          <span className="text-xs text-gray-500">{episode.air_date}</span>
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


