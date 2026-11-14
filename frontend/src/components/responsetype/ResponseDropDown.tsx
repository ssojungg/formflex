import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { QuestionData } from '../../types/questionData';
import QuestionShell, { tint } from './QuestionShell';

interface ResponseDropDownProps {
  question: QuestionData;
  color: string;
  index: number;
  onOptionSelect: (choiceId: number) => void;
  isViewPage?: boolean;
}

function ChevronDown({ open, color }: { open: boolean; color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={open ? color : '#8b95a1'}
      strokeWidth="2"
      strokeLinecap="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
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
    <QuestionShell
      index={index}
      color={color}
      typeLabel="목록에서 골라 주세요"
      content={question.content}
      imageUrl={question.imageUrl}
      overflowVisible
    >
      {isViewPage ? (
        <Tooltip title="미리보기에서는 고를 수 없어요" arrow>
          <div className="flex items-center justify-between w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 cursor-not-allowed">
            <span className="text-[15px] text-gray-400">선택해 주세요</span>
            <ChevronDown open={false} color={color} />
          </div>
        </Tooltip>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className={`flex items-center justify-between w-full h-12 px-4 rounded-xl border text-left transition-colors ${
              isOpen ? '' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            style={isOpen ? { borderColor: color, boxShadow: `0 0 0 4px ${tint(color, 15)}` } : undefined}
          >
            <span className={`text-[15px] ${selectedLabel ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {selectedLabel ?? '선택해 주세요'}
            </span>
            <ChevronDown open={isOpen} color={color} />
          </button>

          {isOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 z-50 py-1.5 bg-white rounded-xl border border-gray-200 shadow-dropdown overflow-hidden">
              {question.choices?.map((choice) => {
                const isSelected = selectedOption === choice.choiceId;
                return (
                  <button
                    type="button"
                    key={choice.choiceId}
                    onClick={() => handleSelect(choice.choiceId)}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-left text-[15px] transition-colors ${
                      isSelected ? 'font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={isSelected ? { backgroundColor: tint(color, 8) } : undefined}
                  >
                    {choice.option}
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </QuestionShell>
  );
}

export default ResponseDropDown;
