import { useState } from 'react';
import { QuestionData } from '../../types/questionData';

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
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">날짜</span>
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

      {/* Date Input */}
      <div className="px-6 pb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-300 pointer-events-none">
            <CalendarIcon />
          </span>
          <input
            type="date"
            value={userResponse}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isViewPage}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-700
                       border-2 outline-none transition-all duration-150"
            style={{
              borderColor: isFocused ? color : '#E5E7EB',
              backgroundColor: isViewPage ? '#F9FAFB' : 'white',
              cursor: isViewPage ? 'not-allowed' : 'text',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ResponseDate;
