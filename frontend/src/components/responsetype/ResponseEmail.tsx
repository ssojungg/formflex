import { useState } from 'react';
import { QuestionData } from '../../types/questionData';

interface ResponseEmailProps {
  question: QuestionData;
  color: string;
  index: number;
  onSubChange: (response: string) => void;
  isViewPage?: boolean;
}

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function ResponseEmail({ question, color, index, onSubChange, isViewPage }: ResponseEmailProps) {
  const [userResponse, setUserResponse] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserResponse(val);
    onSubChange(val);
  };

  const showError = touched && userResponse.length > 0 && !isValidEmail(userResponse);

  const borderColor = (() => {
    if (showError) return '#EF4444';
    if (isFocused) return color;
    return '#E5E7EB';
  })();

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
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">이메일</span>
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

      {/* Email Input */}
      <div className="px-6 pb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-300 pointer-events-none">
            <EmailIcon />
          </span>
          <input
            type="email"
            value={userResponse}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              setTouched(true);
            }}
            readOnly={isViewPage}
            placeholder={isViewPage ? '미리보기 모드입니다.' : 'example@email.com'}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-300
                       border-2 outline-none transition-all duration-150"
            style={{
              borderColor,
              backgroundColor: isViewPage ? '#F9FAFB' : 'white',
              cursor: isViewPage ? 'not-allowed' : 'text',
            }}
          />
        </div>
        {showError && (
          <p className="text-xs text-red-500 mt-1.5">올바른 이메일 형식으로 입력해주세요.</p>
        )}
      </div>
    </div>
  );
}

export default ResponseEmail;
