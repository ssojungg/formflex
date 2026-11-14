import { useState } from 'react';
import { QuestionData } from '../../types/questionData';
import QuestionShell, { tint } from './QuestionShell';

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
  const ringColor = showError ? '#f04452' : color;

  return (
    <QuestionShell index={index} color={color} typeLabel="이메일 주소" content={question.content} imageUrl={question.imageUrl}>
      <div className="relative">
        <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 pointer-events-none">
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
          placeholder={isViewPage ? '미리보기에서는 입력할 수 없어요' : 'name@example.com'}
          className={`w-full h-12 pl-11 pr-4 rounded-xl border text-[15px] text-gray-900 placeholder:text-gray-400 outline-none transition-[border-color,box-shadow] ${
            isViewPage ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
          } ${isFocused || showError ? '' : 'border-gray-200'}`}
          style={
            isFocused || showError
              ? { borderColor: ringColor, boxShadow: isFocused ? `0 0 0 4px ${tint(ringColor, 15)}` : undefined }
              : undefined
          }
        />
      </div>
      {showError && <p className="mt-1.5 text-xs text-error">이메일 형식이 맞지 않아요. 다시 확인해 주세요.</p>}
    </QuestionShell>
  );
}

export default ResponseEmail;
