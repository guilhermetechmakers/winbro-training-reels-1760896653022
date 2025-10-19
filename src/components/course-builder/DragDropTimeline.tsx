interface DragDropTimelineProps {
  modules?: any[];
  onReorderModules?: (moduleIds: string[]) => void;
  onRemoveModule?: (id: string) => void;
  onAddModule?: (module: any) => void;
}

export default function DragDropTimeline({ modules = [] }: DragDropTimelineProps) { 
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Course Timeline</h3>
      <div className="space-y-3">
        {modules.map((module, index) => (
          <div key={module.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{module.title}</h4>
                <p className="text-sm text-gray-500 capitalize">{module.type}</p>
              </div>
            </div>
          </div>
        ))}
        {modules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No modules added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
