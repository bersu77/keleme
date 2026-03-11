'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';

interface QuestionDisplayProps {
  questions: Question[];
}

export default function QuestionDisplay({ questions }: QuestionDisplayProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    let exportText = 'EXAM QUESTIONS\n';
    exportText += '='.repeat(50) + '\n\n';

    questions.forEach((q, index) => {
      exportText += `${index + 1}. ${q.question}\n\n`;
      q.options.forEach((opt, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex);
        exportText += `   ${letter}) ${opt}\n`;
      });
      exportText += '\n';
    });

    exportText += '\n' + '='.repeat(50) + '\n';
    exportText += 'ANSWER KEY\n';
    exportText += '='.repeat(50) + '\n\n';

    questions.forEach((q, index) => {
      const letter = String.fromCharCode(65 + q.correctAnswer);
      exportText += `${index + 1}. ${letter}`;
      if (q.explanation) {
        exportText += ` - ${q.explanation}`;
      }
      exportText += '\n';
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exam_questions.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Generated Questions ({questions.length})
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Export TXT
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors print:hidden"
          >
            Print
          </button>
        </div>
      </div>

      {showAnswers && Object.keys(selectedAnswers).length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg font-medium text-blue-800">
            Score: {getScore()} / {questions.length} ({Math.round((getScore() / questions.length) * 100)}%)
          </p>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question, qIndex) => {
          const isAnswered = selectedAnswers[question.id] !== undefined;
          const isCorrect = selectedAnswers[question.id] === question.correctAnswer;

          return (
            <div
              key={question.id}
              className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {qIndex + 1}. {question.question}
              </h3>

              <div className="space-y-2">
                {question.options.map((option, optIndex) => {
                  const letter = String.fromCharCode(65 + optIndex);
                  const isSelected = selectedAnswers[question.id] === optIndex;
                  const isCorrectAnswer = optIndex === question.correctAnswer;

                  let optionClass = 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';

                  if (showAnswers) {
                    if (isCorrectAnswer) {
                      optionClass = 'border-green-500 bg-green-50';
                    } else if (isSelected && !isCorrectAnswer) {
                      optionClass = 'border-red-500 bg-red-50';
                    }
                  } else if (isSelected) {
                    optionClass = 'border-blue-500 bg-blue-50';
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleAnswerSelect(question.id, optIndex)}
                      className={`w-full p-3 text-left border rounded-lg transition-all ${optionClass}`}
                    >
                      <span className="font-medium text-gray-600 mr-2">{letter}.</span>
                      <span className="text-gray-800">{option}</span>
                      {showAnswers && isCorrectAnswer && (
                        <span className="ml-2 text-green-600 text-sm font-medium">
                          (Correct)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {showAnswers && question.explanation && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Explanation:</span> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
