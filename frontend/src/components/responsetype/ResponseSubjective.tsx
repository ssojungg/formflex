import { useState } from 'react';
import { QuestionData } from '../../types/questionData';

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
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">주관식</span>
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

      {/* Textarea */}
      <div className="px-6 pb-6">
        <textarea
          value={userResponse}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          readOnly={isViewPage}
          rows={4}
          placeholder={isViewPage ? '미리보기 모드입니다.' : '답변을 입력해주세요...'}
          className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-300
                     border-2 resize-none outline-none transition-all duration-150"
          style={{
            borderColor: isFocused ? color : '#E5E7EB',
            backgroundColor: isViewPage ? '#F9FAFB' : 'white',
            cursor: isViewPage ? 'not-allowed' : 'text',
          }}
        />
        {!isViewPage && (
          <p className="text-right text-xs text-gray-400 mt-1">{userResponse.length}자</p>
        )}
      </div>
    </div>
  );
}

export default ResponseSubjective;
