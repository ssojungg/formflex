import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { QuestionData } from '../../types/questionData';

interface ResponseDropDownProps {
  question: QuestionData;
  color: string;
  index: number;
  onOptionSelect: (choiceId: number) => void;
  isViewPage?: boolean;
}

function ResponseDropDown({ question, color, index, onOptionSelect, isViewPage }: ResponseDropDownProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (choiceId: number) => {
    if (isViewPage) return;
    setSelectedOption(choiceId);
    onOptionSelect(choiceId);
    setIsOpen(false);
  };

  const selectedLabel = question.choices?.find((c) => c.choiceId === selectedOption)?.option;

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
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">드롭다운</span>
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

      {/* Custom Dropdown */}
      <div className="px-6 pb-6">
        {isViewPage ? (
          <Tooltip title="미리보기 모드에서는 선택할 수 없습니다." arrow>
            <div
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 border-gray-200
                         bg-gray-50 cursor-not-allowed opacity-70"
            >
              <span className="text-sm text-gray-400">선택해주세요</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </Tooltip>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border-2
                         text-left transition-all duration-150"
              style={{
                borderColor: isOpen ? color : '#E5E7EB',
                backgroundColor: isOpen ? `${color}08` : 'white',
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: selectedLabel ? '#111827' : '#9CA3AF' }}
              >
                {selectedLabel ?? '선택해주세요'}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isOpen ? color : '#9CA3AF'}
                strokeWidth="2"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isOpen && (
              <div
                className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-gray-100
                           shadow-xl z-10 overflow-hidden"
              >
                {question.choices?.map((choice) => (
                  <button
                    type="button"
                    key={choice.choiceId}
                    onClick={() => handleSelect(choice.choiceId)}
                    className="w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50"
                    style={{
                      color: selectedOption === choice.choiceId ? color : '#374151',
                      fontWeight: selectedOption === choice.choiceId ? 600 : 400,
                      backgroundColor: selectedOption === choice.choiceId ? `${color}10` : undefined,
                    }}
                  >
                    {choice.option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponseDropDown;
