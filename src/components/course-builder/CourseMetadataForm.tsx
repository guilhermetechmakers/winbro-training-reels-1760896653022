interface CourseMetadataFormProps {
  course: any;
  onUpdate: (updates: any) => void;
  isEditing?: boolean;
}

export default function CourseMetadataForm({ course, onUpdate }: CourseMetadataFormProps) { 
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Course Details</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Course Title *</label>
          <input
            type="text"
            value={course?.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter course title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={course?.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe what students will learn"
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
          />
        </div>
      </div>
    </div>
  );
}
