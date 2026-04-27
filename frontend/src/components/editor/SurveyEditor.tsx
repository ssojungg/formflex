import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyStore, Survey, Question, QuestionType, QuestionOption } from '../../store/SurveyStore';
import { useResponsive } from '../../hooks/useResponsive';

// Icons
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const PreviewIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PublishIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

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

const MoveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="5 9 2 12 5 15" />
    <polyline points="9 5 12 2 15 5" />
    <polyline points="15 19 12 22 9 19" />
    <polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Question type icons
const TextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
);

const SingleChoiceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

const MultiChoiceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <polyline points="9 11 12 14 22 4" />
  </svg>
);

const DropdownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const RatingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.FC }[] = [
  { type: 'short_text', label: '단답형', icon: TextIcon },
  { type: 'long_text', label: '장문형', icon: TextIcon },
  { type: 'email', label: '이메일', icon: TextIcon },
  { type: 'number', label: '숫자 입력', icon: TextIcon },
  { type: 'single_choice', label: '단일 선택', icon: SingleChoiceIcon },
  { type: 'multiple_choice', label: '복수 선택', icon: MultiChoiceIcon },
  { type: 'dropdown', label: '드롭다운', icon: DropdownIcon },
  { type: 'rating', label: '별점', icon: RatingIcon },
  { type: 'date', label: '날짜 선택', icon: TextIcon },
];

const THEME_COLORS = ['#6B8E6B', '#5B9BD5', '#ED7D31', '#9E5EB8', '#70AD47', '#FFC000'];

function SurveyEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMobile, isTablet } = useResponsive();
  
  const surveyId = searchParams.get('id');
  const getSurveyById = useSurveyStore((state) => state.getSurveyById);
  const addSurvey = useSurveyStore((state) => state.addSurvey);
  const updateSurvey = useSurveyStore((state) => state.updateSurvey);
  const publishSurvey = useSurveyStore((state) => state.publishSurvey);
  
  const existingSurvey = surveyId ? getSurveyById(surveyId) : undefined;
  
  const [title, setTitle] = useState(existingSurvey?.title || '새 설문조사');
  const [description, setDescription] = useState(existingSurvey?.description || '');
  const [questions, setQuestions] = useState<Question[]>(existingSurvey?.questions || []);
  const [themeColor, setThemeColor] = useState(existingSurvey?.themeColor || '#6B8E6B');
  const [isPublic, setIsPublic] = useState(existingSurvey?.isPublic ?? true);
  const [hashtags, setHashtags] = useState<string[]>(existingSurvey?.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState('');
  
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'questions' | 'preview' | 'properties'>('preview');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Auto-select first question
  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions, selectedQuestionId]);

  const generateId = () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: generateId(),
      type,
      label: '',
      placeholder: '',
      required: false,
      options: type === 'single_choice' || type === 'multiple_choice' || type === 'dropdown'
        ? [
            { id: `opt-${Date.now()}-1`, text: '옵션 1' },
            { id: `opt-${Date.now()}-2`, text: '옵션 2' },
            { id: `opt-${Date.now()}-3`, text: '옵션 3' },
          ]
        : undefined,
      ratingMax: type === 'rating' ? 5 : undefined,
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
    
    if (isMobile || isTablet) {
      setActivePanel('preview');
    }
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => q.id === questionId ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(questions.length > 1 ? questions[0].id : null);
    }
  };

  const copyQuestion = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    
    const newQuestion: Question = {
      ...JSON.parse(JSON.stringify(question)),
      id: generateId(),
    };
    const index = questions.findIndex((q) => q.id === questionId);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    setQuestions(newQuestions);
    setSelectedQuestionId(newQuestion.id);
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const index = questions.findIndex((q) => q.id === questionId);
    if (direction === 'up' && index > 0) {
      const newQuestions = [...questions];
      [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
      setQuestions(newQuestions);
    } else if (direction === 'down' && index < questions.length - 1) {
      const newQuestions = [...questions];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      setQuestions(newQuestions);
    }
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.options) return;
    
    updateQuestion(questionId, {
      options: [...question.options, { id: `opt-${Date.now()}`, text: `옵션 ${question.options.length + 1}` }],
    });
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.options) return;
    
    updateQuestion(questionId, {
      options: question.options.map((o) => o.id === optionId ? { ...o, text } : o),
    });
  };

  const deleteOption = (questionId: string, optionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.options || question.options.length <= 1) return;
    
    updateQuestion(questionId, {
      options: question.options.filter((o) => o.id !== optionId),
    });
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
    }
    setHashtagInput('');
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleSave = () => {
    if (existingSurvey) {
      updateSurvey(existingSurvey.id, {
        title,
        description,
        questions,
        themeColor,
        isPublic,
        hashtags,
      });
    } else {
      const newSurvey = addSurvey({
        title,
        description,
        questions,
        themeColor,
        status: 'draft',
        isPublic,
        hashtags,
      });
      navigate(`/create?id=${newSurvey.id}`, { replace: true });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePublish = () => {
    handleSave();
    if (existingSurvey) {
      publishSurvey(existingSurvey.id);
    }
    setShowPublishModal(false);
    navigate('/myform');
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  // Question Panel
  const QuestionPanel = () => (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-medium text-text-primary mb-3">입력 유형</h3>
        <div className="grid grid-cols-2 gap-2">
          {QUESTION_TYPES.slice(0, 4).map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => addQuestion(type)}
              className="flex items-center gap-2 p-3 rounded-xl border border-border-light hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <span className="text-primary-600"><Icon /></span>
              <span className="text-sm text-text-secondary">{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium text-text-primary mb-3">선택 유형</h3>
        <div className="grid grid-cols-2 gap-2">
          {QUESTION_TYPES.slice(4, 8).map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => addQuestion(type)}
              className="flex items-center gap-2 p-3 rounded-xl border border-border-light hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <span className="text-primary-600"><Icon /></span>
              <span className="text-sm text-text-secondary">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-text-primary mb-3">테마 색상</h3>
        <div className="flex gap-2 flex-wrap">
          {THEME_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setThemeColor(color)}
              className={`w-8 h-8 rounded-full transition-all ${
                themeColor === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Preview Panel
  const PreviewPanel = () => (
    <div className="h-full overflow-y-auto bg-background-secondary p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div 
          className="rounded-xl overflow-hidden mb-6"
          style={{ background: `linear-gradient(135deg, ${themeColor}30 0%, ${themeColor}50 100%)` }}
        >
          <div className="p-6 md:p-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="설문 제목을 입력하세요"
              className="w-full text-xl md:text-2xl font-bold bg-transparent border-none focus:outline-none text-text-primary placeholder-text-tertiary"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설문에 대한 간단한 설명을 입력하세요"
              className="w-full mt-3 text-sm bg-transparent border-none focus:outline-none text-text-secondary placeholder-text-tertiary resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={() => setSelectedQuestionId(question.id)}
              className={`bg-white rounded-xl p-5 shadow-card cursor-pointer transition-all ${
                selectedQuestionId === question.id
                  ? 'ring-2 ring-primary-500 shadow-card-hover'
                  : 'hover:shadow-card-hover'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                      Q{index + 1}
                    </span>
                    {question.required && (
                      <span className="text-xs text-red-500">필수</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={question.label}
                    onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
                    placeholder="질문을 입력하세요"
                    className="w-full font-medium text-text-primary bg-transparent border-none focus:outline-none placeholder-text-tertiary"
                  />
                </div>
                
                {selectedQuestionId === question.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyQuestion(question.id);
                      }}
                      className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-text-tertiary hover:text-text-secondary"
                    >
                      <CopyIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(question.id);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-text-tertiary hover:text-red-500"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )}
              </div>

              {/* Question Input Preview */}
              {(question.type === 'short_text' || question.type === 'email' || question.type === 'number') && (
                <input
                  type="text"
                  placeholder={question.placeholder || '답변을 입력하세요'}
                  disabled
                  className="w-full px-4 py-3 bg-secondary-50 border border-border-light rounded-lg text-text-tertiary"
                />
              )}

              {question.type === 'long_text' && (
                <textarea
                  placeholder={question.placeholder || '답변을 입력하세요'}
                  disabled
                  className="w-full px-4 py-3 bg-secondary-50 border border-border-light rounded-lg text-text-tertiary resize-none"
                  rows={3}
                />
              )}

              {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <div className={`w-5 h-5 border-2 border-border flex-shrink-0 ${
                        question.type === 'single_choice' ? 'rounded-full' : 'rounded'
                      }`} />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                        className="flex-1 py-2 bg-transparent border-none focus:outline-none text-text-secondary"
                        placeholder="옵션 입력"
                      />
                      {selectedQuestionId === question.id && question.options!.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOption(question.id, option.id);
                          }}
                          className="p-1 hover:bg-red-50 rounded text-text-tertiary hover:text-red-500"
                        >
                          <CloseIcon />
                        </button>
                      )}
                    </div>
                  ))}
                  {selectedQuestionId === question.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addOption(question.id);
                      }}
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mt-2"
                    >
                      <PlusIcon /> 옵션 추가
                    </button>
                  )}
                </div>
              )}

              {question.type === 'dropdown' && question.options && (
                <div>
                  <select disabled className="w-full px-4 py-3 bg-secondary-50 border border-border-light rounded-lg text-text-tertiary">
                    <option>선택하세요</option>
                  </select>
                  {selectedQuestionId === question.id && (
                    <div className="mt-3 space-y-2">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500"
                            placeholder="옵션 입력"
                          />
                          {question.options!.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteOption(question.id, option.id);
                              }}
                              className="p-2 hover:bg-red-50 rounded text-text-tertiary hover:text-red-500"
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addOption(question.id);
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
                <div className="flex gap-2">
                  {Array.from({ length: question.ratingMax || 5 }).map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-lg border-2 border-border flex items-center justify-center text-text-tertiary">
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'date' && (
                <input
                  type="date"
                  disabled
                  className="px-4 py-3 bg-secondary-50 border border-border-light rounded-lg text-text-tertiary"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Question Button */}
        <button
          onClick={() => addQuestion('short_text')}
          className="w-full mt-4 py-4 border-2 border-dashed border-primary-300 rounded-xl text-primary-600 font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon />
          질문 추가
        </button>
      </div>
    </div>
  );

  // Properties Panel
  const PropertiesPanel = () => (
    <div className="p-4 space-y-6">
      {selectedQuestion ? (
        <>
          <div>
            <h3 className="font-semibold text-text-primary mb-4">속성</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">질문 유형</label>
                <p className="text-sm text-text-tertiary">
                  {QUESTION_TYPES.find((t) => t.type === selectedQuestion.type)?.label}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">플레이스홀더</label>
                <input
                  type="text"
                  value={selectedQuestion.placeholder || ''}
                  onChange={(e) => updateQuestion(selectedQuestion.id, { placeholder: e.target.value })}
                  placeholder="입력 안내 문구"
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              {selectedQuestion.type === 'rating' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">최대 점수</label>
                  <select
                    value={selectedQuestion.ratingMax || 5}
                    onChange={(e) => updateQuestion(selectedQuestion.id, { ratingMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  >
                    {[5, 7, 10].map((n) => (
                      <option key={n} value={n}>{n}점</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">필수 응답</span>
                <button
                  onClick={() => updateQuestion(selectedQuestion.id, { required: !selectedQuestion.required })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    selectedQuestion.required ? 'bg-primary-500' : 'bg-secondary-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    selectedQuestion.required ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-text-tertiary">
          질문을 선택하면 속성을 편집할 수 있습니다
        </div>
      )}

      <div className="border-t border-border-light pt-6">
        <h3 className="font-semibold text-text-primary mb-4">설문 설정</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">공개 설문</span>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-primary-500' : 'bg-secondary-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">해시태그</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-600 text-sm rounded"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveHashtag(tag)}
                    className="hover:text-primary-800"
                  >
                    <CloseIcon />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                placeholder="태그 입력"
                className="flex-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={handleAddHashtag}
                className="px-3 py-2 bg-primary-100 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile/Tablet Layout
  if (isMobile || isTablet) {
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
          <button onClick={() => navigate('/myform')} className="p-2 hover:bg-secondary-100 rounded-lg">
            <ArrowLeftIcon />
          </button>
          <h1 className="font-semibold text-text-primary truncate">{title || '새 설문'}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="p-2 hover:bg-secondary-100 rounded-lg text-primary-600"
            >
              <SaveIcon />
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600"
            >
              배포
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-light">
          <button
            onClick={() => setActivePanel('questions')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activePanel === 'questions' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-text-tertiary'
            }`}
          >
            질문 추가
          </button>
          <button
            onClick={() => setActivePanel('preview')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activePanel === 'preview' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-text-tertiary'
            }`}
          >
            미리보기
          </button>
          <button
            onClick={() => setActivePanel('properties')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activePanel === 'properties' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-text-tertiary'
            }`}
          >
            속성
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activePanel === 'questions' && <div className="h-full overflow-y-auto"><QuestionPanel /></div>}
          {activePanel === 'preview' && <PreviewPanel />}
          {activePanel === 'properties' && <div className="h-full overflow-y-auto"><PropertiesPanel /></div>}
        </div>

        {/* Save Toast */}
        <AnimatePresence>
          {isSaved && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-text-primary text-white text-sm rounded-lg shadow-lg"
            >
              저장되었습니다
            </motion.div>
          )}
        </AnimatePresence>

        {/* Publish Modal */}
        {showPublishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowPublishModal(false)} />
            <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">설문 배포하기</h3>
              <p className="text-sm text-text-tertiary mb-6">
                배포하면 다른 사용자들이 이 설문에 참여할 수 있습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-secondary-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  배포하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/myform')} className="p-2 hover:bg-secondary-100 rounded-lg">
            <ArrowLeftIcon />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none text-text-primary"
            placeholder="설문 제목"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 border border-border-light rounded-xl font-medium hover:bg-secondary-50 transition-colors"
          >
            <SaveIcon />
            저장
          </button>
          <button
            onClick={() => navigate(`/responseform?id=${existingSurvey?.id || 'preview'}`)}
            className="flex items-center gap-2 px-4 py-2.5 border border-border-light rounded-xl font-medium hover:bg-secondary-50 transition-colors"
          >
            <PreviewIcon />
            미리보기
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            <PublishIcon />
            배포하기
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Questions */}
        <div className="w-64 border-r border-border-light overflow-y-auto">
          <QuestionPanel />
        </div>

        {/* Center - Preview */}
        <div className="flex-1 overflow-hidden">
          <PreviewPanel />
        </div>

        {/* Right Panel - Properties */}
        <div className="w-72 border-l border-border-light overflow-y-auto">
          <PropertiesPanel />
        </div>
      </div>

      {/* Save Toast */}
      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-text-primary text-white text-sm rounded-lg shadow-lg"
          >
            저장되었습니다
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPublishModal(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">설문 배포하기</h3>
            <p className="text-sm text-text-tertiary mb-6">
              배포하면 다른 사용자들이 이 설문에 참여할 수 있습니다.
              {isPublic ? ' 공개 설문으로 설정되어 있습니다.' : ' 비공개 설문으로 설정되어 있습니다.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-secondary-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <PublishIcon />
                배포하기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default SurveyEditor;
