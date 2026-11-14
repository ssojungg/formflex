import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { QuestionData } from '../../types/questionData';
import QuestionShell, { tint } from './QuestionShell';

interface ResponseCheckBoxProps {
  question: QuestionData;
  color: string;
  buttonStyle: 'angled' | 'smooth' | 'round';
  index: number;
  onOptionSelect: (newSelectedOptions: number[]) => void;
  isViewPage?: boolean;
}

function ResponseCheckBox({ question, color, index, onOptionSelect, isViewPage }: ResponseCheckBoxProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const handleOptionSelect = (choiceId: number) => {
    if (isViewPage) return;
    const newSelected = selectedOptions.includes(choiceId)
      ? selectedOptions.filter((id) => id !== choiceId)
      : [...selectedOptions, choiceId];
    setSelectedOptions(newSelected);
    onOptionSelect(newSelected);
  };

  return (
    <QuestionShell
      index={index}
      color={color}
      typeLabel={selectedOptions.length > 0 ? `여러 개 고를 수 있어요 · ${selectedOptions.length}개 선택` : '여러 개 고를 수 있어요'}
      content={question.content}
      imageUrl={question.imageUrl}
    >
      <div className="space-y-2">
        {question.choices?.map((choice) => {
          const isSelected = selectedOptions.includes(choice.choiceId);
          const row = (
            <button
              type="button"
              onClick={() => handleOptionSelect(choice.choiceId)}
              disabled={isViewPage}
              className={`flex items-center gap-3 w-full min-h-[48px] px-4 py-3 rounded-xl border text-left transition-colors disabled:cursor-not-allowed ${
                isSelected ? '' : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
              }`}
              style={isSelected ? { borderColor: color, backgroundColor: tint(color, 8) } : undefined}
            >
              <span
                className="w-[18px] h-[18px] rounded-[5px] border-2 flex-shrink-0 flex items-center justify-center transition-colors"
                style={isSelected ? { borderColor: color, backgroundColor: color } : { borderColor: '#d1d6db' }}
              >
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`text-[15px] ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                {choice.option}
              </span>
            </button>
          );

          return isViewPage ? (
            <Tooltip key={choice.choiceId} title="미리보기에서는 고를 수 없어요" arrow>
              <div>{row}</div>
            </Tooltip>
          ) : (
            <div key={choice.choiceId}>{row}</div>
          );
        })}
      </div>
    </QuestionShell>
  );
}

export default ResponseCheckBox;
