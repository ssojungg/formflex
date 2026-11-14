import { useState } from 'react';
import { QuestionData } from '../../types/questionData';
import QuestionShell from './QuestionShell';

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
    <QuestionShell
      index={index}
      color={color}
      typeLabel={`1~${max}점 중 골라 주세요`}
      content={question.content}
      imageUrl={question.imageUrl}
    >
      <div className="flex items-center gap-2">
        {Array.from({ length: max }).map((_, i) => {
          const value = i + 1;
          const isSelected = selected === value;
          return (
            <button
              key={value}
              type="button"
              disabled={isViewPage}
              onClick={() => handleSelect(value)}
              aria-pressed={isSelected}
              className={`flex-1 h-12 sm:h-14 rounded-xl border flex items-center justify-center text-base font-semibold tabular-nums transition-colors disabled:cursor-not-allowed ${
                isSelected ? 'text-white' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300'
              }`}
              style={isSelected ? { borderColor: color, backgroundColor: color } : undefined}
            >
              {value}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 px-0.5 text-xs text-gray-400">
        <span>매우 불만족</span>
        <span>매우 만족</span>
      </div>
    </QuestionShell>
  );
}

export default ResponseRating;
