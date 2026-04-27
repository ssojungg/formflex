import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useSurveyStore, Question, QuestionType, QuestionOption } from '../../store/SurveyStore';

// Modern Icons
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const GripIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.5"/>
    <circle cx="9" cy="12" r="1.5"/>
    <circle cx="9" cy="18" r="1.5"/>
    <circle cx="15" cy="6" r="1.5"/>
    <circle cx="15" cy="12" r="1.5"/>
    <circle cx="15" cy="18" r="1.5"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/>
  </svg>
);

const ChevronIcon = ({ direction = 'down' }: { direction?: 'up' | 'down' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none' }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

// Question type configurations
const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.FC }[] = [
  { 
    type: 'short_text', 
    label: '단답형', 
    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
  },
  { 
    type: 'long_text', 
    label: '장문형', 
    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
  },
  { 
    type: 'single_choice', 
    label: '단일 선택', 
    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>
  },
  { 
    type: 'multiple_choice', 
    label: '복수 선택', 
    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 11 12 14 22 4"/></svg>
  },
  { 
    type: 'dropdown', 
    label: '드롭다운', 
    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
  },
  { 
    type: 'rating', 
    label: '평점', 
    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  },
  { 
    type: 'date', 
    label: '날짜', 
    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  },
  { 
    type: 'email', 
    label: '이메일', 
    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  },
  { 
    type: 'number', 
    label: '숫자', 
    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 17h6M4 17V7M14 7l2 10M18 7l-2 10M14 12h4"/></svg>
  },
];

const THEME_COLORS = ['#6B8E6B', '#5B9BD5', '#ED7D31', '#9E5EB8', '#70AD47', '#FFC000', '#4472C4', '#C00000'];

// Editable input component with local state
const EditableInput = React.memo(({ 
  value, 
  onChange, 
  placeholder, 
  className,
  multiline = false,
  rows = 1
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
});

EditableInput.displayName = 'EditableInput';

// Question Card Component
const QuestionCard = React.memo(({
  question,
  index,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onUpdate,
  onDelete,
  onCopy,
  onMove,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}: {
  question: Question;
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onAddOption: (id: string) => void;
  onUpdateOption: (qId: string, optId: string, text: string) => void;
  onDeleteOption: (qId: string, optId: string) => void;
}) => {
  const hasOptions = ['single_choice', 'multiple_choice', 'dropdown'].includes(question.type);

  return (
    <Reorder.Item
      value={question}
      onClick={() => onSelect(question.id)}
      className={`group bg-white rounded-2xl border-2 transition-all duration-200 ${
        isSelected 
          ? 'border-primary-500 shadow-lg shadow-primary-500/10' 
          : 'border-transparent hover:border-secondary-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Drag Handle */}
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-secondary-400">
            <GripIcon />
          </div>

          {/* Question Number */}
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <EditableInput
              value={question.label}
              onChange={(val) => onUpdate(question.id, { label: val })}
              placeholder="질문을 입력하세요"
              className="w-full text-base font-medium text-secondary-900 bg-transparent border-none outline-none placeholder:text-secondary-400"
            />
            
            {/* Required badge */}
            {question.required && (
              <span className="inline-block mt-1 text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                필수
              </span>
            )}
          </div>

          {/* Actions - Only show on hover or when selected */}
          <div className={`flex items-center gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <button
              onClick={(e) => { e.stopPropagation(); onMove(question.id, 'up'); }}
              disabled={isFirst}
              className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 disabled:opacity-30 transition-colors"
            >
              <ChevronIcon direction="up" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMove(question.id, 'down'); }}
              disabled={isLast}
              className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 disabled:opacity-30 transition-colors"
            >
              <ChevronIcon direction="down" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCopy(question.id); }}
              className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
            >
              <CopyIcon />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}
              className="p-1.5 rounded-lg text-secondary-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        {/* Question Preview Based on Type */}
        <div className="ml-10">
          {/* Text inputs */}
          {(question.type === 'short_text' || question.type === 'email' || question.type === 'number') && (
            <div className="py-2.5 px-3 bg-secondary-50 rounded-xl text-secondary-400 text-sm border border-secondary-100">
              {question.type === 'email' ? '이메일 주소 입력' : question.type === 'number' ? '숫자 입력' : '답변 입력'}
            </div>
          )}

          {question.type === 'long_text' && (
            <div className="py-3 px-3 bg-secondary-50 rounded-xl text-secondary-400 text-sm border border-secondary-100 h-20">
              자세한 답변 입력
            </div>
          )}

          {/* Choice options */}
          {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <div key={opt.id} className="flex items-center gap-2 group/opt">
                  <div className={`w-4 h-4 border-2 border-secondary-300 flex-shrink-0 ${
                    question.type === 'single_choice' ? 'rounded-full' : 'rounded'
                  }`} />
                  <EditableInput
                    value={opt.text}
                    onChange={(val) => onUpdateOption(question.id, opt.id, val)}
                    placeholder={`옵션 ${i + 1}`}
                    className="flex-1 text-sm text-secondary-700 bg-transparent border-none outline-none placeholder:text-secondary-400"
                  />
                  {isSelected && question.options!.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteOption(question.id, opt.id); }}
                      className="opacity-0 group-hover/opt:opacity-100 p-1 rounded text-secondary-400 hover:text-red-500 transition-all"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>
              ))}
              {isSelected && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddOption(question.id); }}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 py-1"
                >
                  <PlusIcon /> 옵션 추가
                </button>
              )}
            </div>
          )}

          {question.type === 'dropdown' && question.options && (
            <div>
              <select disabled className="w-full py-2.5 px-3 bg-secondary-50 rounded-xl text-secondary-400 text-sm border border-secondary-100 appearance-none">
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
                          onClick={(e) => { e.stopPropagation(); onDeleteOption(question.id, opt.id); }}
                          className="opacity-0 group-hover/opt:opacity-100 p-1 rounded text-secondary-400 hover:text-red-500 transition-all"
                        >
                          <CloseIcon />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddOption(question.id); }}
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 py-1"
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
                <div key={i} className="w-9 h-9 rounded-lg bg-secondary-50 border border-secondary-200 flex items-center justify-center text-sm text-secondary-500 font-medium">
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

        {/* Settings bar when selected */}
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-secondary-100 ml-10"
          >
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-secondary-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => { e.stopPropagation(); onUpdate(question.id, { required: e.target.checked }); }}
                  className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                필수 응답
              </label>
            </div>
          </motion.div>
        )}
      </div>
    </Reorder.Item>
  );
});

QuestionCard.displayName = 'QuestionCard';

// Main Editor Component
function SurveyEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const surveyId = searchParams.get('id');
  const getSurveyById = useSurveyStore((state) => state.getSurveyById);
  const addSurvey = useSurveyStore((state) => state.addSurvey);
  const updateSurvey = useSurveyStore((state) => state.updateSurvey);
  const publishSurvey = useSurveyStore((state) => state.publishSurvey);
  
  const existingSurvey = surveyId ? getSurveyById(surveyId) : undefined;
  
  // Survey state
  const [title, setTitle] = useState(existingSurvey?.title || '');
  const [description, setDescription] = useState(existingSurvey?.description || '');
  const [questions, setQuestions] = useState<Question[]>(existingSurvey?.questions || []);
  const [themeColor, setThemeColor] = useState(existingSurvey?.themeColor || '#6B8E6B');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublic, setIsPublic] = useState(existingSurvey?.isPublic ?? true);
  const [hashtags, setHashtags] = useState<string[]>(existingSurvey?.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState('');

  // Select first question on load
  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions, selectedQuestionId]);

  const generateId = () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addQuestion = (type: QuestionType) => {
    const defaultLabels: Record<QuestionType, string> = {
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

    const newQuestion: Question = {
      id: generateId(),
      type,
      label: defaultLabels[type],
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

    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
  };

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      const filtered = prev.filter(q => q.id !== id);
      setSelectedQuestionId(curr => {
        if (curr === id && filtered.length > 0) {
          return filtered[Math.min(idx, filtered.length - 1)]?.id || null;
        }
        return curr;
      });
      return filtered;
    });
  }, []);

  const copyQuestion = useCallback((id: string) => {
    setQuestions(prev => {
      const q = prev.find(x => x.id === id);
      if (!q) return prev;
      const copy: Question = { ...JSON.parse(JSON.stringify(q)), id: generateId() };
      const idx = prev.findIndex(x => x.id === id);
      const newList = [...prev];
      newList.splice(idx + 1, 0, copy);
      setSelectedQuestionId(copy.id);
      return newList;
    });
  }, []);

  const moveQuestion = useCallback((id: string, dir: 'up' | 'down') => {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if ((dir === 'up' && idx <= 0) || (dir === 'down' && idx >= prev.length - 1)) return prev;
      const newList = [...prev];
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
      return newList;
    });
  }, []);

  const addOption = useCallback((qId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId || !q.options) return q;
      return { ...q, options: [...q.options, { id: `opt-${Date.now()}`, text: `옵션 ${q.options.length + 1}` }] };
    }));
  }, []);

  const updateOption = useCallback((qId: string, optId: string, text: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId || !q.options) return q;
      return { ...q, options: q.options.map(o => o.id === optId ? { ...o, text } : o) };
    }));
  }, []);

  const deleteOption = useCallback((qId: string, optId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId || !q.options || q.options.length <= 1) return q;
      return { ...q, options: q.options.filter(o => o.id !== optId) };
    }));
  }, []);

  const handleSave = () => {
    const data = { title: title || '제목 없는 설문', description, questions, themeColor, isPublic, hashtags };
    if (existingSurvey) {
      updateSurvey(existingSurvey.id, data);
    } else {
      const newSurvey = addSurvey({ ...data, status: 'draft' });
      navigate(`/create?id=${newSurvey.id}`, { replace: true });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePublish = () => {
    handleSave();
    if (existingSurvey) publishSurvey(existingSurvey.id);
    setShowPublish(false);
    navigate('/myform');
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) setHashtags([...hashtags, tag]);
    setHashtagInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-secondary-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Survey Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-100 mb-6">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설문에 대한 간단한 설명을 추가하세요 (선택사항)"
            className="w-full text-secondary-600 bg-transparent border-none outline-none resize-none placeholder:text-secondary-400"
            rows={2}
          />
          
          {/* Theme color selector */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-secondary-100">
            <span className="text-xs text-secondary-500">테마 색상</span>
            <div className="flex gap-1.5">
              {THEME_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setThemeColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${themeColor === color ? 'ring-2 ring-offset-2 ring-secondary-400 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
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
                onSelect={setSelectedQuestionId}
                onUpdate={updateQuestion}
                onDelete={deleteQuestion}
                onCopy={copyQuestion}
                onMove={moveQuestion}
                onAddOption={addOption}
                onUpdateOption={updateOption}
                onDeleteOption={deleteOption}
              />
            ))}
          </Reorder.Group>
        </div>

        {/* Add Question Section */}
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-dashed border-secondary-200">
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

        {/* Empty State */}
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
                {/* Public toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-900">공개 설문</p>
                    <p className="text-sm text-secondary-500">누구나 이 설문을 볼 수 있습니다</p>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-primary-500' : 'bg-secondary-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Hashtags */}
                <div>
                  <p className="font-medium text-secondary-900 mb-2">해시태그</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                      placeholder="태그 입력 후 Enter"
                      className="flex-1 px-3 py-2 rounded-xl bg-secondary-50 border border-secondary-200 text-sm outline-none focus:border-primary-500"
                    />
                    <button onClick={addHashtag} className="px-3 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium">
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-sm"
                      >
                        #{tag}
                        <button onClick={() => setHashtags(hashtags.filter(t => t !== tag))} className="hover:text-red-500">
                          <CloseIcon />
                        </button>
                      </span>
                    ))}
                  </div>
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
                {/* Preview header */}
                <div 
                  className="rounded-xl p-5 mb-6" 
                  style={{ backgroundColor: `${themeColor}15` }}
                >
                  <h1 className="text-xl font-bold text-secondary-900 mb-2">{title || '제목 없는 설문'}</h1>
                  {description && <p className="text-secondary-600">{description}</p>}
                </div>

                {/* Preview questions */}
                <div className="space-y-5">
                  {questions.map((q, i) => (
                    <div key={q.id} className="p-4 bg-secondary-50 rounded-xl">
                      <p className="font-medium text-secondary-900 mb-3">
                        <span className="text-primary-600 mr-2">Q{i + 1}.</span>
                        {q.label}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      
                      {(q.type === 'short_text' || q.type === 'email' || q.type === 'number') && (
                        <input type="text" disabled placeholder="답변 입력" className="w-full px-3 py-2.5 rounded-lg bg-white border border-secondary-200 text-sm" />
                      )}
                      {q.type === 'long_text' && (
                        <textarea disabled placeholder="답변 입력" rows={3} className="w-full px-3 py-2.5 rounded-lg bg-white border border-secondary-200 text-sm resize-none" />
                      )}
                      {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options && (
                        <div className="space-y-2">
                          {q.options.map(opt => (
                            <label key={opt.id} className="flex items-center gap-2 text-sm text-secondary-700">
                              <input type={q.type === 'single_choice' ? 'radio' : 'checkbox'} disabled />
                              {opt.text}
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'dropdown' && q.options && (
                        <select disabled className="w-full px-3 py-2.5 rounded-lg bg-white border border-secondary-200 text-sm">
                          <option>선택하세요</option>
                          {q.options.map(opt => <option key={opt.id}>{opt.text}</option>)}
                        </select>
                      )}
                      {q.type === 'rating' && (
                        <div className="flex gap-2">
                          {Array.from({ length: q.ratingMax || 5 }).map((_, i) => (
                            <div key={i} className="w-10 h-10 rounded-lg bg-white border border-secondary-200 flex items-center justify-center text-sm text-secondary-500">
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'date' && (
                        <input type="date" disabled className="px-3 py-2.5 rounded-lg bg-white border border-secondary-200 text-sm" />
                      )}
                    </div>
                  ))}
                </div>

                {questions.length === 0 && (
                  <div className="text-center py-12 text-secondary-500">
                    아직 질문이 없습니다
                  </div>
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
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center">
                <SendIcon />
              </div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-2">설문을 배포할까요?</h2>
              <p className="text-secondary-500 text-sm mb-6">
                배포 후에도 설문을 수정할 수 있습니다
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPublish(false)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary-100 text-secondary-700 font-medium hover:bg-secondary-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
                >
                  배포하기
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
