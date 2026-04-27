import React, { useState, useCallback, memo } from 'react';
import { Reorder } from 'framer-motion';
import { Question, QuestionOption } from '../../store/SurveyStore';

// Icons
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const DragIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="5" r="1" fill="currentColor" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="9" cy="19" r="1" fill="currentColor" />
    <circle cx="15" cy="5" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="19" r="1" fill="currentColor" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    <path d="M19 15l.88 2.12L22 18l-2.12.88L19 21l-.88-2.12L16 18l2.12-.88L19 15z" />
    <path d="M5 19l.53 1.47L7 21l-1.47.53L5 23l-.53-1.47L3 21l1.47-.53L5 19z" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Editable Text Input with local state
interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const EditableText = memo(({ value, onChange, placeholder, className, onClick }: EditableTextProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync from parent when not focused
  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={className}
      onClick={onClick}
    />
  );
});

EditableText.displayName = 'EditableText';

// Option Item with local state
interface OptionItemProps {
  option: QuestionOption;
  questionId: string;
  questionType: string;
  isSelected: boolean;
  canDelete: boolean;
  onUpdate: (optionId: string, text: string) => void;
  onDelete: (optionId: string) => void;
}

const OptionItem = memo(({ option, questionId, questionType, isSelected, canDelete, onUpdate, onDelete }: OptionItemProps) => {
  const [localText, setLocalText] = useState(option.text);
  const [isFocused, setIsFocused] = useState(false);

  // Sync from parent when not focused
  React.useEffect(() => {
    if (!isFocused) {
      setLocalText(option.text);
    }
  }, [option.text, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalText(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localText !== option.text) {
      onUpdate(option.id, localText);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className={`w-5 h-5 border-2 border-border flex-shrink-0 ${
        questionType === 'single_choice' ? 'rounded-full' : 'rounded'
      }`} />
      <input
        type="text"
        value={localText}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="flex-1 py-2 bg-transparent border-none focus:outline-none text-text-secondary focus:ring-0"
        placeholder="옵션 입력"
        onClick={(e) => e.stopPropagation()}
      />
      {isSelected && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(option.id);
              }}
              className="p-1 hover:bg-red-50 rounded text-text-tertiary hover:text-red-500"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

OptionItem.displayName = 'OptionItem';

// Dropdown Option Item
interface DropdownOptionItemProps {
  option: QuestionOption;
  index: number;
  isSelected: boolean;
  canDelete: boolean;
  onUpdate: (optionId: string, text: string) => void;
  onDelete: (optionId: string) => void;
}

const DropdownOptionItem = memo(({ option, index, isSelected, canDelete, onUpdate, onDelete }: DropdownOptionItemProps) => {
  const [localText, setLocalText] = useState(option.text);
  const [isFocused, setIsFocused] = useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setLocalText(option.text);
    }
  }, [option.text, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalText(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localText !== option.text) {
      onUpdate(option.id, localText);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-xs text-text-tertiary w-6">{index + 1}.</span>
      <input
        type="text"
        value={localText}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="flex-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500"
        placeholder="옵션 입력"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(option.id);
            }}
            className="p-2 hover:bg-red-50 rounded text-text-tertiary hover:text-red-500"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
});

DropdownOptionItem.displayName = 'DropdownOptionItem';

// Main Question Card Component
interface QuestionCardProps {
  question: Question;
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  cardStyle: 'bordered' | 'filled' | 'minimal';
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onAddOption: (id: string) => void;
  onUpdateOption: (questionId: string, optionId: string, text: string) => void;
  onDeleteOption: (questionId: string, optionId: string) => void;
  onRemoveImage: (questionId: string, imageIndex: number) => void;
  onOpenAI: (id: string) => void;
  onUploadImage: (id: string) => void;
}

const QuestionCard = memo(({
  question,
  index,
  isSelected,
  isFirst,
  isLast,
  cardStyle,
  onSelect,
  onUpdate,
  onDelete,
  onCopy,
  onMove,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onRemoveImage,
  onOpenAI,
  onUploadImage,
}: QuestionCardProps) => {
  const hasSelectOptions = ['single_choice', 'multiple_choice', 'dropdown'].includes(question.type);

  const handleLabelChange = useCallback((newLabel: string) => {
    onUpdate(question.id, { label: newLabel });
  }, [question.id, onUpdate]);

  const handleOptionUpdate = useCallback((optionId: string, text: string) => {
    onUpdateOption(question.id, optionId, text);
  }, [question.id, onUpdateOption]);

  const handleOptionDelete = useCallback((optionId: string) => {
    onDeleteOption(question.id, optionId);
  }, [question.id, onDeleteOption]);

  return (
    <Reorder.Item
      value={question}
      onClick={() => onSelect(question.id)}
      className={`bg-white rounded-xl shadow-card cursor-pointer transition-all ${
        cardStyle === 'filled' ? 'bg-secondary-50' : ''
      } ${cardStyle === 'minimal' ? 'shadow-none border-b border-border-light rounded-none' : ''} ${
        isSelected
          ? 'ring-2 ring-primary-500 shadow-card-hover'
          : 'hover:shadow-card-hover'
      }`}
    >
      {/* Question Images */}
      {question.imageUrls && question.imageUrls.length > 0 && (
        <div className="flex gap-2 p-3 pb-0 overflow-x-auto">
          {question.imageUrls.map((url, imgIndex) => (
            <div key={imgIndex} className="relative flex-shrink-0">
              <img src={url} alt={`Question image ${imgIndex + 1}`} className="w-32 h-24 object-cover rounded-lg" />
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(question.id, imgIndex);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary">
              <DragIcon />
            </div>
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              Q{index + 1}
            </span>
            {question.required && (
              <span className="text-xs text-red-500 font-medium">필수</span>
            )}
          </div>
          
          {isSelected && (
            <div className="flex items-center gap-1">
              {/* AI Button for ALL question types */}
              {question.type !== 'section_divider' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAI(question.id);
                  }}
                  className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-amber-500 hover:text-amber-600"
                  title="AI로 질문 생성"
                >
                  <SparkleIcon />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadImage(question.id);
                }}
                className="p-2 hover:bg-primary-50 rounded-lg transition-colors text-text-tertiary hover:text-primary-600"
                title="이미지 추가"
              >
                <ImageIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(question.id, 'up');
                }}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-text-tertiary hover:text-text-secondary disabled:opacity-30"
                disabled={isFirst}
              >
                <ChevronUpIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(question.id, 'down');
                }}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-text-tertiary hover:text-text-secondary disabled:opacity-30"
                disabled={isLast}
              >
                <ChevronDownIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(question.id);
                }}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-text-tertiary hover:text-text-secondary"
              >
                <CopyIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(question.id);
                }}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-text-tertiary hover:text-red-500"
              >
                <TrashIcon />
              </button>
            </div>
          )}
        </div>

        {/* Question Label */}
        {question.type === 'section_divider' ? (
          <EditableText
            value={question.label}
            onChange={handleLabelChange}
            placeholder="섹션 제목"
            className="w-full text-lg font-bold text-text-primary bg-transparent border-none focus:outline-none placeholder-text-tertiary border-b-2 border-primary-300 pb-2"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <EditableText
            value={question.label}
            onChange={handleLabelChange}
            placeholder="질문을 입력하세요"
            className="w-full font-medium text-text-primary bg-transparent border-none focus:outline-none placeholder-text-tertiary mb-1"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Question Input Preview */}
        {(question.type === 'short_text' || question.type === 'email' || question.type === 'number') && (
          <input
            type="text"
            placeholder={question.placeholder || '답변을 입력하세요'}
            disabled
            className="w-full px-4 py-3 bg-secondary-50 border border-border-light rounded-lg text-text-tertiary mt-3"
          />
        )}

        {question.type === 'long_text' && (
          <textarea
            placeholder={question.placeholder || '답변을 입력하세요'}
            disabled
            className="w-full px-4 py-3 bg-secondary-50 border border-border-light rounded-lg text-text-tertiary resize-none mt-3"
            rows={3}
          />
        )}

        {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
          <div className="space-y-2 mt-3">
            {question.options.map((option) => (
              <OptionItem
                key={option.id}
                option={option}
                questionId={question.id}
                questionType={question.type}
                isSelected={isSelected}
                canDelete={question.options!.length > 1}
                onUpdate={handleOptionUpdate}
                onDelete={handleOptionDelete}
              />
            ))}
            {isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddOption(question.id);
                }}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mt-2 py-2"
              >
                <PlusIcon /> 옵션 추가
              </button>
            )}
          </div>
        )}

        {question.type === 'dropdown' && question.options && (
          <div className="mt-3">
            <select disabled className="w-full px-4 py-3 bg-secondary-50 border border-border-light rounded-lg text-text-tertiary">
              <option>선택하세요</option>
              {question.options.map((opt) => (
                <option key={opt.id}>{opt.text}</option>
              ))}
            </select>
            {isSelected && (
              <div className="mt-3 space-y-2">
                {question.options.map((option, optIndex) => (
                  <DropdownOptionItem
                    key={option.id}
                    option={option}
                    index={optIndex}
                    isSelected={isSelected}
                    canDelete={question.options!.length > 1}
                    onUpdate={handleOptionUpdate}
                    onDelete={handleOptionDelete}
                  />
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddOption(question.id);
                  }}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <PlusIcon /> 옵션 추가
                </button>
              </div>
            )}
          </div>
        )}

        {question.type === 'rating' && (
          <div className="flex gap-2 mt-3">
            {Array.from({ length: question.ratingMax || 5 }).map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-lg border-2 border-border flex items-center justify-center text-text-tertiary hover:border-primary-300 hover:text-primary-500 transition-colors">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {question.type === 'date' && (
          <input
            type="date"
            disabled
            className="px-4 py-3 bg-secondary-50 border border-border-light rounded-lg text-text-tertiary mt-3"
          />
        )}
      </div>
    </Reorder.Item>
  );
});

QuestionCard.displayName = 'QuestionCard';

export default QuestionCard;
