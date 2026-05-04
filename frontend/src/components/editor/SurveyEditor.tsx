import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useSurveyStore, Question, QuestionType } from '../../store/SurveyStore';
import { useAuthStore } from '../../store/AuthStore';
import { createSurveyAPI } from '../../api/survey';
import { responseformAPI } from '../../api/responseform';
import { EditableSurvey } from '../../types/editableSurvey';

// ==================== ICONS ====================
function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    </svg>
  );
}

function ChevronIcon({ direction = 'down' }: { direction?: 'up' | 'down' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// Question type configurations
const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.FC }[] = [
  {
    type: 'short_text',
    label: '단답형',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7V4h16v3" />
        <path d="M9 20h6" />
        <path d="M12 4v16" />
      </svg>
    ),
  },
  {
    type: 'long_text',
    label: '장문형',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="17" y1="10" x2="3" y2="10" />
        <line x1="21" y1="6" x2="3" y2="6" />
        <line x1="21" y1="14" x2="3" y2="14" />
        <line x1="17" y1="18" x2="3" y2="18" />
      </svg>
    ),
  },
  {
    type: 'single_choice',
    label: '단일 선택',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    ),
  },
  {
    type: 'multiple_choice',
    label: '복수 선택',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <polyline points="9 11 12 14 22 4" />
      </svg>
    ),
  },
  {
    type: 'dropdown',
    label: '드롭다운',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    ),
  },
  {
    type: 'rating',
    label: '평점',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    type: 'date',
    label: '날짜',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    type: 'email',
    label: '이메일',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    type: 'number',
    label: '숫자',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 17h6M4 17V7M14 7l2 10M18 7l-2 10M14 12h4" />
      </svg>
    ),
  },
];

const THEME_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
const FONTS = ['Pretendard', 'Noto Sans KR', 'Nanum Gothic', 'Gothic A1', 'Spoqa Han Sans'];
const CARD_SHAPES = [
  { id: 'rounded', label: '둥근 모서리', radius: '16px' },
  { id: 'sharp', label: '각진 모서리', radius: '4px' },
  { id: 'pill', label: '알약형', radius: '24px' },
];

// ==================== EDITABLE INPUT ====================
const EditableInput = React.memo(
  ({
    value,
    onChange,
    placeholder,
    className,
    multiline = false,
    rows = 1,
  }: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
    multiline?: boolean;
    rows?: number;
  }) => {
    const [local, setLocal] = useState(value);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
      if (!focused) setLocal(value);
    }, [value, focused]);

    const handleBlur = () => {
      setFocused(false);
      if (local !== value) onChange(local);
    };

    if (multiline) {
      return (
        <textarea
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={className}
          rows={rows}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    return (
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        onClick={(e) => e.stopPropagation()}
      />
    );
  },
);
EditableInput.displayName = 'EditableInput';

// ==================== QUESTION CARD ====================
const QuestionCard = React.memo(
  ({
    question,
    index,
    isSelected,
    isFirst,
    isLast,
    cardRadius,
    themeColor,
    onSelect,
    onUpdate,
    onDelete,
    onCopy,
    onMove,
    onAddOption,
    onUpdateOption,
    onDeleteOption,
    onOpenAI,
    onUploadImage,
    onRemoveImage,
  }: {
    question: Question;
    index: number;
    isSelected: boolean;
    isFirst: boolean;
    isLast: boolean;
    cardRadius: string;
    themeColor: string;
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Question>) => void;
    onDelete: (id: string) => void;
    onCopy: (id: string) => void;
    onMove: (id: string, direction: 'up' | 'down') => void;
    onAddOption: (id: string) => void;
    onUpdateOption: (qId: string, optId: string, text: string) => void;
    onDeleteOption: (qId: string, optId: string) => void;
    onOpenAI: (id: string) => void;
    onUploadImage: (id: string) => void;
    onRemoveImage: (id: string, index: number) => void;
  }) => {
    return (
      <Reorder.Item
        value={question}
        onClick={() => onSelect(question.id)}
        className={`group bg-white border-2 transition-all duration-200 ${isSelected ? 'shadow-lg' : 'border-transparent hover:border-secondary-200 shadow-sm hover:shadow-md'}`}
        style={{
          borderRadius: cardRadius,
          ...(isSelected ? { borderColor: themeColor } : {}),
        }}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-secondary-400">
              <GripIcon />
            </div>
            <div
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold"
              style={{ backgroundColor: themeColor + '22', color: themeColor }}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <EditableInput
                value={question.label}
                onChange={(val) => onUpdate(question.id, { label: val })}
                placeholder="질문을 입력하세요"
                className="w-full text-base font-medium text-secondary-900 bg-transparent border-none outline-none placeholder:text-secondary-400"
              />
              {question.required && (
                <span className="inline-block mt-1 text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                  필수
                </span>
              )}
            </div>
            <div
              className={`flex items-center gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAI(question.id);
                }}
                className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                title="AI 생성"
              >
                <SparkleIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadImage(question.id);
                }}
                className="p-1.5 rounded-lg text-secondary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="이미지 추가"
              >
                <ImageIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(question.id, 'up');
                }}
                disabled={isFirst}
                className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 disabled:opacity-30 transition-colors"
              >
                <ChevronIcon direction="up" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(question.id, 'down');
                }}
                disabled={isLast}
                className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 disabled:opacity-30 transition-colors"
              >
                <ChevronIcon direction="down" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(question.id);
                }}
                className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
              >
                <CopyIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(question.id);
                }}
                className="p-1.5 rounded-lg text-secondary-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <TrashIcon />
              </button>
            </div>
          </div>

          {/* Question Images */}
          {question.imageUrls && question.imageUrls.length > 0 && (
            <div className="ml-10 mb-4 flex gap-2 overflow-x-auto">
              {question.imageUrls.map((url, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img src={url} alt={`Question image ${i + 1}`} className="w-24 h-18 object-cover rounded-lg" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(question.id, i);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Question Preview */}
          <div className="ml-10">
            {(question.type === 'short_text' || question.type === 'email' || question.type === 'number') && (
              <div className="py-2.5 px-3 bg-secondary-50 rounded-xl text-secondary-400 text-sm border border-secondary-100">
                {question.type === 'email'
                  ? '이메일 주소 입력'
                  : question.type === 'number'
                    ? '숫자 입력'
                    : '답변 입력'}
              </div>
            )}
            {question.type === 'long_text' && (
              <div className="py-3 px-3 bg-secondary-50 rounded-xl text-secondary-400 text-sm border border-secondary-100 h-20">
                자세한 답변 입력
              </div>
            )}

            {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2 group/opt">
                    <div
                      className={`w-4 h-4 border-2 border-secondary-300 flex-shrink-0 ${question.type === 'single_choice' ? 'rounded-full' : 'rounded'}`}
                    />
                    <EditableInput
                      value={opt.text}
                      onChange={(val) => onUpdateOption(question.id, opt.id, val)}
                      placeholder={`옵션 ${i + 1}`}
                      className="flex-1 text-sm text-secondary-700 bg-transparent border-none outline-none placeholder:text-secondary-400"
                    />
                    {isSelected && question.options!.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteOption(question.id, opt.id);
                        }}
                        className="opacity-0 group-hover/opt:opacity-100 p-1 rounded text-secondary-400 hover:text-red-500 transition-all"
                      >
                        <CloseIcon />
                      </button>
                    )}
                  </div>
                ))}
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddOption(question.id);
                    }}
                    className="flex items-center gap-1.5 text-sm py-1"
                    style={{ color: themeColor }}
                  >
                    <PlusIcon /> 옵션 추가
                  </button>
                )}
              </div>
            )}

            {question.type === 'dropdown' && question.options && (
              <div>
                <select
                  disabled
                  className="w-full py-2.5 px-3 bg-secondary-50 rounded-xl text-secondary-400 text-sm border border-secondary-100 appearance-none"
                >
                  <option>선택하세요</option>
                </select>
                {isSelected && (
                  <div className="mt-3 space-y-2">
                    {question.options.map((opt, i) => (
                      <div key={opt.id} className="flex items-center gap-2 group/opt">
                        <span className="text-xs text-secondary-400 w-5">{i + 1}.</span>
                        <EditableInput
                          value={opt.text}
                          onChange={(val) => onUpdateOption(question.id, opt.id, val)}
                          placeholder={`옵션 ${i + 1}`}
                          className="flex-1 py-1.5 px-2 text-sm text-secondary-700 bg-secondary-50 rounded-lg border border-secondary-200 outline-none focus:border-primary-500"
                        />
                        {question.options!.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteOption(question.id, opt.id);
                            }}
                            className="opacity-0 group-hover/opt:opacity-100 p-1 rounded text-secondary-400 hover:text-red-500 transition-all"
                          >
                            <CloseIcon />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddOption(question.id);
                      }}
                      className="flex items-center gap-1.5 text-sm py-1"
                    style={{ color: themeColor }}
                    >
                      <PlusIcon /> 옵션 추가
                    </button>
                  </div>
                )}
              </div>
            )}

            {question.type === 'rating' && (
              <div className="flex gap-1.5">
                {Array.from({ length: question.ratingMax || 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-lg bg-secondary-50 border border-secondary-200 flex items-center justify-center text-sm text-secondary-500 font-medium"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {question.type === 'date' && (
              <div className="py-2.5 px-3 bg-secondary-50 rounded-xl text-secondary-400 text-sm border border-secondary-100 w-44">
                YYYY-MM-DD
              </div>
            )}
          </div>

          {/* Settings */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-secondary-100 ml-10"
            >
              <label className="flex items-center gap-2 text-sm text-secondary-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdate(question.id, { required: e.target.checked });
                  }}
                  className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                필수 응답
              </label>
            </motion.div>
          )}
        </div>
      </Reorder.Item>
    );
  },
);
QuestionCard.displayName = 'QuestionCard';

// ==================== MAIN EDITOR ====================
function SurveyEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get('id');
  const getSurveyById = useSurveyStore((state) => state.getSurveyById);
  const addSurvey = useSurveyStore((state) => state.addSurvey);
  const updateSurvey = useSurveyStore((state) => state.updateSurvey);
  const existingSurvey = surveyId ? getSurveyById(surveyId) : undefined;

  // States
  const [title, setTitle] = useState(existingSurvey?.title || '');
  const [description, setDescription] = useState(existingSurvey?.description || '');
  const [questions, setQuestions] = useState<Question[]>(existingSurvey?.questions || []);
  const [themeColor, setThemeColor] = useState(existingSurvey?.themeColor || '#6366f1');
  const [selectedFont, setSelectedFont] = useState('Pretendard');
  const [cardShape, setCardShape] = useState('rounded');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(existingSurvey?.isPublic ?? true);
  const [hashtags, setHashtags] = useState<string[]>(existingSurvey?.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [enableEmailReport, setEnableEmailReport] = useState(false);
  const [emailReportThreshold, setEmailReportThreshold] = useState(100);
  const [reportEmail, setReportEmail] = useState('');

  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showMobileCustom, setShowMobileCustom] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showMobileCustomize, setShowMobileCustomize] = useState(false);
  const [aiTargetQuestion, setAiTargetQuestion] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Apply theme color as CSS variable on the editor wrapper
  useEffect(() => {
    document.documentElement.style.setProperty('--editor-theme', themeColor);
    const hex = themeColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty('--editor-theme-rgb', `${r},${g},${b}`);
    return () => {
      document.documentElement.style.removeProperty('--editor-theme');
      document.documentElement.style.removeProperty('--editor-theme-rgb');
    };
  }, [themeColor]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImageForQuestion, setUploadingImageForQuestion] = useState<string | null>(null);

  const cardRadius = CARD_SHAPES.find((s) => s.id === cardShape)?.radius || '16px';

  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) setSelectedQuestionId(questions[0].id);
  }, [questions, selectedQuestionId]);

  // Load survey data for edit mode from backend API
  useEffect(() => {
    if (!surveyId) return;
    // Map backend question types back to frontend types
    const backendToFrontend: Record<string, QuestionType> = {
      MULTIPLE_CHOICE: 'single_choice',
      CHECKBOX: 'multiple_choice',
      DROPDOWN: 'dropdown',
      SUBJECTIVE_QUESTION: 'short_text',
    };
    responseformAPI(Number(surveyId))
      .then((data: any) => {
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.color) setThemeColor(data.color);
        if (data.font) setSelectedFont(data.font);
        if (data.deadline) setDeadline(data.deadline);
        if (data.mainImageUrl) setCoverImage(data.mainImageUrl);
        if (data.questions?.length > 0) {
          const mapped: Question[] = data.questions.map((q: any) => ({
            id: String(q.questionId),
            type: (backendToFrontend[q.type] || 'short_text') as QuestionType,
            label: q.content || '',
            required: false,
            options: q.choices?.map((c: any) => ({
              id: String(c.choiceId),
              text: c.option,
            })) || [],
            imageUrls: q.imageUrl ? [q.imageUrl] : [],
          }));
          setQuestions(mapped);
        }
      })
      .catch(() => {}); // silently ignore if fetch fails
  }, [surveyId]);

  const generateId = () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addQuestion = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      short_text: '짧은 답변을 입력해주세요',
      long_text: '자세한 의견을 들려주세요',
      email: '이메일 주소를 입력해주세요',
      number: '숫자를 입력해주세요',
      single_choice: '하나를 선택해주세요',
      multiple_choice: '해당하는 것을 모두 선택해주세요',
      dropdown: '목록에서 선택해주세요',
      rating: '평점을 매겨주세요',
      date: '날짜를 선택해주세요',
      section_divider: '섹션 제목',
    };
    const newQ: Question = {
      id: generateId(),
      type,
      label: labels[type],
      placeholder: '',
      required: false,
      options: ['single_choice', 'multiple_choice', 'dropdown'].includes(type)
        ? [
            { id: `opt-${Date.now()}-1`, text: '옵션 1' },
            { id: `opt-${Date.now()}-2`, text: '옵션 2' },
          ]
        : undefined,
      ratingMax: type === 'rating' ? 5 : undefined,
    };
    setQuestions([...questions, newQ]);
    setSelectedQuestionId(newQ.id);
  };

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }, []);
  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      const f = prev.filter((q) => q.id !== id);
      setSelectedQuestionId((c) => (c === id && f.length > 0 ? f[Math.min(idx, f.length - 1)]?.id : c));
      return f;
    });
  }, []);
  const copyQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      const q = prev.find((x) => x.id === id);
      if (!q) return prev;
      const copy = { ...JSON.parse(JSON.stringify(q)), id: generateId() };
      const idx = prev.findIndex((x) => x.id === id);
      const n = [...prev];
      n.splice(idx + 1, 0, copy);
      setSelectedQuestionId(copy.id);
      return n;
    });
  }, []);
  const moveQuestion = useCallback((id: string, dir: 'up' | 'down') => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if ((dir === 'up' && idx <= 0) || (dir === 'down' && idx >= prev.length - 1)) return prev;
      const n = [...prev];
      const s = dir === 'up' ? idx - 1 : idx + 1;
      [n[idx], n[s]] = [n[s], n[idx]];
      return n;
    });
  }, []);
  const addOption = useCallback((qId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== qId || !q.options
          ? q
          : { ...q, options: [...q.options, { id: `opt-${Date.now()}`, text: `옵션 ${q.options.length + 1}` }] },
      ),
    );
  }, []);
  const updateOption = useCallback((qId: string, optId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== qId || !q.options ? q : { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)) },
      ),
    );
  }, []);
  const deleteOption = useCallback((qId: string, optId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== qId || !q.options || q.options.length <= 1
          ? q
          : { ...q, options: q.options.filter((o) => o.id !== optId) },
      ),
    );
  }, []);

  const removeQuestionImage = useCallback((qId: string, imgIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== qId || !q.imageUrls ? q : { ...q, imageUrls: q.imageUrls.filter((_, i) => i !== imgIdx) },
      ),
    );
  }, []);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleQuestionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingImageForQuestion) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setQuestions((prev) =>
          prev.map((q) =>
            q.id !== uploadingImageForQuestion ? q : { ...q, imageUrls: [...(q.imageUrls || []), url] },
          ),
        );
        setUploadingImageForQuestion(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAIForQuestion = (id: string) => {
    setAiTargetQuestion(id);
    setAiPrompt('');
    setShowAIModal(true);
  };
  const handleUploadImageForQuestion = (id: string) => {
    setUploadingImageForQuestion(id);
    questionImageInputRef.current?.click();
  };

  const handleAIGenerate = () => {
    if (!aiTargetQuestion || !aiPrompt.trim()) return;
    const q = questions.find((x) => x.id === aiTargetQuestion);
    if (!q) return;
    // Mock AI generation
    if (q.options) {
      const newOpts = aiPrompt
        .split(/[,\n]/)
        .filter(Boolean)
        .map((t, i) => ({ id: `opt-${Date.now()}-${i}`, text: t.trim() }));
      if (newOpts.length > 0) updateQuestion(aiTargetQuestion, { options: newOpts });
    }
    setShowAIModal(false);
  };

  const handleSave = () => {
    const data = { title: title || '제목 없는 설문', description, questions, themeColor, isPublic, hashtags };
    if (existingSurvey) {
      updateSurvey(existingSurvey.id, data);
    } else {
      const newS = addSurvey({ ...data, status: 'draft' });
      navigate(`/create?id=${newS.id}`, { replace: true });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Zustand 스토어에만 저장함. 백엔드 api 를 아무도 호출하지 않는 문제점 발생
  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    // 질문 타입 반환: SurveyEditor 형식 -> 백엔드가 이해하는 형식
    const mappedQuestions = questions
      .filter((q) => q.type !== 'section_divider')
      .map((q) => {
        if (q.type === 'single_choice') {
          return {
            type: 'MULTIPLE_CHOICE' as const,
            content: q.label,
            choices: (q.options || []).map((o) => ({ option: o.text })),
          };
        }
        if (q.type === 'multiple_choice') {
          return {
            type: 'CHECKBOX' as const,
            content: q.label,
            choices: (q.options || []).map((o) => ({ option: o.text })),
          };
        }
        if (q.type === 'dropdown') {
          return {
            type: 'DROPDOWN' as const,
            content: q.label,
            choices: (q.options || []).map((o) => ({ option: o.text })),
          };
        }
        return {
          type: 'SUBJECTIVE_QUESTION' as const,
          content: q.label,
        };
      });
    if (!title || !title.trim()) {
      alert('제목은 필수입니다');
      return;
    }
    if (!deadline) {
      alert('마감일은 필수입니다');
      return;
    }

    const payload: EditableSurvey = {
      userId: userId as number,
      title,
      description,
      open: isPublic,
      font: selectedFont,
      color: themeColor,
      buttonStyle: 'smooth', // 나중에 cardSharp랑 연결 가능
      mainImageUrl: coverImage || '',
      deadline,
      questions: mappedQuestions,
      emailReportEnabled: enableEmailReport,
      emailReportThreshold: enableEmailReport ? emailReportThreshold : undefined,
      reportEmail: enableEmailReport ? reportEmail : undefined,
    };

    try {
      await createSurveyAPI(payload);
      // Remove cached data entirely so the list always fetches fresh on next mount
      queryClient.removeQueries({ queryKey: ['myForm'] });
      queryClient.removeQueries({ queryKey: ['allForm'] });
      setShowPublish(false);
      navigate('/surveys');
    } catch (error) {
      console.log('설문 생성 오류', error);
      alert('설문 생성에 실패하였습니다. 다시 시도해주세요.');
    } finally {
      setIsPublishing(false);
    }
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) setHashtags([...hashtags, tag]);
    setHashtagInput('');
  };

  const suggestedTags = ['고객만족', '시장조사', 'HR', '이벤트', 'NPS', 'UX', '피드백'];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30"
      style={{ fontFamily: selectedFont }}
    >
      {/* Hidden inputs */}
      <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} className="hidden" />
      <input
        type="file"
        ref={questionImageInputRef}
        accept="image/*"
        onChange={handleQuestionImageUpload}
        className="hidden"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors"
            >
              <ArrowLeftIcon />
            </button>
            <div className="h-6 w-px bg-secondary-200" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="설문 제목을 입력하세요"
              className="text-lg font-semibold text-secondary-900 bg-transparent border-none outline-none placeholder:text-secondary-400 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileCustom(true)}
              className="lg:hidden p-2.5 rounded-xl transition-colors text-white"
              style={{ backgroundColor: themeColor }}
              title="커스터마이징"
            >
              <PaletteIcon />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-xl text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors"
            >
              <SettingsIcon />
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-secondary-600 hover:bg-secondary-100 transition-colors text-sm font-medium"
            >
              <EyeIcon /> 미리보기
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-secondary-600 hover:bg-secondary-100 transition-colors text-sm font-medium"
            >
              <SaveIcon /> {isSaved ? '저장됨' : '저장'}
            </button>
            <button
              onClick={() => setShowPublish(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm"
            >
              <SendIcon /> 배포
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Main Editor */}
        <main className="flex-1 max-w-3xl">
          {/* Cover Image */}
          <div
            onClick={() => coverInputRef.current?.click()}
            className="relative mb-6 rounded-2xl overƒflow-hidden cursor-pointer group"
            style={{ backgroundColor: `${themeColor}20`, minHeight: coverImage ? 'auto' : '120px' }}
          >
            {coverImage ? (
              <>
                <img src={coverImage} alt="Cover" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white font-medium">커버 이미지 변경</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-10 text-secondary-400 group-hover:text-secondary-600 transition-colors">
                <ImageIcon /> <span className="ml-2">커버 이미지 추가 (클릭)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div
            className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-100 mb-6"
            style={{ borderRadius: cardRadius }}
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설문에 대한 설명을 추가하세요"
              className="w-full text-secondary-600 bg-transparent border-none outline-none resize-none placeholder:text-secondary-400"
              rows={2}
            />
          </div>

          {/* Questions */}
          <div className="space-y-3">
            <Reorder.Group axis="y" values={questions} onReorder={setQuestions}>
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  isSelected={selectedQuestionId === q.id}
                  isFirst={i === 0}
                  isLast={i === questions.length - 1}
                  cardRadius={cardRadius}
                  themeColor={themeColor}
                  onSelect={setSelectedQuestionId}
                  onUpdate={updateQuestion}
                  onDelete={deleteQuestion}
                  onCopy={copyQuestion}
                  onMove={moveQuestion}
                  onAddOption={addOption}
                  onUpdateOption={updateOption}
                  onDeleteOption={deleteOption}
                  onOpenAI={openAIForQuestion}
                  onUploadImage={handleUploadImageForQuestion}
                  onRemoveImage={removeQuestionImage}
                />
              ))}
            </Reorder.Group>
          </div>

          {/* Add Question */}
          <div
            className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-dashed border-secondary-200"
            style={{ borderRadius: cardRadius }}
          >
            <p className="text-sm font-medium text-secondary-700 mb-3">질문 추가</p>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => addQuestion(type)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary-50 text-secondary-600 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm"
                >
                  <Icon /> {label}
                </button>
              ))}
            </div>
          </div>

          {questions.length === 0 && (
            <div className="mt-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center">
                <PlusIcon />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-1">질문을 추가해보세요</h3>
              <p className="text-secondary-500">위 버튼을 클릭하여 첫 번째 질문을 추가하세요</p>
            </div>
          )}
        </main>

        {/* Mobile Customize FAB */}
        <button
          onClick={() => setShowMobileCustomize(true)}
          className="fixed bottom-6 right-6 z-40 lg:hidden w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: themeColor }}
          title="커스터마이징"
        >
          <SettingsIcon />
        </button>

        {/* Mobile Customization Drawer */}
        <AnimatePresence>
          {showMobileCustomize && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
                onClick={() => setShowMobileCustomize(false)}
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 right-0 z-50 w-80 max-w-full bg-white shadow-2xl overflow-y-auto lg:hidden"
              >
                <div className="p-5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-secondary-900">커스터마이징</h3>
                    <button
                      onClick={() => setShowMobileCustomize(false)}
                      className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  {/* Color Theme */}
                  <div>
                    <p className="text-sm font-medium text-secondary-700 mb-2">테마 색상</p>
                    <div className="flex flex-wrap gap-2">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setThemeColor(color)}
                          className={`w-8 h-8 rounded-full transition-all ${themeColor === color ? 'ring-2 ring-offset-2 ring-secondary-400 scale-110' : 'hover:scale-110'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Font */}
                  <div>
                    <p className="text-sm font-medium text-secondary-700 mb-2">폰트</p>
                    <select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  {/* Card Shape */}
                  <div>
                    <p className="text-sm font-medium text-secondary-700 mb-2">카드 모양</p>
                    <div className="flex gap-2">
                      {CARD_SHAPES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setCardShape(s.id)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${cardShape === s.id ? 'text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                          style={cardShape === s.id ? { backgroundColor: themeColor } : undefined}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Hashtags */}
                  <div>
                    <p className="text-sm font-medium text-secondary-700 mb-2">해시태그</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={hashtagInput}
                        onChange={(e) => setHashtagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            addHashtag();
                          }
                        }}
                        placeholder="#태그"
                        className="flex-1 px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-sm outline-none focus:border-primary-500"
                      />
                      <button onClick={addHashtag} className="px-3 py-2 text-white rounded-xl text-sm font-medium" style={{ backgroundColor: themeColor }}>
                        추가
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {hashtags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                          #{tag}
                          <button onClick={() => setHashtags(hashtags.filter((t) => t !== tag))} className="hover:opacity-70">
                            <CloseIcon />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Right Sidebar - Customization Panel (Desktop only) */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-secondary-100 p-5 space-y-6">
            <h3 className="font-semibold text-secondary-900">커스터마이징</h3>

            {/* Color Theme */}
            <div>
              <p className="text-sm font-medium text-secondary-700 mb-2">테마 색상</p>
              <div className="flex flex-wrap gap-2">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${themeColor === color ? 'ring-2 ring-offset-2 ring-secondary-400 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <p className="text-sm font-medium text-secondary-700 mb-2">폰트</p>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Card Shape */}
            <div>
              <p className="text-sm font-medium text-secondary-700 mb-2">카드 모양</p>
              <div className="flex gap-2">
                {CARD_SHAPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCardShape(s.id)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${cardShape === s.id ? 'text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                    style={cardShape === s.id ? { backgroundColor: themeColor } : undefined}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <p className="text-sm font-medium text-secondary-700 mb-2">해시태그</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      addHashtag();
                    }
                  }}
                  placeholder="#태그"
                  className="flex-1 px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-sm outline-none focus:border-primary-500"
                />
                <button
                  onClick={addHashtag}
                  className="px-3 py-2 text-white rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: themeColor }}
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                  >
                    #{tag}
                    <button
                      onClick={() => setHashtags(hashtags.filter((t) => t !== tag))}
                      className="hover:opacity-60"
                    >
                      <CloseIcon />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestedTags
                  .filter((t) => !hashtags.includes(t))
                  .slice(0, 4)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setHashtags([...hashtags, tag])}
                      className="px-2 py-1 text-xs bg-secondary-100 text-secondary-600 rounded-full hover:bg-secondary-200"
                    >
                      #{tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary-900">설문 설정</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-secondary-100">
                  <CloseIcon />
                </button>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-900">공개 설문</p>
                    <p className="text-sm text-secondary-500">누구나 이 설문을 볼 수 있습니다</p>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-primary-500' : 'bg-secondary-300'}`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-white border-b border-secondary-100 px-6 py-4 flex items-center justify-between">
                <h2 className="font-semibold text-secondary-900">미리보기</h2>
                <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg hover:bg-secondary-100">
                  <CloseIcon />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                {coverImage && (
                  <img src={coverImage} alt="Cover" className="w-full h-32 object-cover rounded-xl mb-6" />
                )}
                <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: `${themeColor}15` }}>
                  <h1 className="text-xl font-bold text-secondary-900 mb-2">{title || '제목 없는 설문'}</h1>
                  {description && <p className="text-secondary-600">{description}</p>}
                </div>
                <div className="space-y-5">
                  {questions.map((q, i) => (
                    <div key={q.id} className="p-4 bg-secondary-50 rounded-xl">
                      <p className="font-medium text-secondary-900 mb-3">
                        <span className="text-primary-600 mr-2">Q{i + 1}.</span>
                        {q.label}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      {(q.type === 'short_text' || q.type === 'email' || q.type === 'number') && (
                        <input
                          type="text"
                          disabled
                          placeholder="답변 입력"
                          className="w-full px-3 py-2.5 rounded-lg bg-white border border-secondary-200 text-sm"
                        />
                      )}
                      {q.type === 'long_text' && (
                        <textarea
                          disabled
                          placeholder="답변 입력"
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-lg bg-white border border-secondary-200 text-sm resize-none"
                        />
                      )}
                      {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options && (
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <label key={opt.id} className="flex items-center gap-2 text-sm text-secondary-700">
                              <input type={q.type === 'single_choice' ? 'radio' : 'checkbox'} disabled />
                              {opt.text}
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'dropdown' && q.options && (
                        <select
                          disabled
                          className="w-full px-3 py-2.5 rounded-lg bg-white border border-secondary-200 text-sm"
                        >
                          <option>선택하세요</option>
                          {q.options.map((opt) => (
                            <option key={opt.id}>{opt.text}</option>
                          ))}
                        </select>
                      )}
                      {q.type === 'rating' && (
                        <div className="flex gap-2">
                          {Array.from({ length: q.ratingMax || 5 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-lg bg-white border border-secondary-200 flex items-center justify-center text-sm text-secondary-500"
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'date' && (
                        <input
                          type="date"
                          disabled
                          className="px-3 py-2.5 rounded-lg bg-white border border-secondary-200 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {questions.length === 0 && (
                  <div className="text-center py-12 text-secondary-500">아직 질문이 없습니다</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPublish(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary-900">설문 배포</h2>
                <button onClick={() => setShowPublish(false)} className="p-2 rounded-lg hover:bg-secondary-100">
                  <CloseIcon />
                </button>
              </div>

              <div className="space-y-5">
                {/* Public/Private */}
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">공개 여부</p>
                    <p className="text-sm text-secondary-500">
                      {isPublic ? '전체 공개 (누구나 링크로 접근)' : '로그인 필요'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-primary-500' : 'bg-secondary-300'}`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>

                {/* Deadline */}
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon />
                    <p className="font-medium text-secondary-900">마감일 설정</p>
                  </div>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm outline-none focus:border-primary-500"
                  />
                </div>

                {/* Hashtags */}
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <p className="font-medium text-secondary-900 mb-2">해시태그</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {hashtags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-full bg-primary-100 text-primary-700 text-xs">
                        #{tag}
                      </span>
                    ))}
                    {hashtags.length === 0 && <span className="text-sm text-secondary-400">설정된 태그 없음</span>}
                  </div>
                </div>

                {/* Email PDF Report */}
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MailIcon />
                      <p className="font-medium text-secondary-900">자동 이메일 PDF 서비스</p>
                    </div>
                    <button
                      onClick={() => setEnableEmailReport(!enableEmailReport)}
                      className={`w-11 h-6 rounded-full transition-colors ${enableEmailReport ? 'bg-primary-500' : 'bg-secondary-300'}`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${enableEmailReport ? 'translate-x-5' : 'translate-x-0.5'}`}
                      />
                    </button>
                  </div>
                  {enableEmailReport && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-secondary-600 block mb-1">응답 수 기준 (명)</label>
                        {/* Quick-pick buttons */}
                        <div className="flex gap-1.5 mb-2">
                          {[10, 50, 100, 200, 500].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setEmailReportThreshold(n)}
                              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                                emailReportThreshold === n
                                  ? 'bg-primary-500 text-white border-primary-500'
                                  : 'bg-white text-secondary-600 border-secondary-200 hover:border-primary-400'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        {/* Custom number input */}
                        <input
                          type="number"
                          min={1}
                          value={emailReportThreshold}
                          onChange={(e) => setEmailReportThreshold(Math.max(1, Number(e.target.value) || 1))}
                          placeholder="직접 입력"
                          className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm outline-none focus:border-primary-500"
                        />
                        <p className="text-xs text-secondary-400 mt-1">{emailReportThreshold}명 이상 응답 시 PDF 발송</p>
                      </div>
                      <div>
                        <label className="text-sm text-secondary-600 block mb-1">수신 이메일</label>
                        <input
                          type="email"
                          value={reportEmail}
                          onChange={(e) => setReportEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm outline-none focus:border-primary-500"
                        />
                      </div>
                      <p className="text-xs text-secondary-500">
                        설정한 응답 수 달성 시 분석 리포트를 PDF로 자동 발송합니다
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPublish(false)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary-100 text-secondary-700 font-medium hover:bg-secondary-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? '배포 중...' : '배포하기'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Customization Drawer */}
      <AnimatePresence>
        {showMobileCustom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowMobileCustom(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-secondary-100 px-5 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-secondary-900">커스터마이징</h3>
                <button
                  onClick={() => setShowMobileCustom(false)}
                  className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="p-5 space-y-6">
                {/* Color Theme */}
                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-2">테마 색상</p>
                  <div className="flex flex-wrap gap-2">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={`w-8 h-8 rounded-full transition-all ${themeColor === color ? 'ring-2 ring-offset-2 ring-secondary-400 scale-110' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                {/* Font */}
                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-2">폰트</p>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                {/* Card Shape */}
                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-2">카드 모양</p>
                  <div className="flex gap-2">
                    {CARD_SHAPES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setCardShape(s.id)}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${cardShape === s.id ? 'text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                        style={cardShape === s.id ? { backgroundColor: themeColor } : {}}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Hashtags */}
                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-2">해시태그</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          addHashtag();
                        }
                      }}
                      placeholder="#태그"
                      className="flex-1 px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-sm outline-none focus:border-primary-500"
                    />
                    <button
                      onClick={addHashtag}
                      className="px-3 py-2 text-white rounded-xl text-sm font-medium"
                      style={{ backgroundColor: themeColor }}
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-50 text-primary-700 text-xs"
                      >
                        #{tag}
                        <button
                          onClick={() => setHashtags(hashtags.filter((t) => t !== tag))}
                          className="hover:text-red-500"
                        >
                          <CloseIcon />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {suggestedTags
                      .filter((t) => !hashtags.includes(t))
                      .slice(0, 4)
                      .map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setHashtags([...hashtags, tag])}
                          className="px-2 py-1 text-xs bg-secondary-100 text-secondary-600 rounded-full hover:bg-secondary-200"
                        >
                          #{tag}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAIModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SparkleIcon />
                  <h2 className="text-lg font-semibold text-secondary-900">AI 옵션 생성</h2>
                </div>
                <button onClick={() => setShowAIModal(false)} className="p-2 rounded-lg hover:bg-secondary-100">
                  <CloseIcon />
                </button>
              </div>
              <p className="text-sm text-secondary-500 mb-4">원하는 옵션을 설명해주세요. AI가 선택지를 생성합니다.</p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="예: 여자 아이돌 춤신춤왕에 대해 5개 선택지 만들어줘"
                className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm resize-none outline-none focus:border-primary-500"
                rows={4}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary-100 text-secondary-700 font-medium hover:bg-secondary-200"
                >
                  취소
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={!aiPrompt.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <SparkleIcon /> 생성하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SurveyEditor;
