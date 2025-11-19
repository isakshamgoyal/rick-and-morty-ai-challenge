interface NoteFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  placeholder?: string;
}

export default function NoteForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  loading,
  placeholder = "Write your note here...",
}: NoteFormProps) {
  return (
    <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={3}
        disabled={loading}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

