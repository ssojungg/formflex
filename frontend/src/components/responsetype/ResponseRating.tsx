import { useState } from 'react';
import { QuestionData } from '../../types/questionData';

interface ResponseRatingProps {
  question: QuestionData;
  color: string;
  index: number;
  onSubChange: (response: string) => void;
  isViewPage?: boolean;
}

function ResponseRating({ question, color, index, onSubChange, isViewPage }: ResponseRatingProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const max = 5;

  const handleSelect = (value: number) => {
    if (isViewPage) return;
    setSelected(value);
    onSubChange(String(value));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Question Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <span
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {index}
        </span>
        <div className="flex-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">평점</span>
          <p className="text-base font-semibold text-gray-900 mt-0.5 leading-snug">{question.content}</p>
        </div>
      </div>

      {question.imageUrl && (
        <div className="px-6 pb-4">
          <img
            src={question.imageUrl}
            alt="질문 이미지"
            className="rounded-xl max-w-full max-h-64 object-contain"
          />
        </div>
      )}

      {/* Rating Scale */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between gap-2">
          {Array.from({ length: max }).map((_, i) => {
            const value = i + 1;
            const isSelected = selected === value;
            return (
              <button
                key={value}
                type="button"
                disabled={isViewPage}
                onClick={() => handleSelect(value)}
                className="flex-1 aspect-square max-h-14 rounded-xl border-2 flex items-center justify-center text-base font-semibold transition-all disabled:cursor-not-allowed"
                style={{
                  borderColor: isSelected ? color : '#E5E7EB',
                  backgroundColor: isSelected ? color : 'white',
                  color: isSelected ? 'white' : '#9CA3AF',
                }}
              >
                {value}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs text-gray-400">매우 불만족</span>
          <span className="text-xs text-gray-400">매우 만족</span>
        </div>
      </div>
    </div>
  );
}

export default ResponseRating;
