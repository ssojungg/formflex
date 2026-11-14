import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { QuestionData } from '../../types/questionData';
import QuestionShell, { tint } from './QuestionShell';

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
    <QuestionShell
      index={index}
      color={color}
      typeLabel="하나만 골라 주세요"
      content={question.content}
      imageUrl={question.imageUrl}
    >
      <div className="space-y-2">
        {question.choices?.map((choice) => {
          const isSelected = selectedOption === choice.choiceId;
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
                className="w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors"
                style={{ borderColor: isSelected ? color : '#d1d6db' }}
              >
                {isSelected && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
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

export default ResponseMultipleChoice;
