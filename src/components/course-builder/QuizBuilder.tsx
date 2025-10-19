interface QuizBuilderProps {
  quizzes?: any[];
  onAddQuiz?: (quiz: any) => void;
  onEditQuiz?: (quiz: any) => void;
  onDeleteQuiz?: (id: string) => void;
}

export default function QuizBuilder({ quizzes = [] }: QuizBuilderProps) { 
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Quiz Builder</h3>
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium">{quiz.question}</h4>
            <p className="text-sm text-gray-500">{quiz.type}</p>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No quizzes added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
