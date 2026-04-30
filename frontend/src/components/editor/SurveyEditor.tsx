import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useSurveyStore, Question, QuestionType, QuestionOption } from '../../store/SurveyStore';

// ==================== ICONS ====================
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/>
    <circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// Question type configurations with colors
const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.FC; color: string }[] = [
  { type: 'short_text', label: '단답형', color: '#6366f1', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg> },
  { type: 'long_text', label: '장문형', color: '#8b5cf6', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg> },
  { type: 'single_choice', label: '단일 선택', color: '#ec4899', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg> },
  { type: 'multiple_choice', label: '복수 선택', color: '#f43f5e', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 11 12 14 22 4"/></svg> },
  { type: 'dropdown', label: '드롭다운', color: '#f59e0b', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg> },
  { type: 'rating', label: '평점', color: '#10b981', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { type: 'date', label: '날짜', color: '#06b6d4', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { type: 'email', label: '이메일', color: '#3b82f6', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
  { type: 'number', label: '숫자', color: '#a855f7', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 17h6M4 17V7M14 7l2 10M18 7l-2 10M14 12h4"/></svg> },
];

const THEME_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
const FONTS = ['Pretendard', 'Noto Sans KR', 'Nanum Gothic', 'Gothic A1', 'Spoqa Han Sans'];
const CARD_SHAPES = [
  { id: 'rounded', label: '둥근', radius: '16px' },
  { id: 'sharp', label: '각진', radius: '4px' },
  { id: 'pill', label: '알약', radius: '24px' },
];

// ==================== EDITABLE INPUT ====================
const EditableInput = React.memo(({ 
  value, onChange, placeholder, className, multiline = false, rows = 1
}: { 
  value: string; onChange: (val: string) => void; placeholder?: string; className?: string; multiline?: boolean; rows?: number;
}) => {
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => { if (!focused) setLocal(value); }, [value, focused]);

  const handleBlur = () => { setFocused(false); if (local !== value) onChange(local); };

  if (multiline) {
    return <textarea value={local} onChange={(e) => setLocal(e.target.value)} onFocus={() => setFocused(true)} onBlur={handleBlur} placeholder={placeholder} className={className} rows={rows} onClick={(e) => e.stopPropagation()} />;
  }
  return <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} onFocus={() => setFocused(true)} onBlur={handleBlur} placeholder={placeholder} className={className} onClick={(e) => e.stopPropagation()} />;
});
EditableInput.displayName = 'EditableInput';

// ==================== QUESTION CARD ====================
const QuestionCard = React.memo(({
  question, index, isSelected, isFirst, isLast, cardRadius, themeColor,
  onSelect, onUpdate, onDelete, onCopy, onMove, onAddOption, onUpdateOption, onDeleteOption, onOpenAI, onUploadImage, onRemoveImage,
}: {
  question: Question; index: number; isSelected: boolean; isFirst: boolean; isLast: boolean; cardRadius: string; themeColor: string;
  onSelect: (id: string) => void; onUpdate: (id: string, updates: Partial<Question>) => void;
  onDelete: (id: string) => void; onCopy: (id: string) => void; onMove: (id: string, direction: 'up' | 'down') => void;
  onAddOption: (id: string) => void; onUpdateOption: (qId: string, optId: string, text: string) => void;
  onDeleteOption: (qId: string, optId: string) => void; onOpenAI: (id: string) => void;
  onUploadImage: (id: string) => void; onRemoveImage: (id: string, index: number) => void;
}) => {
  const typeConfig = QUESTION_TYPES.find(t => t.type === question.type);
  
  return (
    <Reorder.Item
      value={question}
      onClick={() => onSelect(question.id)}
      className={`group relative bg-white transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10' 
          : 'hover:shadow-md border border-gray-100'
      }`}
      style={{ borderRadius: cardRadius }}
    >
      {/* Left accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity"
        style={{ backgroundColor: typeConfig?.color || themeColor, opacity: isSelected ? 1 : 0 }}
      />
      
      <div className="p-5 pl-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
            <GripIcon />
          </div>
          
          <div 
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${typeConfig?.color || themeColor}15`, color: typeConfig?.color || themeColor }}
          >
            {typeConfig && <typeConfig.icon />}
          </div>
          
          <div className="flex-1 min-w-0">
            <EditableInput 
              value={question.label} 
              onChange={(val) => onUpdate(question.id, { label: val })} 
              placeholder="질문을 입력하세요" 
              className="w-full text-base font-semibold text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-400" 
            />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{typeConfig?.label}</span>
              {question.required && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium text-rose-600 bg-rose-50 rounded">필수</span>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className={`flex items-center gap-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenAI(question.id); }} 
              className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors" 
              title="AI 생성"
            >
              <SparkleIcon />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onUploadImage(question.id); }} 
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" 
              title="이미지 추가"
            >
              <ImageIcon />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onCopy(question.id); }} 
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" 
              title="복제"
            >
              <CopyIcon />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(question.id); }} 
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" 
              title="삭제"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        {/* Question Images */}
        {question.imageUrls && question.imageUrls.length > 0 && (
          <div className="ml-11 mb-4 flex gap-2 overflow-x-auto pb-2">
            {question.imageUrls.map((url, i) => (
              <div key={i} className="relative flex-shrink-0 group/img">
                <img src={url} alt={`Question image ${i + 1}`} className="w-24 h-18 object-cover rounded-lg ring-1 ring-gray-100" />
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveImage(question.id, i); }} 
                  className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 hover:bg-rose-600 transition-all"
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Question Preview */}
        <div className="ml-11">
          {(question.type === 'short_text' || question.type === 'email' || question.type === 'number') && (
            <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-400 text-sm border border-gray-100">
              {question.type === 'email' ? '이메일 주소 입력' : question.type === 'number' ? '숫자 입력' : '답변 입력'}
            </div>
          )}
          
          {question.type === 'long_text' && (
            <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-400 text-sm border border-gray-100 h-20">
              자세한 답변 입력
            </div>
          )}
          
          {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <div key={opt.id} className="flex items-center gap-3 group/opt">
                  <div className={`w-5 h-5 border-2 border-gray-300 flex-shrink-0 flex items-center justify-center ${
                    question.type === 'single_choice' ? 'rounded-full' : 'rounded-md'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full bg-gray-200 ${question.type === 'single_choice' ? '' : 'hidden'}`} />
                  </div>
                  <EditableInput 
                    value={opt.text} 
                    onChange={(val) => onUpdateOption(question.id, opt.id, val)} 
                    placeholder={`옵션 ${i + 1}`} 
                    className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400 py-1" 
                  />
                  {isSelected && question.options!.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteOption(question.id, opt.id); }} 
                      className="opacity-0 group-hover/opt:opacity-100 p-1 rounded text-gray-400 hover:text-rose-500 transition-all"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>
              ))}
              {isSelected && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddOption(question.id); }} 
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 py-2 font-medium"
                >
                  <PlusIcon /> 옵션 추가
                </button>
              )}
            </div>
          )}

          {question.type === 'dropdown' && question.options && (
            <div>
              <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-400 text-sm border border-gray-100 flex items-center justify-between">
                <span>선택하세요</span>
                <ChevronDownIcon />
              </div>
              {isSelected && (
                <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-xl">
                  {question.options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2 group/opt">
                      <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                      <EditableInput 
                        value={opt.text} 
                        onChange={(val) => onUpdateOption(question.id, opt.id, val)} 
                        placeholder={`옵션 ${i + 1}`} 
                        className="flex-1 py-2 px-3 text-sm text-gray-700 bg-white rounded-lg border border-gray-200 outline-none focus:border-indigo-500" 
                      />
                      {question.options!.length > 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteOption(question.id, opt.id); }} 
                          className="opacity-0 group-hover/opt:opacity-100 p-1 rounded text-gray-400 hover:text-rose-500 transition-all"
                        >
                          <CloseIcon />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAddOption(question.id); }} 
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 py-1 font-medium"
                  >
                    <PlusIcon /> 옵션 추가
                  </button>
                </div>
              )}
            </div>
          )}

          {question.type === 'rating' && (
            <div className="flex gap-2">
              {Array.from({ length: question.ratingMax || 5 }).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-sm text-gray-500 font-medium hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors">
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {question.type === 'date' && (
            <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-400 text-sm border border-gray-100 w-48 flex items-center gap-2">
              <CalendarIcon />
              <span>YYYY-MM-DD</span>
            </div>
          )}
        </div>

        {/* Settings Toggle */}
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="mt-4 pt-4 border-t border-gray-100 ml-11"
          >
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group/req">
                <div className={`relative w-9 h-5 rounded-full transition-colors ${question.required ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${question.required ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
                <span className="text-sm text-gray-600">필수 응답</span>
              </label>
              <input 
                type="checkbox" 
                checked={question.required} 
                onChange={(e) => { e.stopPropagation(); onUpdate(question.id, { required: e.target.checked }); }} 
                className="sr-only"
                onClick={(e) => { e.stopPropagation(); onUpdate(question.id, { required: !question.required }); }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </Reorder.Item>
  );
});
QuestionCard.displayName = 'QuestionCard';

// ==================== MAIN EDITOR ====================
function SurveyEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get('id');
  const getSurveyById = useSurveyStore((state) => state.getSurveyById);
  const addSurvey = useSurveyStore((state) => state.addSurvey);
  const updateSurvey = useSurveyStore((state) => state.updateSurvey);
  const publishSurvey = useSurveyStore((state) => state.publishSurvey);
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
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTargetQuestion, setAiTargetQuestion] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showComponentPanel, setShowComponentPanel] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'settings' | 'style'>('settings');
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImageForQuestion, setUploadingImageForQuestion] = useState<string | null>(null);

  const cardRadius = CARD_SHAPES.find(s => s.id === cardShape)?.radius || '16px';

  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) setSelectedQuestionId(questions[0].id);
  }, [questions, selectedQuestionId]);

  const generateId = () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addQuestion = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      short_text: '짧은 답변을 입력해주세요', long_text: '자세한 의견을 들려주세요', email: '이메일 주소를 입력해주세요',
      number: '숫자를 입력해주세요', single_choice: '하나를 선택해주세요', multiple_choice: '해당하는 것을 모두 선택해주세요',
      dropdown: '목록에서 선택해주세요', rating: '평점을 매겨주세요', date: '날짜를 선택해주세요', section_divider: '섹션 제목',
    };
    const newQ: Question = {
      id: generateId(), type, label: labels[type], placeholder: '', required: false,
      options: ['single_choice', 'multiple_choice', 'dropdown'].includes(type) ? [{ id: `opt-${Date.now()}-1`, text: '옵션 1' }, { id: `opt-${Date.now()}-2`, text: '옵션 2' }] : undefined,
      ratingMax: type === 'rating' ? 5 : undefined,
    };
    setQuestions([...questions, newQ]);
    setSelectedQuestionId(newQ.id);
  };

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => { 
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q)); 
  }, []);
  
  const deleteQuestion = useCallback((id: string) => { 
    setQuestions(prev => { 
      const idx = prev.findIndex(q => q.id === id); 
      const f = prev.filter(q => q.id !== id); 
      setSelectedQuestionId(c => c === id && f.length > 0 ? f[Math.min(idx, f.length - 1)]?.id : c); 
      return f; 
    }); 
  }, []);
  
  const copyQuestion = useCallback((id: string) => { 
    setQuestions(prev => { 
      const q = prev.find(x => x.id === id); 
      if (!q) return prev; 
      const copy = { ...JSON.parse(JSON.stringify(q)), id: generateId() }; 
      const idx = prev.findIndex(x => x.id === id); 
      const n = [...prev]; 
      n.splice(idx + 1, 0, copy); 
      setSelectedQuestionId(copy.id); 
      return n; 
    }); 
  }, []);
  
  const moveQuestion = useCallback((id: string, dir: 'up' | 'down') => { 
    setQuestions(prev => { 
      const idx = prev.findIndex(q => q.id === id); 
      if ((dir === 'up' && idx <= 0) || (dir === 'down' && idx >= prev.length - 1)) return prev; 
      const n = [...prev]; 
      const s = dir === 'up' ? idx - 1 : idx + 1; 
      [n[idx], n[s]] = [n[s], n[idx]]; 
      return n; 
    }); 
  }, []);
  
  const addOption = useCallback((qId: string) => { 
    setQuestions(prev => prev.map(q => q.id !== qId || !q.options ? q : { ...q, options: [...q.options, { id: `opt-${Date.now()}`, text: `옵션 ${q.options.length + 1}` }] })); 
  }, []);
  
  const updateOption = useCallback((qId: string, optId: string, text: string) => { 
    setQuestions(prev => prev.map(q => q.id !== qId || !q.options ? q : { ...q, options: q.options.map(o => o.id === optId ? { ...o, text } : o) })); 
  }, []);
  
  const deleteOption = useCallback((qId: string, optId: string) => { 
    setQuestions(prev => prev.map(q => q.id !== qId || !q.options || q.options.length <= 1 ? q : { ...q, options: q.options.filter(o => o.id !== optId) })); 
  }, []);
  
  const removeQuestionImage = useCallback((qId: string, imgIdx: number) => {
    setQuestions(prev => prev.map(q => q.id !== qId || !q.imageUrls ? q : { ...q, imageUrls: q.imageUrls.filter((_, i) => i !== imgIdx) }));
  }, []);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => setCoverImage(ev.target?.result as string); reader.readAsDataURL(file); }
  };

  const handleQuestionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingImageForQuestion) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setQuestions(prev => prev.map(q => q.id !== uploadingImageForQuestion ? q : { ...q, imageUrls: [...(q.imageUrls || []), url] }));
        setUploadingImageForQuestion(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAIForQuestion = (id: string) => { setAiTargetQuestion(id); setAiPrompt(''); setShowAIModal(true); };
  const handleUploadImageForQuestion = (id: string) => { setUploadingImageForQuestion(id); questionImageInputRef.current?.click(); };

  const handleAIGenerate = () => {
    if (!aiTargetQuestion || !aiPrompt.trim()) return;
    const q = questions.find(x => x.id === aiTargetQuestion);
    if (!q) return;
    if (q.options) {
      const newOpts = aiPrompt.split(/[,\n]/).filter(Boolean).map((t, i) => ({ id: `opt-${Date.now()}-${i}`, text: t.trim() }));
      if (newOpts.length > 0) updateQuestion(aiTargetQuestion, { options: newOpts });
    }
    setShowAIModal(false);
  };

  const handleSave = () => {
    const data = { title: title || '제목 없는 설문', description, questions, themeColor, isPublic, hashtags };
    if (existingSurvey) { updateSurvey(existingSurvey.id, data); } 
    else { const newS = addSurvey({ ...data, status: 'draft' }); navigate(`/create?id=${newS.id}`, { replace: true }); }
    setIsSaved(true); setTimeout(() => setIsSaved(false), 2000);
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

  const suggestedTags = ['고객만족', '시장조사', 'HR', '이벤트', 'NPS', 'UX', '피드백'];
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  return (
    <div className="h-screen flex flex-col bg-[#f8f7ff]" style={{ fontFamily: selectedFont }}>
      {/* Hidden inputs */}
      <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} className="hidden" />
      <input type="file" ref={questionImageInputRef} accept="image/*" onChange={handleQuestionImageUpload} className="hidden" />

      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 z-50">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <ArrowLeftIcon />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="설문 제목을 입력하세요" 
              className="text-base font-semibold text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-400 w-64" 
            />
            <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
              {existingSurvey?.status === 'active' ? '배포됨' : '초안'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPreview(true)} 
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <EyeIcon /> 미리보기
            </button>
            <button 
              onClick={handleSave} 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSaved ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isSaved ? <CheckIcon /> : <SaveIcon />} {isSaved ? '저장됨' : '저장'}
            </button>
            <button 
              onClick={() => setShowPublish(true)} 
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors text-sm font-medium shadow-sm shadow-indigo-500/25"
            >
              <SendIcon /> 배포
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Palette */}
        <aside className={`flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ${showComponentPanel ? 'w-64' : 'w-0'}`}>
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">질문 유형</h3>
              <button 
                onClick={() => setShowComponentPanel(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {QUESTION_TYPES.map(({ type, label, icon: Icon, color }) => (
                <button 
                  key={type} 
                  onClick={() => addQuestion(type)} 
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group border border-transparent hover:border-gray-200"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <Icon />
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{label}</span>
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl">
              <p className="text-xs font-medium text-indigo-700 mb-2">설문 현황</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-indigo-900">{questions.length}</p>
                  <p className="text-xs text-indigo-600">질문</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-900">{questions.filter(q => q.required).length}</p>
                  <p className="text-xs text-indigo-600">필수</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Editor Canvas */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto py-8 px-6">
            {/* Show component panel toggle */}
            {!showComponentPanel && (
              <button 
                onClick={() => setShowComponentPanel(true)}
                className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                <PlusIcon /> 질문 유형 보기
              </button>
            )}

            {/* Cover Image */}
            <div 
              onClick={() => coverInputRef.current?.click()}
              className="relative mb-6 rounded-2xl overflow-hidden cursor-pointer group"
              style={{ backgroundColor: `${themeColor}15`, minHeight: coverImage ? 'auto' : '100px' }}
            >
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-medium text-sm">커버 이미지 변경</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full py-8 text-gray-400 group-hover:text-gray-600 transition-colors">
                  <ImageIcon /> <span className="ml-2 text-sm">커버 이미지 추가</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6" style={{ borderRadius: cardRadius }}>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="설문에 대한 설명을 추가하세요..." 
                className="w-full text-gray-600 bg-transparent border-none outline-none resize-none placeholder:text-gray-400 text-sm" 
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

            {/* Empty State */}
            {questions.length === 0 && (
              <div className="mt-8 text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-500">
                  <PlusIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">질문을 추가해보세요</h3>
                <p className="text-gray-500 text-sm mb-4">왼쪽 패널에서 질문 유형을 선택하세요</p>
                <button 
                  onClick={() => addQuestion('single_choice')}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                  첫 번째 질문 추가
                </button>
              </div>
            )}

            {/* Add Question Inline */}
            {questions.length > 0 && (
              <button 
                onClick={() => addQuestion('short_text')}
                className="mt-4 w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <PlusIcon /> 질문 추가
              </button>
            )}
          </div>
        </main>

        {/* Right Sidebar - Settings Panel */}
        <aside className="hidden lg:block w-72 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4">
              <button 
                onClick={() => setActiveRightTab('settings')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeRightTab === 'settings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                설정
              </button>
              <button 
                onClick={() => setActiveRightTab('style')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeRightTab === 'style' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                스타일
              </button>
            </div>

            {activeRightTab === 'settings' && (
              <div className="space-y-6">
                {/* Question Settings */}
                {selectedQuestion && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">질문 설정</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">필수 응답</span>
                        <button 
                          onClick={() => updateQuestion(selectedQuestion.id, { required: !selectedQuestion.required })}
                          className={`relative w-10 h-5 rounded-full transition-colors ${selectedQuestion.required ? 'bg-indigo-500' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${selectedQuestion.required ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                      
                      {selectedQuestion.type === 'rating' && (
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">최대 평점</label>
                          <select 
                            value={selectedQuestion.ratingMax || 5}
                            onChange={(e) => updateQuestion(selectedQuestion.id, { ratingMax: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                          >
                            {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n}점</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Survey Settings */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">설문 설정</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">공개 설문</span>
                      <button 
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${isPublic ? 'bg-indigo-500' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">마감일</label>
                      <input 
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">해시태그</h4>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={hashtagInput} 
                      onChange={(e) => setHashtagInput(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && addHashtag()} 
                      placeholder="#태그" 
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                    />
                    <button onClick={addHashtag} className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600">추가</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {hashtags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                        #{tag}
                        <button onClick={() => setHashtags(hashtags.filter(t => t !== tag))} className="hover:text-rose-500">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {suggestedTags.filter(t => !hashtags.includes(t)).slice(0, 4).map(tag => (
                      <button key={tag} onClick={() => setHashtags([...hashtags, tag])} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === 'style' && (
              <div className="space-y-6">
                {/* Theme Color */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">테마 색상</h4>
                  <div className="flex flex-wrap gap-2">
                    {THEME_COLORS.map(color => (
                      <button 
                        key={color} 
                        onClick={() => setThemeColor(color)} 
                        className={`w-8 h-8 rounded-full transition-all ${themeColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`} 
                        style={{ backgroundColor: color }} 
                      />
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">폰트</h4>
                  <select 
                    value={selectedFont} 
                    onChange={(e) => setSelectedFont(e.target.value)} 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Card Shape */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">카드 모양</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {CARD_SHAPES.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => setCardShape(s.id)} 
                        className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                          cardShape === s.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">미리보기</h2>
                <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <CloseIcon />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                {coverImage && <img src={coverImage} alt="Cover" className="w-full h-32 object-cover rounded-xl mb-6" />}
                <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: `${themeColor}15` }}>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{title || '제목 없는 설문'}</h1>
                  {description && <p className="text-gray-600 text-sm">{description}</p>}
                </div>
                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={q.id} className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-900 mb-3">
                        <span className="text-indigo-600 mr-2">{i + 1}.</span>
                        {q.label}
                        {q.required && <span className="text-rose-500 ml-1">*</span>}
                      </p>
                      {(q.type === 'short_text' || q.type === 'email' || q.type === 'number') && (
                        <input type="text" disabled placeholder="답변 입력" className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm" />
                      )}
                      {q.type === 'long_text' && (
                        <textarea disabled placeholder="답변 입력" rows={3} className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm resize-none" />
                      )}
                      {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options && (
                        <div className="space-y-2">
                          {q.options.map(opt => (
                            <label key={opt.id} className="flex items-center gap-2 text-sm text-gray-700">
                              <input type={q.type === 'single_choice' ? 'radio' : 'checkbox'} disabled />
                              {opt.text}
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'dropdown' && q.options && (
                        <select disabled className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm">
                          <option>선택하세요</option>
                          {q.options.map(opt => <option key={opt.id}>{opt.text}</option>)}
                        </select>
                      )}
                      {q.type === 'rating' && (
                        <div className="flex gap-2">
                          {Array.from({ length: q.ratingMax || 5 }).map((_, j) => (
                            <div key={j} className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm text-gray-500">{j + 1}</div>
                          ))}
                        </div>
                      )}
                      {q.type === 'date' && (
                        <input type="date" disabled className="px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublish && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPublish(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">설문 배포</h2>
                <button onClick={() => setShowPublish(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <CloseIcon />
                </button>
              </div>
              
              <div className="space-y-5">
                {/* Public toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">공개 설문</p>
                    <p className="text-sm text-gray-500">누구나 이 설문을 볼 수 있습니다</p>
                  </div>
                  <button 
                    onClick={() => setIsPublic(!isPublic)} 
                    className={`relative w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-indigo-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Deadline */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon />
                    <p className="font-medium text-gray-900">마감일 설정</p>
                  </div>
                  <input 
                    type="date" 
                    value={deadline} 
                    onChange={(e) => setDeadline(e.target.value)} 
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Email Report */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MailIcon />
                      <p className="font-medium text-gray-900">이메일 리포트</p>
                    </div>
                    <button 
                      onClick={() => setEnableEmailReport(!enableEmailReport)} 
                      className={`relative w-10 h-5 rounded-full transition-colors ${enableEmailReport ? 'bg-indigo-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enableEmailReport ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {enableEmailReport && (
                    <div className="space-y-3">
                      <input 
                        type="email" 
                        placeholder="이메일 주소" 
                        value={reportEmail} 
                        onChange={(e) => setReportEmail(e.target.value)} 
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={emailReportThreshold} 
                          onChange={(e) => setEmailReportThreshold(parseInt(e.target.value) || 0)} 
                          className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-sm text-gray-600">명 응답 시 자동 발송</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowPublish(false)} 
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handlePublish} 
                  className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors shadow-sm shadow-indigo-500/25"
                >
                  배포하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAIModal(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                    <SparkleIcon />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">AI 옵션 생성</h2>
                </div>
                <button onClick={() => setShowAIModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <CloseIcon />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">쉼표(,) 또는 줄바꿈으로 구분하여 옵션을 입력하세요</p>
              <textarea 
                value={aiPrompt} 
                onChange={(e) => setAiPrompt(e.target.value)} 
                placeholder="예: 매우 만족, 만족, 보통, 불만족, 매우 불만족" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-500"
                rows={4} 
              />
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setShowAIModal(false)} 
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleAIGenerate} 
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-600 hover:to-orange-600 transition-colors"
                >
                  적용하기
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
