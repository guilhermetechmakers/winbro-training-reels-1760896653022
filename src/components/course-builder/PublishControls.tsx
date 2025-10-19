interface PublishControlsProps {
  course?: any;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  isPublishing?: boolean;
  isSaving?: boolean;
}

export default function PublishControls({ course, onPublish, onSaveDraft, isPublishing = false, isSaving = false }: PublishControlsProps) { 
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Publish Controls</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
            {course?.status || 'draft'}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isPublishing ? 'Publishing...' : 'Publish Course'}
          </button>
        </div>
      </div>
    </div>
  );
}
