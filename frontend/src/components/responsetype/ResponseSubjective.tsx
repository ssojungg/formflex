import { useState } from 'react';
import { QuestionData } from '../../types/questionData';
import QuestionShell, { tint } from './QuestionShell';

interface ResponseSubjectiveProps {
  question: QuestionData;
  color: string;
  index: number;
  onSubChange: (response: string) => void;
  isViewPage?: boolean;
}

function ResponseSubjective({ question, color, index, onSubChange, isViewPage }: ResponseSubjectiveProps) {
  const [userResponse, setUserResponse] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUserResponse(val);
    onSubChange(val);
  };

  return (
    <QuestionShell
      index={index}
      color={color}
      typeLabel="자유롭게 적어 주세요"
      content={question.content}
      imageUrl={question.imageUrl}
    >
      <textarea
        value={userResponse}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={isViewPage}
        rows={4}
        placeholder={isViewPage ? '미리보기에서는 입력할 수 없어요' : '답변을 입력해 주세요'}
        className={`w-full px-4 py-3 rounded-xl border text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 resize-none outline-none transition-[border-color,box-shadow] ${
          isViewPage ? 'bg-gray-50 cursor-not-allowed border-gray-200' : 'bg-white'
        } ${isFocused ? '' : 'border-gray-200'}`}
        style={isFocused ? { borderColor: color, boxShadow: `0 0 0 4px ${tint(color, 15)}` } : undefined}
      />
      {!isViewPage && <p className="mt-1.5 text-right text-xs text-gray-400 tabular-nums">{userResponse.length}자</p>}
    </QuestionShell>
  );
}

export default ResponseSubjective;
