import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useSurveyStore, Question, QuestionType } from '../../store/SurveyStore';
import { useAuthStore } from '../../store/AuthStore';
import { createSurveyAPI } from '../../api/survey';
import { responseformAPI } from '../../api/responseform';
import { EditableSurvey } from '../../types/editableSurvey';
import { generateChoicesAPI, GeminiChoicesResult } from '../../api/gemini';

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

const THEME_COLORS = ['#3182F6', '#191F28', '#10b981', '#06b6d4', '#f59e0b', '#f43f5e', '#ec4899', '#6b7684'];
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

// ==================== SMALL UI ====================
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function fontStack(font: string) {
  return font === 'Pretendard'
    ? '"Pretendard Variable", Pretendard, sans-serif'
    : `"${font}", "Pretendard Variable", Pretendard, sans-serif`;
}

function Switch({
  checked,
  onChange,
  color,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  color?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-6 w-10 min-h-0 min-w-0 shrink-0 items-center rounded-full transition-colors ${checked ? '' : 'bg-secondary-200'}`}
      style={checked ? { backgroundColor: color || '#3182f6' } : undefined}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

const TYPE_META: Partial<Record<QuestionType, (typeof QUESTION_TYPES)[number]>> = Object.fromEntries(
  QUESTION_TYPES.map((t) => [t.type, t]),
);

const FIELD_BOX = 'flex items-center px-3.5 rounded-xl border border-secondary-200 bg-secondary-50 text-sm text-secondary-400';
const TOOL_BUTTON =
  'p-2 rounded-lg text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 transition-colors disabled:opacity-30 disabled:pointer-events-none';

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
    const meta = TYPE_META[question.type];
    const TypeIcon = meta?.icon;
    const stop = (fn: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      fn();
    };

    return (
      <Reorder.Item value={question} id={`question-${question.id}`} onClick={() => onSelect(question.id)} className="list-none">
        <div
          className="group relative bg-white border border-secondary-200 transition-[border-color,box-shadow] duration-200 hover:border-secondary-300"
          style={{
            borderRadius: cardRadius,
            ...(isSelected ? { borderColor: themeColor, boxShadow: `0 0 0 3px ${themeColor}1f` } : {}),
          }}
        >
        <div className="absolute left-1.5 top-[26px] text-secondary-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripIcon />
        </div>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start gap-3">
            <span
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold tabular-nums"
              style={{ backgroundColor: `${themeColor}1a`, color: themeColor }}
            >
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <EditableInput
                value={question.label}
                onChange={(val) => onUpdate(question.id, { label: val })}
                placeholder="질문을 입력하세요"
                className="w-full text-[16px] font-semibold leading-7 text-secondary-900 bg-transparent border-none outline-none placeholder:text-secondary-400"
              />
              <div className="mt-0.5 flex items-center gap-2 text-xs text-secondary-500">
                {meta && TypeIcon && (
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-flex scale-75 -ml-0.5 text-secondary-400">
                      <TypeIcon />
                    </span>
                    {meta.label}
                  </span>
                )}
                {question.required && <span className="font-medium text-error">필수</span>}
              </div>
            </div>
          </div>

          {/* Question Images */}
          {question.imageUrls && question.imageUrls.length > 0 && (
            <div className="mt-4 ml-10 flex gap-2 overflow-x-auto pt-2">
              {question.imageUrls.map((url, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={url}
                    alt={`질문 이미지 ${i + 1}`}
                    className="w-28 h-20 object-cover rounded-lg border border-secondary-200"
                  />
                  <button
                    onClick={stop(() => onRemoveImage(question.id, i))}
                    aria-label="이미지 삭제"
                    className="absolute -top-2 -right-2 w-5 h-5 bg-secondary-900 rounded-full text-white flex items-center justify-center hover:bg-secondary-700"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Answer preview */}
          <div className="mt-4 ml-10">
            {(question.type === 'short_text' || question.type === 'email' || question.type === 'number') && (
              <div className={`${FIELD_BOX} h-11`}>
                {question.type === 'email' ? 'name@example.com' : question.type === 'number' ? '숫자 입력' : '짧은 답변'}
              </div>
            )}

            {question.type === 'long_text' && <div className={`${FIELD_BOX} h-24 !items-start pt-3`}>자세한 답변</div>}

            {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
              <div className="space-y-1.5">
                {question.options.map((opt, i) => (
                  <div
                    key={opt.id}
                    className="flex items-center gap-3 h-11 px-3.5 rounded-xl border border-secondary-200 group/opt"
                  >
                    <span
                      className={`w-[18px] h-[18px] border-2 border-secondary-300 shrink-0 ${question.type === 'single_choice' ? 'rounded-full' : 'rounded-[5px]'}`}
                    />
                    <EditableInput
                      value={opt.text}
                      onChange={(val) => onUpdateOption(question.id, opt.id, val)}
                      placeholder={`보기 ${i + 1}`}
                      className="flex-1 min-w-0 text-[15px] text-secondary-800 bg-transparent border-none outline-none placeholder:text-secondary-400"
                    />
                    {isSelected && question.options!.length > 1 && (
                      <button
                        onClick={stop(() => onDeleteOption(question.id, opt.id))}
                        aria-label="보기 삭제"
                        className="p-1 rounded-md text-secondary-300 hover:text-error opacity-0 group-hover/opt:opacity-100 transition-opacity"
                      >
                        <CloseIcon />
                      </button>
                    )}
                  </div>
                ))}
                {isSelected && (
                  <button
                    onClick={stop(() => onAddOption(question.id))}
                    className="flex items-center gap-1.5 h-10 px-1 text-sm font-medium"
                    style={{ color: themeColor }}
                  >
                    <PlusIcon /> 보기 추가
                  </button>
                )}
              </div>
            )}

            {question.type === 'dropdown' && question.options && (
              <div>
                <div className={`${FIELD_BOX} h-11 justify-between`}>
                  <span>선택해 주세요</span>
                  <ChevronIcon />
                </div>
                {isSelected && (
                  <div className="mt-3 space-y-1.5">
                    {question.options.map((opt, i) => (
                      <div key={opt.id} className="flex items-center gap-2 group/opt">
                        <span className="w-5 text-right text-xs text-secondary-400 tabular-nums">{i + 1}</span>
                        <EditableInput
                          value={opt.text}
                          onChange={(val) => onUpdateOption(question.id, opt.id, val)}
                          placeholder={`보기 ${i + 1}`}
                          className="flex-1 min-w-0 h-10 px-3 text-sm text-secondary-800 bg-white rounded-lg border border-secondary-200 outline-none focus:border-primary-500"
                        />
                        {question.options!.length > 1 && (
                          <button
                            onClick={stop(() => onDeleteOption(question.id, opt.id))}
                            aria-label="보기 삭제"
                            className="p-1 rounded-md text-secondary-300 hover:text-error opacity-0 group-hover/opt:opacity-100 transition-opacity"
                          >
                            <CloseIcon />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={stop(() => onAddOption(question.id))}
                      className="flex items-center gap-1.5 h-10 pl-7 text-sm font-medium"
                      style={{ color: themeColor }}
                    >
                      <PlusIcon /> 보기 추가
                    </button>
                  </div>
                )}
              </div>
            )}

            {question.type === 'rating' && (
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: question.ratingMax || 5 }).map((_, i) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    className="w-11 h-11 rounded-xl border border-secondary-200 flex items-center justify-center text-sm font-medium text-secondary-500 tabular-nums"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {question.type === 'date' && (
              <div className={`${FIELD_BOX} h-11 w-52 gap-2`}>
                <CalendarIcon /> 연도. 월. 일
              </div>
            )}
          </div>

          {/* Toolbar */}
          {isSelected && (
            <div className="mt-5 pt-4 ml-10 border-t border-secondary-100 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 text-sm text-secondary-700 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={question.required}
                  onChange={(v) => onUpdate(question.id, { required: v })}
                  color={themeColor}
                  label="필수 응답"
                />
                필수 응답
              </label>
              <div className="flex items-center gap-0.5">
                <button onClick={stop(() => onOpenAI(question.id))} className={TOOL_BUTTON} title="AI로 질문·보기 만들기">
                  <SparkleIcon />
                </button>
                <button onClick={stop(() => onUploadImage(question.id))} className={TOOL_BUTTON} title="이미지 추가">
                  <ImageIcon />
                </button>
                <span className="mx-1 h-4 w-px bg-secondary-200" />
                <button onClick={stop(() => onMove(question.id, 'up'))} disabled={isFirst} className={TOOL_BUTTON} title="위로">
                  <ChevronIcon direction="up" />
                </button>
                <button onClick={stop(() => onMove(question.id, 'down'))} disabled={isLast} className={TOOL_BUTTON} title="아래로">
                  <ChevronIcon direction="down" />
                </button>
                <button onClick={stop(() => onCopy(question.id))} className={TOOL_BUTTON} title="복제">
                  <CopyIcon />
                </button>
                <button
                  onClick={stop(() => onDelete(question.id))}
                  className="p-2 rounded-lg text-secondary-500 hover:text-error hover:bg-red-50 transition-colors"
                  title="삭제"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          )}
        </div>
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
  const [themeColor, setThemeColor] = useState(existingSurvey?.themeColor || '#3182F6');
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
  const [showPreview, setShowPreview] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showMobileCustomize, setShowMobileCustomize] = useState(false);
  const [showCoachMark, setShowCoachMark] = useState(
    () => !localStorage.getItem('customize_coach_dismissed'),
  );
  const [aiTargetQuestion, setAiTargetQuestion] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiVersions, setAiVersions] = useState<GeminiChoicesResult[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
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
            // 이슈 5: SUBJECTIVE_QUESTION은 저장된 format(email/date/rating 등)으로 세부 타입 복원
            type: (q.type === 'SUBJECTIVE_QUESTION' && q.format
              ? q.format
              : backendToFrontend[q.type] || 'short_text') as QuestionType,
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
            { id: `opt-${Date.now()}-1`, text: '보기 1' },
            { id: `opt-${Date.now()}-2`, text: '보기 2' },
          ]
        : undefined,
      ratingMax: type === 'rating' ? 5 : undefined,
    };
    setQuestions([...questions, newQ]);
    setSelectedQuestionId(newQ.id);
    return newQ.id;
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
          : { ...q, options: [...q.options, { id: `opt-${Date.now()}`, text: `보기 ${q.options.length + 1}` }] },
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
    setAiVersions([]);
    setShowAIModal(true);
  };
  const handleUploadImageForQuestion = (id: string) => {
    setUploadingImageForQuestion(id);
    questionImageInputRef.current?.click();
  };

  const handleAIGenerate = async () => {
    if (!aiTargetQuestion || !aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await generateChoicesAPI(aiPrompt);
      if (result.choices.length > 0) {
        setAiVersions((prev) => [...prev, result]);
        setAiPrompt('');
      } else {
        alert('AI가 선택지를 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch {
      alert('AI 생성에 실패했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectVersion = (result: GeminiChoicesResult) => {
    if (!aiTargetQuestion) return;
    const newOpts = result.choices.map((t, i) => ({ id: `opt-${Date.now()}-${i}`, text: t }));
    updateQuestion(aiTargetQuestion, {
      label: result.title || undefined,
      options: newOpts,
    });
    setShowAIModal(false);
    setAiVersions([]);
    setAiPrompt('');
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

    // 배포 전 유효성 검사 — API 호출 전에 모두 통과해야 함
    if (!title || !title.trim()) {
      alert('설문 제목을 입력해주세요.');
      return;
    }
    if (!deadline) {
      alert('마감일을 설정해주세요.');
      return;
    }
    const realQuestions = questions.filter((q) => q.type !== 'section_divider');
    if (realQuestions.length === 0) {
      alert('질문을 하나 이상 추가해주세요.');
      return;
    }

    setIsPublishing(true);

    // 질문 타입 반환: SurveyEditor 형식 -> 백엔드가 이해하는 형식
    const mappedQuestions = realQuestions.map((q) => {
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
          // Backend doesn't persist this field yet (see Issue 5 backend notes) —
          // sending it now so the response UI can use it once that lands.
          format: q.type,
        };
      });

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

  const focusQuestion = (id: string) => {
    setSelectedQuestionId(id);
    document.getElementById(`question-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAddQuestion = (type: QuestionType) => {
    const id = addQuestion(type);
    window.setTimeout(() => {
      document.getElementById(`question-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const dismissCoachMark = () => {
    setShowCoachMark(false);
    localStorage.setItem('customize_coach_dismissed', '1');
  };

  const canvasFont = fontStack(selectedFont);
  const panelLabel = 'mb-2.5 text-xs font-medium text-secondary-500';
  const modalPanel = 'relative w-full bg-white rounded-2xl border border-secondary-200 shadow-modal';
  const inputClass =
    'w-full h-11 px-3.5 rounded-xl bg-secondary-50 border border-secondary-200 text-sm text-secondary-900 outline-none transition-colors focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10';

  const designPanel = (
    <div className="p-5 space-y-7">
      <section>
        <p className={panelLabel}>테마 색</p>
        <div className="grid grid-cols-8 gap-2">
          {THEME_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setThemeColor(color)}
              aria-label={`테마 색 ${color}`}
              className="w-full aspect-square min-h-0 min-w-0 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                boxShadow: themeColor === color ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : undefined,
              }}
            />
          ))}
        </div>
      </section>

      <section>
        <p className={panelLabel}>글꼴</p>
        <div className="space-y-1.5">
          {FONTS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFont(f)}
              className={`w-full flex items-center justify-between h-10 px-3 rounded-lg border text-sm transition-colors ${
                selectedFont === f
                  ? 'border-secondary-900 text-secondary-900 font-medium'
                  : 'border-secondary-200 text-secondary-700 hover:bg-secondary-50'
              }`}
              style={{ fontFamily: fontStack(f) }}
            >
              {f}
              {selectedFont === f && <CheckIcon />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className={panelLabel}>카드 모서리</p>
        <div className="grid grid-cols-3 gap-2">
          {CARD_SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCardShape(s.id)}
              className={`flex flex-col items-center gap-2 py-3 rounded-lg border text-xs transition-colors ${
                cardShape === s.id
                  ? 'border-secondary-900 text-secondary-900 font-medium'
                  : 'border-secondary-200 text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <span
                className="w-9 h-6 border-2 border-current"
                style={{ borderRadius: s.id === 'sharp' ? 3 : s.id === 'pill' ? 12 : 7 }}
              />
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className={panelLabel}>공개 범위</p>
        <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg border border-secondary-200">
          <div className="min-w-0">
            <p className="text-sm font-medium text-secondary-900">{isPublic ? '전체 공개' : '로그인 필요'}</p>
            <p className="mt-0.5 text-xs text-secondary-500">
              {isPublic ? '링크만 있으면 누구나 응답할 수 있어요' : '로그인한 사람만 응답할 수 있어요'}
            </p>
          </div>
          <Switch checked={isPublic} onChange={setIsPublic} label="전체 공개" />
        </div>
      </section>

      <section>
        <p className={panelLabel}>해시태그</p>
        <div className="flex gap-1.5">
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
            className="flex-1 min-w-0 h-9 px-3 rounded-lg bg-secondary-50 border border-secondary-200 text-sm outline-none focus:bg-white focus:border-primary-500"
          />
          <button
            type="button"
            onClick={addHashtag}
            className="h-9 px-3 rounded-lg bg-secondary-900 text-white text-sm font-medium hover:bg-secondary-800 transition-colors"
          >
            추가
          </button>
        </div>
        {hashtags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 h-7 pl-2.5 pr-1 rounded-md bg-secondary-100 text-xs text-secondary-700"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => setHashtags(hashtags.filter((t) => t !== tag))}
                  aria-label={`${tag} 삭제`}
                  className="inline-flex min-h-0 min-w-0 scale-75 text-secondary-400 hover:text-secondary-800"
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {suggestedTags
            .filter((t) => !hashtags.includes(t))
            .slice(0, 5)
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setHashtags([...hashtags, tag])}
                className="h-7 px-2.5 rounded-md border border-dashed border-secondary-300 text-xs text-secondary-500 hover:text-secondary-800 hover:border-secondary-400 transition-colors"
              >
                + {tag}
              </button>
            ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50">
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
      <header className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur border-b border-secondary-200">
        <div className="h-full px-3 sm:px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate(-1)}
              aria-label="뒤로 가기"
              className="p-2 rounded-lg text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 transition-colors flex-shrink-0"
            >
              <ArrowLeftIcon />
            </button>
            <div className="hidden sm:block h-5 w-px bg-secondary-200 flex-shrink-0" />
            <div className="min-w-0 pl-1">
              <p className="text-sm font-semibold text-secondary-900 truncate">{title.trim() || '제목 없는 설문'}</p>
              <p className="text-[11px] text-secondary-500">
                {isSaved ? '임시 저장됨' : `질문 ${questions.length}개`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-100 transition-colors"
              title="미리보기"
            >
              <EyeIcon />
              <span className="hidden sm:inline">미리보기</span>
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-100 transition-colors"
              title="임시 저장"
            >
              <SaveIcon />
              <span className="hidden sm:inline">{isSaved ? '저장됨' : '임시 저장'}</span>
            </button>
            <button
              onClick={() => setShowPublish(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              <SendIcon /> 배포
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left: question types + outline */}
        <aside className="hidden lg:flex flex-col self-start sticky top-14 w-60 shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto bg-white border-r border-secondary-200">
          <div className="p-3 pt-5">
            <p className="px-2 mb-2 text-xs font-medium text-secondary-500">질문 추가</p>
            <div className="space-y-0.5">
              {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => handleAddQuestion(type)}
                  className="group w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-secondary-700 hover:bg-secondary-100 transition-colors"
                >
                  <span className="w-7 h-7 rounded-md border border-secondary-200 bg-white flex items-center justify-center text-secondary-500 group-hover:text-secondary-900 transition-colors">
                    <Icon />
                  </span>
                  {label}
                  <span className="ml-auto text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity scale-75">
                    <PlusIcon />
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-3 pt-4 border-t border-secondary-100">
            <p className="px-2 mb-2 text-xs font-medium text-secondary-500">
              질문 목록 <span className="ml-0.5 text-secondary-400 tabular-nums">{questions.length}</span>
            </p>
            {questions.length === 0 ? (
              <p className="px-2 text-[13px] text-secondary-400">아직 질문이 없어요</p>
            ) : (
              <ol className="space-y-0.5">
                {questions.map((q, i) => (
                  <li key={q.id}>
                    <button
                      onClick={() => focusQuestion(q.id)}
                      className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left text-[13px] transition-colors ${
                        selectedQuestionId === q.id
                          ? 'bg-secondary-100 text-secondary-900 font-medium'
                          : 'text-secondary-600 hover:bg-secondary-50'
                      }`}
                    >
                      <span className="w-5 shrink-0 text-secondary-400 tabular-nums">{i + 1}</span>
                      <span className="truncate">{q.label || '제목 없는 질문'}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 pt-6 sm:pt-10 pb-32">
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Survey header card */}
            <div
              className="bg-white border border-secondary-200 overflow-hidden"
              style={{ borderRadius: cardRadius, fontFamily: canvasFont }}
            >
              <div
                onClick={() => coverInputRef.current?.click()}
                className="relative h-36 sm:h-44 cursor-pointer group"
                style={
                  coverImage
                    ? undefined
                    : {
                        backgroundColor: `${themeColor}14`,
                        backgroundImage: `radial-gradient(${themeColor}38 1px, transparent 1px)`,
                        backgroundSize: '16px 16px',
                      }
                }
              >
                {coverImage ? (
                  <>
                    <img src={coverImage} alt="커버" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-sm font-medium text-white">커버 이미지 바꾸기</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/90 border border-secondary-200 text-[13px] font-medium text-secondary-600 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                      <ImageIcon /> 커버 이미지 추가
                    </span>
                  </div>
                )}
              </div>
              <div className="px-6 sm:px-8 pt-6 pb-7">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목 없는 설문"
                  className="w-full text-[26px] sm:text-[30px] leading-tight font-bold tracking-[-0.02em] text-secondary-900 bg-transparent border-none outline-none placeholder:text-secondary-300"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="응답자에게 보여줄 설명을 적어 주세요 (선택)"
                  rows={2}
                  className="mt-2 w-full text-[15px] leading-relaxed text-secondary-600 bg-transparent border-none outline-none resize-none placeholder:text-secondary-400"
                />
              </div>
            </div>

            {/* Questions */}
            <Reorder.Group
              axis="y"
              values={questions}
              onReorder={setQuestions}
              className="space-y-3"
              style={{ fontFamily: canvasFont }}
            >
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

            {questions.length === 0 ? (
              <div
                className="bg-white border border-dashed border-secondary-300 px-6 py-10 text-center"
                style={{ borderRadius: cardRadius }}
              >
                <p className="text-[15px] font-semibold text-secondary-900">첫 질문을 추가해 보세요</p>
                <p className="mt-1 text-sm text-secondary-500">자주 쓰는 유형부터 골라 보세요.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {QUESTION_TYPES.filter((t) => ['single_choice', 'short_text', 'rating'].includes(t.type)).map(
                    ({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        onClick={() => handleAddQuestion(type)}
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-secondary-200 bg-white text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                      >
                        <Icon /> {label}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-secondary-200 p-4 sm:p-5" style={{ borderRadius: cardRadius }}>
                <p className="mb-3 text-xs font-medium text-secondary-500">질문 추가</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => handleAddQuestion(type)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-secondary-200 text-xs text-secondary-700 hover:border-secondary-300 hover:bg-secondary-50 transition-colors"
                    >
                      <span className="text-secondary-500">
                        <Icon />
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right: design */}
        <aside className="hidden xl:block self-start sticky top-14 w-72 shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto bg-white border-l border-secondary-200">
          <div className="px-5 pt-5">
            <p className="text-sm font-semibold text-secondary-900">디자인</p>
            <p className="mt-0.5 text-xs text-secondary-500">응답자가 보는 화면에 적용돼요.</p>
          </div>
          {designPanel}
        </aside>
      </div>

      {/* Mobile design button + coach mark */}
      <div className="fixed bottom-6 right-5 z-40 xl:hidden flex flex-col items-end gap-2.5">
        <AnimatePresence>
          {showCoachMark && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="relative max-w-[200px] rounded-xl bg-secondary-900 px-3.5 py-2.5 text-xs leading-relaxed text-white shadow-lg"
            >
              색·글꼴·카드 모양은 여기서 바꿀 수 있어요
              <button
                onClick={dismissCoachMark}
                aria-label="안내 닫기"
                className="absolute -top-2 -right-2 w-6 h-6 min-h-0 min-w-0 rounded-full bg-secondary-700 text-white flex items-center justify-center"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <span className="absolute -bottom-1 right-5 w-2.5 h-2.5 rotate-45 bg-secondary-900" />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => {
            setShowMobileCustomize(true);
            dismissCoachMark();
          }}
          aria-label="디자인 설정 열기"
          className="w-12 h-12 rounded-full bg-secondary-900 text-white shadow-[0_8px_24px_-6px_rgba(25,31,40,0.45)] flex items-center justify-center hover:bg-secondary-800 transition-colors"
        >
          <PaletteIcon />
        </button>
      </div>

      {/* Mobile design drawer */}
      <AnimatePresence>
        {showMobileCustomize && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-secondary-900/40 xl:hidden"
              onClick={() => setShowMobileCustomize(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 w-80 max-w-[88vw] bg-white shadow-modal overflow-y-auto xl:hidden"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between h-14 px-5 bg-white border-b border-secondary-100">
                <p className="text-sm font-semibold text-secondary-900">디자인</p>
                <button
                  onClick={() => setShowMobileCustomize(false)}
                  aria-label="닫기"
                  className="p-2 -mr-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              {designPanel}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          >
            <div className="absolute inset-0 bg-secondary-900/40" onClick={() => setShowPreview(false)} />
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-secondary-50 rounded-2xl border border-secondary-200 shadow-modal overflow-hidden"
            >
              <div className="flex items-center justify-between h-12 px-4 bg-white border-b border-secondary-200 flex-shrink-0">
                <p className="text-sm font-semibold text-secondary-900">
                  미리보기 <span className="ml-1 font-normal text-secondary-500">응답자에게 이렇게 보여요</span>
                </p>
                <button
                  onClick={() => setShowPreview(false)}
                  aria-label="닫기"
                  className="p-2 -mr-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-8" style={{ fontFamily: canvasFont }}>
                <div className="max-w-xl mx-auto space-y-3">
                  <div className="bg-white border border-secondary-200 overflow-hidden" style={{ borderRadius: cardRadius }}>
                    {coverImage ? (
                      <img src={coverImage} alt="커버" className="w-full h-36 object-cover" />
                    ) : (
                      <div className="h-2" style={{ backgroundColor: themeColor }} />
                    )}
                    <div className="p-6">
                      <h1 className="text-2xl font-bold tracking-[-0.02em] text-secondary-900">
                        {title || '제목 없는 설문'}
                      </h1>
                      {description && (
                        <p className="mt-2 text-[15px] leading-relaxed text-secondary-600 whitespace-pre-line">{description}</p>
                      )}
                    </div>
                  </div>

                  {questions.map((q, i) => (
                    <div key={q.id} className="bg-white border border-secondary-200 p-5 sm:p-6" style={{ borderRadius: cardRadius }}>
                      <p className="mb-4 text-[16px] font-semibold text-secondary-900">
                        <span className="mr-1.5 tabular-nums" style={{ color: themeColor }}>
                          {i + 1}.
                        </span>
                        {q.label}
                        {q.required && <span className="ml-1 text-error">*</span>}
                      </p>
                      {(q.type === 'short_text' || q.type === 'email' || q.type === 'number') && (
                        <div className={`${FIELD_BOX} h-11`}>
                          {q.type === 'email' ? 'name@example.com' : q.type === 'number' ? '숫자 입력' : '답변을 입력해 주세요'}
                        </div>
                      )}
                      {q.type === 'long_text' && <div className={`${FIELD_BOX} h-24 !items-start pt-3`}>답변을 입력해 주세요</div>}
                      {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options && (
                        <div className="space-y-1.5">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center gap-3 h-12 px-3.5 rounded-xl border border-secondary-200 text-[15px] text-secondary-800"
                            >
                              <span
                                className={`w-[18px] h-[18px] border-2 border-secondary-300 shrink-0 ${q.type === 'single_choice' ? 'rounded-full' : 'rounded-[5px]'}`}
                              />
                              {opt.text}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'dropdown' && (
                        <div className={`${FIELD_BOX} h-11 justify-between`}>
                          <span>선택해 주세요</span>
                          <ChevronIcon />
                        </div>
                      )}
                      {q.type === 'rating' && (
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from({ length: q.ratingMax || 5 }).map((_, n) => (
                            <div
                              // eslint-disable-next-line react/no-array-index-key
                              key={n}
                              className="w-11 h-11 rounded-xl border border-secondary-200 flex items-center justify-center text-sm font-medium text-secondary-600 tabular-nums"
                            >
                              {n + 1}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'date' && (
                        <div className={`${FIELD_BOX} h-11 w-52 gap-2`}>
                          <CalendarIcon /> 연도. 월. 일
                        </div>
                      )}
                    </div>
                  ))}

                  {questions.length === 0 ? (
                    <div className="py-12 text-center text-sm text-secondary-500">아직 질문이 없어요</div>
                  ) : (
                    <div
                      className="h-12 rounded-xl flex items-center justify-center text-[15px] font-semibold text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      제출하기
                    </div>
                  )}
                </div>
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
            <div className="absolute inset-0 bg-secondary-900/40" onClick={() => setShowPublish(false)} />
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className={`${modalPanel} max-w-md max-h-[90vh] flex flex-col`}
            >
              <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-secondary-900">배포하기</h2>
                  <p className="mt-1 text-[13px] text-secondary-500">응답을 받기 전에 마지막으로 확인해 주세요.</p>
                </div>
                <button
                  onClick={() => setShowPublish(false)}
                  aria-label="닫기"
                  className="p-2 -mr-2 -mt-1 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="px-6 overflow-y-auto divide-y divide-secondary-100">
                {/* Public/Private */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-secondary-900">공개 범위</p>
                    <p className="mt-0.5 text-[13px] text-secondary-500">
                      {isPublic ? '전체 공개 · 링크만 있으면 누구나 응답해요' : '로그인한 사람만 응답할 수 있어요'}
                    </p>
                  </div>
                  <Switch checked={isPublic} onChange={setIsPublic} label="전체 공개" />
                </div>

                {/* Deadline */}
                <div className="py-4">
                  <label htmlFor="publish-deadline" className="flex items-center gap-1.5 text-sm font-medium text-secondary-900">
                    마감일 <span className="text-error">*</span>
                  </label>
                  <input
                    id="publish-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={`mt-2 ${inputClass}`}
                  />
                </div>

                {/* Hashtags */}
                <div className="py-4">
                  <p className="text-sm font-medium text-secondary-900">해시태그</p>
                  {hashtags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {hashtags.map((tag) => (
                        <span key={tag} className="inline-flex items-center h-7 px-2.5 rounded-md bg-secondary-100 text-xs text-secondary-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-[13px] text-secondary-500">아직 없어요. 디자인 패널에서 추가할 수 있어요.</p>
                  )}
                </div>

                {/* Email PDF Report */}
                <div className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-secondary-900">응답이 모이면 리포트 받기</p>
                      <p className="mt-0.5 text-[13px] text-secondary-500">정한 응답 수에 도달하면 분석 결과를 PDF로 보내드려요.</p>
                    </div>
                    <Switch checked={enableEmailReport} onChange={setEnableEmailReport} label="리포트 받기" />
                  </div>
                  {enableEmailReport && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-secondary-600">응답 수 기준</p>
                        <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-secondary-100">
                          {[10, 50, 100, 200, 500].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setEmailReportThreshold(n)}
                              className={`h-8 rounded-lg text-xs font-medium tabular-nums transition-colors ${
                                emailReportThreshold === n
                                  ? 'bg-white text-secondary-900 shadow-[0_1px_3px_rgba(25,31,40,0.1)]'
                                  : 'text-secondary-500 hover:text-secondary-800'
                              }`}
                            >
                              {n}명
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          min={1}
                          value={emailReportThreshold}
                          onChange={(e) => setEmailReportThreshold(Math.max(1, Number(e.target.value) || 1))}
                          aria-label="응답 수 직접 입력"
                          className={`mt-2 ${inputClass}`}
                        />
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-secondary-600">받는 이메일</p>
                        <input
                          type="email"
                          value={reportEmail}
                          onChange={(e) => setReportEmail(e.target.value)}
                          placeholder="name@example.com"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-secondary-100 flex gap-2">
                <button
                  onClick={() => setShowPublish(false)}
                  className="flex-1 h-11 rounded-xl border border-secondary-200 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex-1 h-11 rounded-xl bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? '배포하는 중…' : '배포하기'}
                </button>
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
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          >
            <div className="absolute inset-0 bg-secondary-900/40" onClick={() => setShowAIModal(false)} />
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className={`${modalPanel} max-w-md flex flex-col`}
              style={{ maxHeight: '80vh' }}
            >
              <div className="flex items-start justify-between gap-3 p-5 border-b border-secondary-100">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <SparkleIcon />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-secondary-900">AI로 질문·보기 만들기</p>
                    <p className="mt-0.5 text-[13px] text-secondary-500">원하는 내용을 적으면 몇 가지 안을 만들어 드려요.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIModal(false)}
                  aria-label="닫기"
                  className="p-2 -mr-2 -mt-1 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {aiVersions.length === 0 && !isAiLoading && (
                  <p className="py-8 text-center text-sm text-secondary-500">마음에 드는 안을 고르면 질문에 바로 들어가요.</p>
                )}
                {aiVersions.map((result, idx) => (
                  <button
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    onClick={() => handleSelectVersion(result)}
                    className="w-full text-left rounded-xl border border-secondary-200 p-4 hover:border-primary-400 hover:bg-primary-50/40 transition-colors"
                  >
                    <p className="text-xs font-medium text-secondary-500">안 {idx + 1}</p>
                    {result.title && <p className="mt-1 text-sm font-semibold text-secondary-900">{result.title}</p>}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {result.choices.map((c, i) => (
                        <span
                          // eslint-disable-next-line react/no-array-index-key
                          key={i}
                          className="inline-flex items-center h-7 px-2.5 rounded-md bg-secondary-100 text-[13px] text-secondary-700"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
                {isAiLoading && (
                  <div className="rounded-xl border border-secondary-200 p-4 space-y-2.5 animate-pulse">
                    <div className="h-3 w-12 rounded bg-secondary-100" />
                    <div className="h-4 w-2/3 rounded bg-secondary-100" />
                    <div className="flex gap-1.5">
                      <div className="h-7 w-16 rounded-md bg-secondary-100" />
                      <div className="h-7 w-20 rounded-md bg-secondary-100" />
                      <div className="h-7 w-14 rounded-md bg-secondary-100" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-secondary-100 flex gap-2">
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleAIGenerate();
                  }}
                  placeholder="예: 카페 신메뉴 맛 평가 보기 5개"
                  className={inputClass}
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={!aiPrompt.trim() || isAiLoading}
                  aria-label="만들기"
                  className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <SendIcon />
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
