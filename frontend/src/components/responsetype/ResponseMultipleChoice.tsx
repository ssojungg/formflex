import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { QuestionData } from '../../types/questionData';

interface ResponseMultipleChoiceProps {
  question: QuestionData;
  color: string;
  buttonStyle: 'angled' | 'smooth' | 'round';
  index: number;
  onOptionSelect: (choiceId: number) => void;
  isViewPage?: boolean;
}

function ResponseMultipleChoice({
  question,
  color,
  index,
  onOptionSelect,
  isViewPage,
}: ResponseMultipleChoiceProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionSelect = (choiceId: number) => {
    if (isViewPage) return;
    setSelectedOption(choiceId);
    onOptionSelect(choiceId);
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
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">객관식</span>
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

      {/* Options */}
      <div className="px-6 pb-6 space-y-2">
        {question.choices?.map((choice) =>
          isViewPage ? (
            <Tooltip key={choice.choiceId} title="미리보기 모드에서는 선택할 수 없습니다." arrow>
              <div
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-gray-100
                           cursor-not-allowed opacity-70"
              >
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700">{choice.option}</span>
              </div>
            </Tooltip>
          ) : (
            <button
              type="button"
              key={choice.choiceId}
              onClick={() => handleOptionSelect(choice.choiceId)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left
                         transition-all duration-150 hover:border-opacity-60"
              style={
                selectedOption === choice.choiceId
                  ? { borderColor: color, backgroundColor: `${color}12` }
                  : { borderColor: '#E5E7EB', backgroundColor: 'white' }
              }
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                style={
                  selectedOption === choice.choiceId
                    ? { borderColor: color, backgroundColor: color }
                    : { borderColor: '#D1D5DB' }
                }
              >
                {selectedOption === choice.choiceId && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: selectedOption === choice.choiceId ? color : '#374151' }}
              >
                {choice.option}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export default ResponseMultipleChoice;
