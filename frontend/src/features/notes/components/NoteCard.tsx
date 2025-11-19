import { useState } from 'react';
import type { Note } from '../types';
import { formatDate } from '@/src/shared/utils';

interface NoteCardProps {
  note: Note;
  loading: boolean;
  onUpdate: (noteId: number, content: string) => Promise<void>;
  onDelete: (noteId: number) => Promise<void>;
}

export default function NoteCard({ note, loading, onUpdate, onDelete }: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = async () => {
    if (!editContent.trim()) return;
    try {
      await onUpdate(note.id, editContent.trim());
      setEditing(false);
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditContent(note.content);
  };

  return (
    <div className="border border-gray-200 rounded-md p-3 bg-white hover:shadow-sm transition-shadow">
      {editing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={loading}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={loading || !editContent.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.content}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {formatDate(note.created_at)}
              {note.updated_at !== note.created_at && ' (edited)'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                disabled={loading}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this note?')) {
                    onDelete(note.id);
                  }
                }}
                disabled={loading}
                className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

