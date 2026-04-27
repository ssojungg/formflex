import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Question types
export type QuestionType = 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'dropdown' | 'rating' | 'date' | 'email' | 'number';

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: QuestionOption[];
  ratingMax?: number;
  imageUrl?: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  coverImageUrl?: string;
  themeColor: string;
  status: 'draft' | 'active' | 'closed';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  responseCount: number;
  completionRate: number;
  hashtags: string[];
  isTemplate?: boolean;
  templateCategory?: string;
  likes?: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Record<string, string | string[]>;
  submittedAt: Date;
  respondentId?: string;
}

export interface Template {
  id: string;
  surveyId: string;
  title: string;
  description: string;
  category: string;
  authorId: string;
  authorName: string;
  authorVerified: boolean;
  questionCount: number;
  estimatedTime: string;
  likes: number;
  usageCount: number;
  hashtags: string[];
  createdAt: Date;
  coverImageUrl?: string;
}

// Mock initial surveys (public surveys from all users)
const MOCK_PUBLIC_SURVEYS: Survey[] = [
  {
    id: 'survey-1',
    title: '2024 고객 만족도 조사',
    description: '더 나은 서비스를 위해 여러분의 소중한 의견을 들려주세요.',
    questions: [
      { id: 'q1', type: 'rating', label: '전반적인 서비스 만족도를 평가해주세요', required: true, ratingMax: 5 },
      { id: 'q2', type: 'single_choice', label: '저희 서비스를 어떻게 알게 되셨나요?', required: true, options: [
        { id: 'o1', text: '검색 엔진' }, { id: 'o2', text: '소셜 미디어' }, { id: 'o3', text: '지인 추천' }, { id: 'o4', text: '기타' }
      ]},
      { id: 'q3', type: 'long_text', label: '개선이 필요한 부분이 있다면 알려주세요', required: false },
    ],
    themeColor: '#6B8E6B',
    status: 'active',
    isPublic: true,
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-18'),
    authorId: 'user-1',
    authorName: '김민준',
    responseCount: 1284,
    completionRate: 78,
    hashtags: ['고객만족', 'CSAT', '서비스'],
  },
  {
    id: 'survey-2',
    title: '신제품 출시 전 시장 조사',
    description: '새로운 제품 출시를 앞두고 소비자 의견을 수집합니다.',
    questions: [
      { id: 'q1', type: 'single_choice', label: '현재 사용 중인 유사 제품이 있나요?', required: true, options: [
        { id: 'o1', text: '예' }, { id: 'o2', text: '아니오' }
      ]},
      { id: 'q2', type: 'multiple_choice', label: '제품 선택 시 중요하게 생각하는 요소는? (복수 선택)', required: true, options: [
        { id: 'o1', text: '가격' }, { id: 'o2', text: '품질' }, { id: 'o3', text: '디자인' }, { id: 'o4', text: '브랜드' }
      ]},
      { id: 'q3', type: 'number', label: '적정 가격대는 얼마인가요? (원)', required: true },
    ],
    themeColor: '#5B9BD5',
    status: 'active',
    isPublic: true,
    createdAt: new Date('2024-03-17'),
    updatedAt: new Date('2024-03-17'),
    authorId: 'user-2',
    authorName: '이수진',
    responseCount: 876,
    completionRate: 0,
    hashtags: ['시장조사', '신제품', '마케팅'],
  },
  {
    id: 'survey-3',
    title: '직원 만족도 설문 2024',
    description: '더 나은 근무 환경을 위한 직원 만족도 조사입니다.',
    questions: [
      { id: 'q1', type: 'rating', label: '현재 직장 만족도', required: true, ratingMax: 10 },
      { id: 'q2', type: 'single_choice', label: '부서 이동을 원하시나요?', required: true, options: [
        { id: 'o1', text: '예' }, { id: 'o2', text: '아니오' }, { id: 'o3', text: '고민 중' }
      ]},
    ],
    themeColor: '#70AD47',
    status: 'active',
    isPublic: true,
    createdAt: new Date('2024-03-16'),
    updatedAt: new Date('2024-03-16'),
    authorId: 'user-3',
    authorName: '박서연',
    responseCount: 243,
    completionRate: 81,
    hashtags: ['HR', '직원만족', '내부조사'],
  },
  {
    id: 'survey-4',
    title: '브랜드 인지도 설문',
    description: '브랜드 인지도와 이미지 조사',
    questions: [
      { id: 'q1', type: 'single_choice', label: '저희 브랜드를 알고 계셨나요?', required: true, options: [
        { id: 'o1', text: '예' }, { id: 'o2', text: '아니오' }
      ]},
    ],
    themeColor: '#ED7D31',
    status: 'closed',
    isPublic: true,
    createdAt: new Date('2024-01-31'),
    updatedAt: new Date('2024-01-31'),
    authorId: 'user-4',
    authorName: '정하은',
    responseCount: 2451,
    completionRate: 0,
    hashtags: ['브랜드', '마케팅', '인지도'],
  },
  {
    id: 'survey-5',
    title: '이벤트 참가자 피드백',
    description: '이벤트 참가 경험에 대한 피드백을 수집합니다.',
    questions: [
      { id: 'q1', type: 'rating', label: '이벤트 만족도', required: true, ratingMax: 5 },
      { id: 'q2', type: 'long_text', label: '개선점이나 건의사항', required: false },
    ],
    themeColor: '#9E5EB8',
    status: 'closed',
    isPublic: true,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
    authorId: 'user-5',
    authorName: '강민서',
    responseCount: 534,
    completionRate: 0,
    hashtags: ['이벤트', '피드백', '참가자'],
  },
  {
    id: 'survey-6',
    title: '서비스 NPS 조사',
    description: '고객 추천 지수(NPS) 조사입니다.',
    questions: [
      { id: 'q1', type: 'rating', label: '저희 서비스를 주변에 추천할 의향이 얼마나 있으신가요?', required: true, ratingMax: 10 },
      { id: 'q2', type: 'long_text', label: '그 이유를 알려주세요', required: false },
    ],
    themeColor: '#6B8E6B',
    status: 'active',
    isPublic: true,
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-19'),
    authorId: 'user-1',
    authorName: '김민준',
    responseCount: 1102,
    completionRate: 70,
    hashtags: ['NPS', '고객만족', '추천'],
  },
];

// Mock templates
const MOCK_TEMPLATES: Template[] = [
  {
    id: 'template-1',
    surveyId: 'survey-1',
    title: '고객 만족도 (CSAT)',
    description: '고객 경험을 측정하고 개선 포인트를 찾기 위한 표준 CSAT 설문지',
    category: '고객 만족',
    authorId: 'user-1',
    authorName: '김민준',
    authorVerified: true,
    questionCount: 10,
    estimatedTime: '3분',
    likes: 342,
    usageCount: 1250,
    hashtags: ['CSAT', '고객만족', '서비스'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'template-2',
    surveyId: 'survey-template-2',
    title: 'NPS 추천 지수 조사',
    description: '순추천 고객 지수를 측정하여 충성도를 파악하는 설문',
    category: '고객 만족',
    authorId: 'user-6',
    authorName: '이수진',
    authorVerified: true,
    questionCount: 5,
    estimatedTime: '1분',
    likes: 218,
    usageCount: 890,
    hashtags: ['NPS', '충성도', '추천'],
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'template-3',
    surveyId: 'survey-template-3',
    title: '신제품 시장 조사',
    description: '신제품 출시 전 시장 반응과 소비자 니즈를 파악하는 설문',
    category: '시장 조사',
    authorId: 'user-7',
    authorName: '박서연',
    authorVerified: true,
    questionCount: 15,
    estimatedTime: '5분',
    likes: 156,
    usageCount: 456,
    hashtags: ['시장조사', '신제품', '소비자'],
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'template-4',
    surveyId: 'survey-template-4',
    title: '이벤트 피드백 수집',
    description: '행사 또는 웨비나 참가자의 만족도와 개선사항을 수집',
    category: '이벤트',
    authorId: 'user-8',
    authorName: '강민서',
    authorVerified: true,
    questionCount: 8,
    estimatedTime: '2분',
    likes: 203,
    usageCount: 678,
    hashtags: ['이벤트', '피드백', '웨비나'],
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'template-5',
    surveyId: 'survey-template-5',
    title: 'UX 사용성 테스트',
    description: '앱 또는 웹사이트의 사용성을 평가하기 위한 전문 UX 설문',
    category: 'UX 리서치',
    authorId: 'user-9',
    authorName: '최지훈',
    authorVerified: true,
    questionCount: 12,
    estimatedTime: '4분',
    likes: 89,
    usageCount: 234,
    hashtags: ['UX', '사용성', 'UI'],
    createdAt: new Date('2024-03-05'),
  },
  {
    id: 'template-6',
    surveyId: 'survey-template-6',
    title: '직원 참여도 조사',
    description: '팀원의 업무 만족도와 조직 문화를 측정하는 HR 설문',
    category: '직원 설문',
    authorId: 'user-10',
    authorName: '정하은',
    authorVerified: false,
    questionCount: 20,
    estimatedTime: '7분',
    likes: 67,
    usageCount: 189,
    hashtags: ['HR', '직원만족', '조직문화'],
    createdAt: new Date('2024-03-08'),
  },
];

interface SurveyStore {
  // All public surveys (from all users)
  publicSurveys: Survey[];
  // My surveys (created by current user)
  mySurveys: Survey[];
  // Templates
  templates: Template[];
  // Responses
  responses: SurveyResponse[];
  // Liked templates
  likedTemplates: string[];
  // Saved templates
  savedTemplates: string[];
  
  // Current user ID (mock)
  currentUserId: string;
  currentUserName: string;
  
  // Actions
  addSurvey: (survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName' | 'responseCount' | 'completionRate'>) => Survey;
  updateSurvey: (id: string, updates: Partial<Survey>) => void;
  deleteSurvey: (id: string) => void;
  getSurveyById: (id: string) => Survey | undefined;
  
  // Publish survey to public
  publishSurvey: (id: string) => void;
  closeSurvey: (id: string) => void;
  
  // Template actions
  publishAsTemplate: (surveyId: string, category: string) => void;
  copyTemplate: (templateId: string) => Survey;
  toggleLikeTemplate: (templateId: string) => void;
  toggleSaveTemplate: (templateId: string) => void;
  
  // Response actions
  submitResponse: (surveyId: string, answers: Record<string, string | string[]>) => void;
  getResponsesBySurveyId: (surveyId: string) => SurveyResponse[];
}

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set, get) => ({
      publicSurveys: MOCK_PUBLIC_SURVEYS,
      mySurveys: [],
      templates: MOCK_TEMPLATES,
      responses: [],
      likedTemplates: [],
      savedTemplates: [],
      currentUserId: 'current-user',
      currentUserName: 'Jin Soo Park',
      
      addSurvey: (surveyData) => {
        const newSurvey: Survey = {
          ...surveyData,
          id: `survey-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: get().currentUserId,
          authorName: get().currentUserName,
          responseCount: 0,
          completionRate: 0,
        };
        
        set((state) => ({
          mySurveys: [newSurvey, ...state.mySurveys],
          // If public, also add to public surveys
          publicSurveys: newSurvey.isPublic 
            ? [newSurvey, ...state.publicSurveys]
            : state.publicSurveys,
        }));
        
        return newSurvey;
      },
      
      updateSurvey: (id, updates) => {
        set((state) => ({
          mySurveys: state.mySurveys.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
          publicSurveys: state.publicSurveys.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
        }));
      },
      
      deleteSurvey: (id) => {
        set((state) => ({
          mySurveys: state.mySurveys.filter((s) => s.id !== id),
          publicSurveys: state.publicSurveys.filter((s) => s.id !== id),
        }));
      },
      
      getSurveyById: (id) => {
        const state = get();
        return state.mySurveys.find((s) => s.id === id) || 
               state.publicSurveys.find((s) => s.id === id);
      },
      
      publishSurvey: (id) => {
        set((state) => {
          const survey = state.mySurveys.find((s) => s.id === id);
          if (!survey) return state;
          
          const updatedSurvey = { ...survey, status: 'active' as const, isPublic: true };
          
          return {
            mySurveys: state.mySurveys.map((s) =>
              s.id === id ? updatedSurvey : s
            ),
            publicSurveys: state.publicSurveys.some((s) => s.id === id)
              ? state.publicSurveys.map((s) => s.id === id ? updatedSurvey : s)
              : [updatedSurvey, ...state.publicSurveys],
          };
        });
      },
      
      closeSurvey: (id) => {
        set((state) => ({
          mySurveys: state.mySurveys.map((s) =>
            s.id === id ? { ...s, status: 'closed' as const } : s
          ),
          publicSurveys: state.publicSurveys.map((s) =>
            s.id === id ? { ...s, status: 'closed' as const } : s
          ),
        }));
      },
      
      publishAsTemplate: (surveyId, category) => {
        const survey = get().getSurveyById(surveyId);
        if (!survey) return;
        
        const newTemplate: Template = {
          id: `template-${Date.now()}`,
          surveyId,
          title: survey.title,
          description: survey.description,
          category,
          authorId: survey.authorId,
          authorName: survey.authorName,
          authorVerified: false,
          questionCount: survey.questions.length,
          estimatedTime: `${Math.ceil(survey.questions.length / 3)}분`,
          likes: 0,
          usageCount: 0,
          hashtags: survey.hashtags,
          createdAt: new Date(),
          coverImageUrl: survey.coverImageUrl,
        };
        
        set((state) => ({
          templates: [newTemplate, ...state.templates],
        }));
      },
      
      copyTemplate: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) throw new Error('Template not found');
        
        const originalSurvey = get().publicSurveys.find((s) => s.id === template.surveyId);
        
        const newSurvey: Survey = {
          id: `survey-${Date.now()}`,
          title: `${template.title} (복사본)`,
          description: template.description,
          questions: originalSurvey?.questions || [],
          themeColor: '#6B8E6B',
          status: 'draft',
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: get().currentUserId,
          authorName: get().currentUserName,
          responseCount: 0,
          completionRate: 0,
          hashtags: template.hashtags,
        };
        
        // Update template usage count
        set((state) => ({
          mySurveys: [newSurvey, ...state.mySurveys],
          templates: state.templates.map((t) =>
            t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
          ),
        }));
        
        return newSurvey;
      },
      
      toggleLikeTemplate: (templateId) => {
        set((state) => {
          const isLiked = state.likedTemplates.includes(templateId);
          return {
            likedTemplates: isLiked
              ? state.likedTemplates.filter((id) => id !== templateId)
              : [...state.likedTemplates, templateId],
            templates: state.templates.map((t) =>
              t.id === templateId
                ? { ...t, likes: t.likes + (isLiked ? -1 : 1) }
                : t
            ),
          };
        });
      },
      
      toggleSaveTemplate: (templateId) => {
        set((state) => ({
          savedTemplates: state.savedTemplates.includes(templateId)
            ? state.savedTemplates.filter((id) => id !== templateId)
            : [...state.savedTemplates, templateId],
        }));
      },
      
      submitResponse: (surveyId, answers) => {
        const newResponse: SurveyResponse = {
          id: `response-${Date.now()}`,
          surveyId,
          answers,
          submittedAt: new Date(),
        };
        
        set((state) => ({
          responses: [...state.responses, newResponse],
          publicSurveys: state.publicSurveys.map((s) =>
            s.id === surveyId ? { ...s, responseCount: s.responseCount + 1 } : s
          ),
          mySurveys: state.mySurveys.map((s) =>
            s.id === surveyId ? { ...s, responseCount: s.responseCount + 1 } : s
          ),
        }));
      },
      
      getResponsesBySurveyId: (surveyId) => {
        return get().responses.filter((r) => r.surveyId === surveyId);
      },
    }),
    {
      name: 'formflex-survey-storage',
    }
  )
);
