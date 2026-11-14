import { useState } from 'react';
import { QuestionData } from '../../types/questionData';
import QuestionShell, { tint } from './QuestionShell';

interface ResponseDateProps {
  question: QuestionData;
  color: string;
  index: number;
  onSubChange: (response: string) => void;
  isViewPage?: boolean;
}

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

function ResponseDate({ question, color, index, onSubChange, isViewPage }: ResponseDateProps) {
  const [userResponse, setUserResponse] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserResponse(val);
    onSubChange(val);
  };

  return (
    <QuestionShell index={index} color={color} typeLabel="날짜를 골라 주세요" content={question.content} imageUrl={question.imageUrl}>
      <div className="relative max-w-xs">
        <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 pointer-events-none">
          <CalendarIcon />
        </span>
        <input
          type="date"
          value={userResponse}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isViewPage}
          className={`w-full h-12 pl-11 pr-4 rounded-xl border text-[15px] text-gray-900 outline-none transition-[border-color,box-shadow] ${
            isViewPage ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
          } ${isFocused ? '' : 'border-gray-200'}`}
          style={isFocused ? { borderColor: color, boxShadow: `0 0 0 4px ${tint(color, 15)}` } : undefined}
        />
      </div>
    </QuestionShell>
  );
}

export default ResponseDate;
