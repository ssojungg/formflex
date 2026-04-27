import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useSurveyStore, Question, QuestionType, QuestionOption } from '../../store/SurveyStore';
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

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const DesktopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// Question type configs
const QUESTION_TYPES: { type: QuestionType; label: string; category: 'input' | 'select' | 'other'; icon: React.FC }[] = [
  { type: 'short_text', label: '단답형', category: 'input', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg> },
  { type: 'email', label: '이메일', category: 'input', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
  { type: 'long_text', label: '장문형', category: 'input', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg> },
  { type: 'number', label: '숫자 입력', category: 'input', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 17h6"/><path d="M4 17V7"/><path d="M14 7l2 10"/><path d="M18 7l-2 10"/><path d="M14 12h4"/></svg> },
  { type: 'single_choice', label: '단일 선택', category: 'select', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg> },
  { type: 'multiple_choice', label: '복수 선택', category: 'select', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><polyline points="9 11 12 14 22 4"/></svg> },
  { type: 'dropdown', label: '드롭다운', category: 'select', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg> },
  { type: 'rating', label: '별점', category: 'select', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { type: 'date', label: '날짜 선택', category: 'other', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { type: 'section_divider', label: '섹션 구분선', category: 'other', icon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/></svg> },
];

const THEME_COLORS = ['#6B8E6B', '#5B9BD5', '#ED7D31', '#9E5EB8', '#70AD47', '#FFC000', '#4472C4', '#C00000'];
const FONT_FAMILIES = [
  { value: 'Pretendard', label: 'Pretendard (기본)' },
  { value: 'Noto Sans KR', label: 'Noto Sans KR' },
  { value: 'Spoqa Han Sans Neo', label: 'Spoqa Han Sans Neo' },
  { value: 'IBM Plex Sans KR', label: 'IBM Plex Sans KR' },
];
const CARD_STYLES = [
  { value: 'bordered', label: '테두리' },
  { value: 'filled', label: '채우기' },
  { value: 'minimal', label: '미니멀' },
];

function SurveyEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMobile, isTablet } = useResponsive();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  
  const surveyId = searchParams.get('id');
  const getSurveyById = useSurveyStore((state) => state.getSurveyById);
  const addSurvey = useSurveyStore((state) => state.addSurvey);
  const updateSurvey = useSurveyStore((state) => state.updateSurvey);
  const publishSurvey = useSurveyStore((state) => state.publishSurvey);
  
  const existingSurvey = surveyId ? getSurveyById(surveyId) : undefined;
  
  // Survey state
  const [title, setTitle] = useState(existingSurvey?.title || '새 설문조사');
  const [description, setDescription] = useState(existingSurvey?.description || '');
  const [questions, setQuestions] = useState<Question[]>(existingSurvey?.questions || []);
  const [themeColor, setThemeColor] = useState(existingSurvey?.themeColor || '#6B8E6B');
  const [fontFamily, setFontFamily] = useState(existingSurvey?.fontFamily || 'Pretendard');
  const [cardStyle, setCardStyle] = useState<'bordered' | 'filled' | 'minimal'>(existingSurvey?.cardStyle || 'bordered');
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(existingSurvey?.coverImageUrl);
  const [isPublic, setIsPublic] = useState(existingSurvey?.isPublic ?? true);
  const [deadline, setDeadline] = useState<string>(existingSurvey?.deadline ? new Date(existingSurvey.deadline).toISOString().split('T')[0] : '');
  const [hashtags, setHashtags] = useState<string[]>(existingSurvey?.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState('');
  
  // Auto email settings
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(false);
  const [targetResponseCount, setTargetResponseCount] = useState(100);
  const [notificationEmail, setNotificationEmail] = useState('');
  
  // UI state
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'questions' | 'preview' | 'properties'>('preview');
  const [activeTab, setActiveTab] = useState<'components' | 'style'>('components');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTargetQuestionId, setAiTargetQuestionId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai'; content: string; options?: string[]}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [draggedType, setDraggedType] = useState<QuestionType | null>(null);
  const [uploadingImageForQuestion, setUploadingImageForQuestion] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-select first question
  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions, selectedQuestionId]);

  const generateId = () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addQuestion = (type: QuestionType, index?: number) => {
    const defaultLabels: Record<QuestionType, string> = {
      short_text: '짧은 답변을 입력하세요',
      long_text: '자세한 답변을 입력하세요',
      email: '이메일 주소를 입력하세요',
      number: '숫자를 입력하세요',
      single_choice: '하나를 선택하세요',
      multiple_choice: '해당하는 것을 모두 선택하세요',
      dropdown: '목록에서 선택하세요',
      rating: '만족도를 평가해주세요',
      date: '날짜를 선택하세요',
      section_divider: '섹션 제목',
    };

    const newQuestion: Question = {
      id: generateId(),
      type,
      label: defaultLabels[type] || '',
      placeholder: '',
      required: false,
      options: ['single_choice', 'multiple_choice', 'dropdown'].includes(type)
        ? [
            { id: `opt-${Date.now()}-1`, text: '옵션 1' },
            { id: `opt-${Date.now()}-2`, text: '옵션 2' },
            { id: `opt-${Date.now()}-3`, text: '옵션 3' },
          ]
        : undefined,
      ratingMax: type === 'rating' ? 5 : undefined,
      imageUrls: [],
    };

    if (index !== undefined) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 0, newQuestion);
      setQuestions(newQuestions);
    } else {
      setQuestions([...questions, newQuestion]);
    }
    setSelectedQuestionId(newQuestion.id);
    
    if (isMobile || isTablet) {
      setActivePanel('preview');
      setSidebarOpen(false);
    }
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map((q) => q.id === questionId ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (questionId: string) => {
    const index = questions.findIndex((q) => q.id === questionId);
    const newQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(newQuestions);
    if (selectedQuestionId === questionId) {
      if (newQuestions.length > 0) {
        const newIndex = Math.min(index, newQuestions.length - 1);
        setSelectedQuestionId(newQuestions[newIndex]?.id || null);
      } else {
        setSelectedQuestionId(null);
      }
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
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId || !q.options) return q;
      return {
        ...q,
        options: q.options.map(o => o.id === optionId ? { ...o, text } : o),
      };
    }));
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

  // Image upload handlers
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuestionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !uploadingImageForQuestion) return;

    const question = questions.find((q) => q.id === uploadingImageForQuestion);
    if (!question) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestions(prev => prev.map(q => {
          if (q.id !== uploadingImageForQuestion) return q;
          return {
            ...q,
            imageUrls: [...(q.imageUrls || []), reader.result as string],
          };
        }));
      };
      reader.readAsDataURL(file);
    });

    setUploadingImageForQuestion(null);
    if (questionImageInputRef.current) {
      questionImageInputRef.current.value = '';
    }
  };

  const removeQuestionImage = (questionId: string, imageIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.imageUrls) return;

    updateQuestion(questionId, {
      imageUrls: question.imageUrls.filter((_, i) => i !== imageIndex),
    });
  };

  const handleSave = () => {
    const surveyData = {
      title,
      description,
      questions,
      themeColor,
      fontFamily,
      cardStyle,
      coverImageUrl,
      isPublic,
      deadline: deadline ? new Date(deadline) : undefined,
      hashtags,
    };

    if (existingSurvey) {
      updateSurvey(existingSurvey.id, surveyData);
    } else {
      const newSurvey = addSurvey({
        ...surveyData,
        status: 'draft',
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

  // AI Generation for specific question
  const openAIForQuestion = (questionId: string) => {
    setAiTargetQuestionId(questionId);
    setAiMessages([]);
    setAiPrompt('');
    setShowAIModal(true);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    // Add user message
    setAiMessages(prev => [...prev, { role: 'user', content: aiPrompt }]);
    setIsGenerating(true);
    
    const currentPrompt = aiPrompt;
    setAiPrompt('');
    
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate mock options based on prompt
    const mockOptions = [
      '트와이스 모모',
      '블랙핑크 리사',
      '아이브 안유진',
      '에스파 카리나',
      '르세라핌 카즈하',
    ];
    
    setAiMessages(prev => [...prev, { 
      role: 'ai', 
      content: '여자 아이돌 춤신춤왕에 대한 선택지를 생성했어요!',
      options: mockOptions 
    }]);
    
    setIsGenerating(false);
  };

  const applyAIOptions = (options: string[]) => {
    if (!aiTargetQuestionId) return;
    
    const newOptions: QuestionOption[] = options.map((text, i) => ({
      id: `opt-${Date.now()}-${i}`,
      text,
    }));
    
    updateQuestion(aiTargetQuestionId, { options: newOptions });
    setShowAIModal(false);
    setAiTargetQuestionId(null);
    setAiMessages([]);
  };

  // Drag and drop handlers
  const handleDragStart = (type: QuestionType) => {
    setDraggedType(type);
  };

  const handleDragEnd = () => {
    setDraggedType(null);
  };

  const handleDrop = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    if (draggedType) {
      addQuestion(draggedType, index);
      setDraggedType(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  // Component Panel
  const ComponentPanel = () => (
    <div className="h-full overflow-y-auto">
      {/* Tabs */}
      <div className="flex border-b border-border-light sticky top-0 bg-white z-10">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'components' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-text-tertiary'
          }`}
        >
          컴포넌트
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'style' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-text-tertiary'
          }`}
        >
          스타일
        </button>
      </div>

      {activeTab === 'components' ? (
        <div className="p-4 space-y-5">
          {/* Input types */}
          <div>
            <h3 className="font-medium text-text-primary mb-3 text-sm">입력</h3>
            <div className="space-y-2">
              {QUESTION_TYPES.filter((t) => t.category === 'input').map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  draggable
                  onDragStart={() => handleDragStart(type)}
                  onDragEnd={handleDragEnd}
                  onClick={() => addQuestion(type)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl border border-border-light hover:border-primary-300 hover:bg-primary-50 transition-colors text-left cursor-grab active:cursor-grabbing"
                >
                  <span className="text-primary-600"><Icon /></span>
                  <span className="text-sm text-text-secondary">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Select types */}
          <div>
            <h3 className="font-medium text-text-primary mb-3 text-sm flex items-center gap-2">
              선택형
              <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">이미지 추가 가능</span>
            </h3>
            <div className="space-y-2">
              {QUESTION_TYPES.filter((t) => t.category === 'select').map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  draggable
                  onDragStart={() => handleDragStart(type)}
                  onDragEnd={handleDragEnd}
                  onClick={() => addQuestion(type)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl border border-border-light hover:border-primary-300 hover:bg-primary-50 transition-colors text-left cursor-grab active:cursor-grabbing"
                >
                  <span className="text-primary-600"><Icon /></span>
                  <span className="text-sm text-text-secondary">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Other types */}
          <div>
            <h3 className="font-medium text-text-primary mb-3 text-sm">기타</h3>
            <div className="space-y-2">
              {QUESTION_TYPES.filter((t) => t.category === 'other').map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  draggable
                  onDragStart={() => handleDragStart(type)}
                  onDragEnd={handleDragEnd}
                  onClick={() => addQuestion(type)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl border border-border-light hover:border-primary-300 hover:bg-primary-50 transition-colors text-left cursor-grab active:cursor-grabbing"
                >
                  <span className="text-primary-600"><Icon /></span>
                  <span className="text-sm text-text-secondary">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-800">
              <strong>AI로 선택지 생성:</strong> 선택형 질문 카드의 <SparkleIcon /> 아이콘을 클릭하면 AI가 선택지를 자동으로 생성해드립니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-5">
          {/* Theme Colors */}
          <div>
            <h3 className="font-medium text-text-primary mb-3 text-sm">테마 색상</h3>
            <div className="flex flex-wrap gap-2">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setThemeColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    themeColor === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div>
            <h3 className="font-medium text-text-primary mb-3 text-sm">글꼴</h3>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>
          </div>

          {/* Card Style */}
          <div>
            <h3 className="font-medium text-text-primary mb-3 text-sm">질문 카드 스타일</h3>
            <div className="grid grid-cols-3 gap-2">
              {CARD_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setCardStyle(style.value as 'bordered' | 'filled' | 'minimal')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    cardStyle === style.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-50 text-text-secondary hover:bg-secondary-100'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <h3 className="font-medium text-text-primary mb-3 text-sm">커버 이미지</h3>
            {coverImageUrl ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={coverImageUrl} alt="Cover" className="w-full h-32 object-cover" />
                <button
                  onClick={() => setCoverImageUrl(undefined)}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <CloseIcon />
                </button>
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-border-light rounded-xl text-text-tertiary hover:border-primary-300 hover:text-primary-600 transition-colors flex flex-col items-center gap-2"
              >
                <ImageIcon />
                <span className="text-sm">이미지 업로드</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Question Card Component
  const QuestionCard = ({ question, index }: { question: Question; index: number }) => {
    const isSelected = selectedQuestionId === question.id;
    const hasSelectOptions = ['single_choice', 'multiple_choice', 'dropdown'].includes(question.type);

    return (
      <Reorder.Item
        key={question.id}
        value={question}
        onClick={() => setSelectedQuestionId(question.id)}
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
                      removeQuestionImage(question.id, imgIndex);
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
                {/* AI Button for select types */}
                {hasSelectOptions && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAIForQuestion(question.id);
                    }}
                    className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-amber-500 hover:text-amber-600"
                    title="AI로 선택지 생성"
                  >
                    <SparkleIcon />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadingImageForQuestion(question.id);
                    questionImageInputRef.current?.click();
                  }}
                  className="p-2 hover:bg-primary-50 rounded-lg transition-colors text-text-tertiary hover:text-primary-600"
                  title="이미지 추가"
                >
                  <ImageIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveQuestion(question.id, 'up');
                  }}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-text-tertiary hover:text-text-secondary disabled:opacity-30"
                  disabled={index === 0}
                >
                  <ChevronUpIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveQuestion(question.id, 'down');
                  }}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-text-tertiary hover:text-text-secondary disabled:opacity-30"
                  disabled={index === questions.length - 1}
                >
                  <ChevronDownIcon />
                </button>
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

          {/* Question Label */}
          {question.type === 'section_divider' ? (
            <input
              type="text"
              value={question.label}
              onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
              placeholder="섹션 제목"
              className="w-full text-lg font-bold text-text-primary bg-transparent border-none focus:outline-none placeholder-text-tertiary border-b-2 border-primary-300 pb-2"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <input
              type="text"
              value={question.label}
              onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
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
              {question.options.map((option, optIndex) => (
                <div key={option.id} className="flex items-center gap-3 group">
                  <div className={`w-5 h-5 border-2 border-border flex-shrink-0 ${
                    question.type === 'single_choice' ? 'rounded-full' : 'rounded'
                  }`} />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                    className="flex-1 py-2 bg-transparent border-none focus:outline-none text-text-secondary focus:ring-0"
                    placeholder="옵션 입력"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {isSelected && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {question.options!.length > 1 && (
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
                  )}
                </div>
              ))}
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addOption(question.id);
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
                    <div key={option.id} className="flex items-center gap-2 group">
                      <span className="text-xs text-text-tertiary w-6">{optIndex + 1}.</span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                        className="flex-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500"
                        placeholder="옵션 입력"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
  };

  // Preview Panel
  const PreviewPanel = () => (
    <div 
      className="h-full overflow-y-auto bg-background-secondary p-4 md:p-8"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, questions.length)}
    >
      <div className="max-w-2xl mx-auto" style={{ fontFamily }}>
        {/* Header / Cover */}
        <div 
          onClick={() => coverInputRef.current?.click()}
          className="rounded-xl overflow-hidden mb-6 cursor-pointer group relative"
          style={{ 
            background: coverImageUrl 
              ? `url(${coverImageUrl}) center/cover` 
              : `linear-gradient(135deg, ${themeColor}30 0%, ${themeColor}50 100%)` 
          }}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white font-medium text-sm bg-black/50 px-4 py-2 rounded-full transition-opacity">
              커버 이미지 변경
            </span>
          </div>
          <div className="p-6 md:p-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="설문 제목을 입력하세요"
              className="w-full text-xl md:text-2xl font-bold bg-transparent border-none focus:outline-none text-text-primary placeholder-text-tertiary"
              onClick={(e) => e.stopPropagation()}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설문에 대한 간단한 설명을 입력하세요"
              className="w-full mt-3 text-sm bg-transparent border-none focus:outline-none text-text-secondary placeholder-text-tertiary resize-none"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Questions */}
        <Reorder.Group axis="y" values={questions} onReorder={setQuestions} className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard key={question.id} question={question} index={index} />
          ))}
        </Reorder.Group>

        {/* Drop zone indicator */}
        {draggedType && (
          <div 
            className="mt-4 py-8 border-2 border-dashed border-primary-400 rounded-xl bg-primary-50 text-primary-600 text-center font-medium"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, questions.length)}
          >
            여기에 놓아서 질문 추가
          </div>
        )}

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
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {selectedQuestion ? (
          <>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">속성</h3>
                <span className="text-xs px-2 py-1 bg-secondary-100 rounded text-text-tertiary">
                  {QUESTION_TYPES.find((t) => t.type === selectedQuestion.type)?.label}
                </span>
              </div>
              <div className="space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">레이블</label>
                  <input
                    type="text"
                    value={selectedQuestion.label}
                    onChange={(e) => updateQuestion(selectedQuestion.id, { label: e.target.value })}
                    placeholder="질문 내용"
                    className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                
                {/* Placeholder */}
                {['short_text', 'long_text', 'email', 'number'].includes(selectedQuestion.type) && (
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
                )}

                {/* Rating max */}
                {selectedQuestion.type === 'rating' && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">최대 점수</label>
                    <div className="flex gap-2">
                      {[3, 5, 7, 10].map((n) => (
                        <button
                          key={n}
                          onClick={() => updateQuestion(selectedQuestion.id, { ratingMax: n })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            (selectedQuestion.ratingMax || 5) === n
                              ? 'bg-primary-500 text-white'
                              : 'bg-secondary-50 text-text-secondary hover:bg-secondary-100'
                          }`}
                        >
                          {n}점
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required toggle */}
                <div className="flex items-center justify-between py-2">
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
            <p className="mb-2">질문을 선택하면</p>
            <p>속성을 편집할 수 있습니다</p>
          </div>
        )}

        {/* Survey Settings */}
        <div className="border-t border-border-light pt-6">
          <h3 className="font-semibold text-text-primary mb-4">설문 설정</h3>
          
          <div className="space-y-4">
            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                <CalendarIcon />
                마감일
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
              <p className="text-xs text-text-tertiary mt-1">설정된 날짜 이후 응답이 자동으로 마감됩니다</p>
            </div>

            {/* Auto Email Settings */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MailIcon />
                  <span className="text-sm font-medium text-text-primary">자동 이메일 발송</span>
                </div>
                <button
                  onClick={() => setAutoEmailEnabled(!autoEmailEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    autoEmailEnabled ? 'bg-primary-500' : 'bg-secondary-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    autoEmailEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              {autoEmailEnabled && (
                <div className="space-y-3 mt-3">
                  <p className="text-xs text-text-tertiary">설정한 응답 수 달성 시 분석 결과를 이메일로 자동 발송합니다</p>
                  
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">몇 명이 응답하면 이메일을 보낼까요?</label>
                    <div className="flex gap-2 flex-wrap">
                      {[50, 100, 200, 500].map((n) => (
                        <button
                          key={n}
                          onClick={() => setTargetResponseCount(n)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            targetResponseCount === n
                              ? 'bg-primary-500 text-white'
                              : 'bg-white text-text-secondary hover:bg-secondary-100'
                          }`}
                        >
                          {n}명
                        </button>
                      ))}
                      <input
                        type="number"
                        value={targetResponseCount}
                        onChange={(e) => setTargetResponseCount(Number(e.target.value))}
                        className="w-20 px-2 py-1.5 border border-border-light rounded-lg text-xs focus:outline-none focus:border-primary-500"
                        min={1}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">이메일 주소</label>
                    <input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      placeholder="report@example.com"
                      className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:border-primary-500 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-text-secondary block">공개 설문</span>
                <span className="text-xs text-text-tertiary">다른 사용자가 설문을 볼 수 있습니다</span>
              </div>
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

            {/* Hashtags */}
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
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
    </div>
  );

  // Preview Modal with Mobile Frame
  const PreviewModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPreviewModal(false)} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-lg font-semibold text-text-primary">미리보기</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  previewDevice === 'desktop' ? 'bg-white shadow text-text-primary' : 'text-text-tertiary'
                }`}
              >
                <DesktopIcon />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  previewDevice === 'mobile' ? 'bg-white shadow text-text-primary' : 'text-text-tertiary'
                }`}
              >
                <PhoneIcon />
              </button>
            </div>
            <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-secondary-100 rounded-lg">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-secondary-100 p-6 flex items-center justify-center">
          {previewDevice === 'mobile' ? (
            // Mobile Frame
            <div className="relative">
              <div className="w-[375px] h-[667px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-[10px] border-gray-800 relative">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
                
                {/* Screen Content */}
                <div className="h-full overflow-y-auto pt-8">
                  <div className="p-4" style={{ fontFamily }}>
                    <div 
                      className="rounded-xl overflow-hidden mb-4"
                      style={{ 
                        background: coverImageUrl 
                          ? `url(${coverImageUrl}) center/cover` 
                          : `linear-gradient(135deg, ${themeColor}30 0%, ${themeColor}50 100%)` 
                      }}
                    >
                      <div className="p-4">
                        <h1 className="text-lg font-bold text-text-primary">{title || '설문 제목'}</h1>
                        <p className="text-xs text-text-secondary mt-1">{description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {questions.map((question, index) => (
                        <div key={question.id} className="bg-white rounded-lg p-3 shadow-sm border border-border-light">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">Q{index + 1}</span>
                            {question.required && <span className="text-[10px] text-red-500">필수</span>}
                          </div>
                          <p className="text-sm font-medium text-text-primary mb-2">{question.label}</p>
                          
                          {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
                            <div className="space-y-1.5">
                              {question.options.map((opt) => (
                                <div key={opt.id} className="flex items-center gap-2 py-1.5 px-2 bg-secondary-50 rounded text-xs">
                                  <div className={`w-3 h-3 border border-border ${question.type === 'single_choice' ? 'rounded-full' : 'rounded'}`} />
                                  {opt.text}
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === 'rating' && (
                            <div className="flex gap-1">
                              {Array.from({ length: question.ratingMax || 5 }).map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded border border-border flex items-center justify-center text-[10px] text-text-tertiary">
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button className="w-full mt-4 py-3 bg-primary-500 text-white text-sm font-medium rounded-lg">
                      제출하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Desktop Preview
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="max-h-[70vh] overflow-y-auto p-6" style={{ fontFamily }}>
                <div 
                  className="rounded-xl overflow-hidden mb-6"
                  style={{ 
                    background: coverImageUrl 
                      ? `url(${coverImageUrl}) center/cover` 
                      : `linear-gradient(135deg, ${themeColor}30 0%, ${themeColor}50 100%)` 
                  }}
                >
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-text-primary">{title || '설문 제목'}</h1>
                    <p className="text-sm text-text-secondary mt-2">{description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="bg-white rounded-xl p-5 shadow-card border border-border-light">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">Q{index + 1}</span>
                        {question.required && <span className="text-xs text-red-500">필수</span>}
                      </div>
                      <p className="font-medium text-text-primary mb-3">{question.label}</p>
                      
                      {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
                        <div className="space-y-2">
                          {question.options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-3 py-2 px-3 bg-secondary-50 rounded-lg text-sm">
                              <div className={`w-4 h-4 border-2 border-border ${question.type === 'single_choice' ? 'rounded-full' : 'rounded'}`} />
                              {opt.text}
                            </div>
                          ))}
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
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-4 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors">
                  제출하기
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  // AI Chat Modal
  const AIChatModal = () => {
    const targetQuestion = questions.find(q => q.id === aiTargetQuestionId);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAIModal(false)} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-white rounded-2xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                <SparkleIcon />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">AI 선택지 생성</h3>
                {targetQuestion && (
                  <p className="text-xs text-text-tertiary truncate max-w-[250px]">{targetQuestion.label}</p>
                )}
              </div>
            </div>
            <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-secondary-100 rounded-lg">
              <CloseIcon />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <SparkleIcon />
                </div>
                <h4 className="font-medium text-text-primary mb-2">AI에게 선택지 생성을 요청하세요</h4>
                <p className="text-sm text-text-tertiary">
                  예: &quot;여자 아이돌 춤신춤왕에 대해 5개 선택지 만들어줘&quot;
                </p>
              </div>
            )}
            
            {aiMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] bg-primary-500 text-white px-4 py-3 rounded-2xl rounded-br-sm">
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[85%]">
                    <div className="bg-secondary-100 px-4 py-3 rounded-2xl rounded-bl-sm mb-2">
                      <p className="text-sm text-text-primary">{msg.content}</p>
                    </div>
                    {msg.options && (
                      <div className="bg-white border border-border-light rounded-xl p-4 shadow-card">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">생성된 선택지</span>
                        </div>
                        <div className="space-y-2 mb-4">
                          {msg.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 px-3 bg-secondary-50 rounded-lg text-sm">
                              <div className="w-4 h-4 border-2 border-primary-400 rounded-full" />
                              {opt}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => applyAIOptions(msg.options!)}
                            className="flex-1 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                          >
                            적용하기
                          </button>
                          <button
                            onClick={() => {
                              setAiPrompt('다시 생성해줘');
                              handleAIGenerate();
                            }}
                            className="px-4 py-2 border border-border-light text-text-secondary text-sm font-medium rounded-lg hover:bg-secondary-50 transition-colors"
                          >
                            재생성
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-secondary-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-text-tertiary">생성 중...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border-light">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleAIGenerate()}
                placeholder="선택지 생성을 요청해보세요..."
                className="flex-1 px-4 py-3 border border-border-light rounded-xl text-sm focus:outline-none focus:border-primary-500"
                disabled={isGenerating}
              />
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Publish Modal
  const PublishModal = () => (
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
        
        {deadline && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <CalendarIcon />
              마감일: {new Date(deadline).toLocaleDateString('ko-KR')}
            </p>
          </div>
        )}

        {autoEmailEnabled && notificationEmail && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <MailIcon />
              {targetResponseCount}명 응답 시 {notificationEmail}로 알림
            </p>
          </div>
        )}

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
  );

  // Hidden file inputs
  const FileInputs = () => (
    <>
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverImageUpload}
        className="hidden"
      />
      <input
        ref={questionImageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleQuestionImageUpload}
        className="hidden"
      />
    </>
  );

  // Mobile/Tablet Layout
  if (isMobile || isTablet) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <FileInputs />
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/myform')} className="p-2 hover:bg-secondary-100 rounded-lg">
              <ArrowLeftIcon />
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-secondary-100 rounded-lg lg:hidden">
              <MenuIcon />
            </button>
          </div>
          <h1 className="font-semibold text-text-primary truncate flex-1 text-center">{title || '새 설문'}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="p-2 hover:bg-secondary-100 rounded-lg text-text-secondary"
            >
              <PreviewIcon />
            </button>
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

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                  <h2 className="font-semibold text-text-primary">컴포넌트</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-secondary-100 rounded-lg">
                    <CloseIcon />
                  </button>
                </div>
                <ComponentPanel />
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
          {activePanel === 'questions' && <ComponentPanel />}
          {activePanel === 'preview' && <PreviewPanel />}
          {activePanel === 'properties' && <PropertiesPanel />}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {isSaved && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-text-primary text-white text-sm rounded-lg shadow-lg z-50"
            >
              저장되었습니다
            </motion.div>
          )}
        </AnimatePresence>
        {showPublishModal && <PublishModal />}
        {showPreviewModal && <PreviewModal />}
        {showAIModal && <AIChatModal />}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex flex-col h-screen bg-white">
      <FileInputs />
      
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
            onClick={() => setShowPreviewModal(true)}
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
        {/* Left Panel - Components */}
        <div className="w-64 border-r border-border-light">
          <ComponentPanel />
        </div>

        {/* Center - Preview */}
        <div className="flex-1 overflow-hidden">
          <PreviewPanel />
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-border-light">
          <PropertiesPanel />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-text-primary text-white text-sm rounded-lg shadow-lg z-50"
          >
            저장되었습니다
          </motion.div>
        )}
      </AnimatePresence>
      {showPublishModal && <PublishModal />}
      {showPreviewModal && <PreviewModal />}
      {showAIModal && <AIChatModal />}
    </div>
  );
}

export default SurveyEditor;
