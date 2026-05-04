import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: QuestionOption[];
  ratingMax?: number;
  imageUrls?: string[];
  minLength?: number;
  maxLength?: number;
  conditionalLogic?: {
    showIf: {
      questionId: string;
      condition: 'equals' | 'not_equals' | 'contains';
      value: string;
    };
  };
}

export type QuestionType = 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'dropdown' | 'rating' | 'date' | 'email' | 'number' | 'section_divider';

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  coverImageUrl?: string;
  themeColor: string;
  fontFamily?: string;
  cardStyle?: 'bordered' | 'filled' | 'minimal';
  status: 'draft' | 'active' | 'closed';
  isPublic: boolean;
  deadline?: Date;
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
  questions?: Question[];
}

// ==================== Featured Template Questions ====================

const makeOpts = (texts: string[]): QuestionOption[] =>
  texts.map((t, i) => ({ id: `opt-${i}`, text: t }));

const TEMPLATE_1_QUESTIONS: Question[] = [
  { id: 't1-q1', type: 'date', label: '본 제품을 처음 구매하신 날짜를 선택해 주세요.', required: false },
  { id: 't1-q2', type: 'single_choice', label: '제품을 처음 인지하게 된 경로는 무엇입니까?', required: false, options: makeOpts(['SNS 광고', '지인 추천', '오프라인 매장', '기사/블로그', '기타']) },
  { id: 't1-q3', type: 'rating', label: '제품의 전반적인 품질 및 성능에 대해 어느 정도 만족하십니까?', required: false, ratingMax: 5 },
  { id: 't1-q4', type: 'multiple_choice', label: '타사 제품 대비 우리 브랜드만의 차별점은 무엇이라고 생각하십니까? (복수 응답 가능)', required: false, options: makeOpts(['디자인', '가격 경쟁력', '고객 서비스', '혁신적 기능', '브랜드 이미지']) },
  { id: 't1-q5', type: 'number', label: '한 달 평균 본 제품을 몇 회 정도 사용하시나요?', required: false, placeholder: '단위: 회' },
  { id: 't1-q6', type: 'long_text', label: '사용 중 겪으신 불편 사항이나 개선이 필요한 점을 자유롭게 적어주세요.', required: false },
  { id: 't1-q7', type: 'email', label: '향후 신제품 출시 소식을 받아보실 이메일 주소를 입력해 주세요.', required: false },
];

const TEMPLATE_2_QUESTIONS: Question[] = [
  { id: 't2-q1', type: 'dropdown', label: '주로 어떤 환경에서 서비스를 이용하십니까?', required: false, options: makeOpts(['데스크탑(Windows)', '데스크탑(macOS)', '모바일(iOS)', '모바일(Android)']) },
  { id: 't2-q2', type: 'single_choice', label: '가장 자주 사용하는 핵심 기능 하나를 선택해 주세요.', required: false, options: makeOpts(['설문 생성', '결과 분석 대시보드', '템플릿 탐색', '팀 협업 관리']) },
  { id: 't2-q3', type: 'rating', label: '특정 작업을 수행할 때 인터페이스가 얼마나 직관적이었습니까?', required: false, ratingMax: 5 },
  { id: 't2-q4', type: 'long_text', label: '서비스 이용 중 가장 큰 허들(Pain Point)이 되었던 지점은 어디인가요?', required: false },
  { id: 't2-q5', type: 'multiple_choice', label: '다음 중 UI 디자인 개선이 가장 시급하다고 느끼는 요소는 무엇입니까?', required: false, options: makeOpts(['컬러 시스템', '폰트 가독성', '버튼 배치', '아이콘 의미 전달', '메뉴 구조']) },
  { id: 't2-q6', type: 'number', label: '서비스 내에서 검색 기능을 활용할 때 평균 검색 횟수는 몇 번인가요?', required: false, placeholder: '단위: 번' },
  { id: 't2-q7', type: 'short_text', label: '마지막으로 우리 서비스의 첫인상을 한 단어로 표현한다면?', required: false },
];

const TEMPLATE_3_QUESTIONS: Question[] = [
  { id: 't3-q1', type: 'date', label: '본 컨퍼런스에 참여하신 날짜를 선택해 주세요.', required: false },
  { id: 't3-q2', type: 'dropdown', label: '현재 종사하고 계신 직군을 선택해 주세요.', required: false, options: makeOpts(['프론트엔드', '백엔드', '기획/PM', '디자인', '데이터 분석', '마케팅', '기타']) },
  { id: 't3-q3', type: 'single_choice', label: '금일 참여하신 세션 중 가장 유익했던 세션은 무엇입니까?', required: false, options: makeOpts(['AI의 미래', '서버리스 아키텍처', '효율적인 협업 툴', 'UI 테스팅 자동화']) },
  { id: 't3-q4', type: 'rating', label: '전체적인 강연 내용의 난이도는 적절했습니까?', required: false, ratingMax: 5 },
  { id: 't3-q5', type: 'multiple_choice', label: '차기 컨퍼런스에서 깊이 있게 다뤄지길 원하는 주제를 선택해 주세요.', required: false, options: makeOpts(['보안 및 컴플라이언스', '오픈소스 기여', '클라우드 비용 최적화', '커리어 성장']) },
  { id: 't3-q6', type: 'long_text', label: '행사장 운영(장소, 간식, 안내 등)에 대해 아쉬웠던 점이 있다면 기재해 주세요.', required: false },
  { id: 't3-q7', type: 'email', label: '세션 발표 자료를 송부받으실 비즈니스 이메일을 입력해 주세요.', required: false },
];

const TEMPLATE_4_QUESTIONS: Question[] = [
  { id: 't4-q1', type: 'rating', label: '현재 소속된 팀의 업무 몰입도를 점수로 표현해 주세요.', required: false, ratingMax: 5 },
  { id: 't4-q2', type: 'number', label: '주간 평균 미팅(회의)에 소요되는 시간은 몇 시간입니까?', required: false, placeholder: '단위: 시간' },
  { id: 't4-q3', type: 'multiple_choice', label: '우리 회사의 가장 큰 강점이라고 생각하는 기업 문화는 무엇입니까?', required: false, options: makeOpts(['유연 근무제', '수평적 소통', '성과 보상 체계', '자기계발 지원', '팀 간 협업']) },
  { id: 't4-q4', type: 'single_choice', label: '현재 업무 환경에서 몰입을 방해하는 가장 큰 요소는 무엇입니까?', required: false, options: makeOpts(['잦은 회의', '불명확한 업무 지시', '부족한 장비/도구', '소음', '기타']) },
  { id: 't4-q5', type: 'long_text', label: '사내 커뮤니케이션 활성화를 위해 도입되길 바라는 프로그램 아이디어가 있나요?', required: false },
  { id: 't4-q6', type: 'short_text', label: '현재 본인이 사용 중인 사내 메신저 아이디나 닉네임을 적어주세요.', required: false },
  { id: 't4-q7', type: 'dropdown', label: '올해 가장 희망하는 사내 교육 테마를 선택해 주세요.', required: false, options: makeOpts(['직무 역량 강화', '리더십 교육', '어학 지원', '멘탈 헬스케어']) },
];

// ==================== Seed Data ====================

const SEED_TEMPLATES: Template[] = [
  {
    id: 'featured-template-1',
    surveyId: 'featured-survey-1',
    title: '[2026] 프리미엄 신제품 이용 경험 및 브랜드 충성도 조사',
    description: '고객의 제품 구매 경험과 브랜드 인식을 심층 파악하는 시장조사 설문입니다.',
    category: '고객 만족',
    authorId: 'formflex-official',
    authorName: 'FormFlex 공식',
    authorVerified: true,
    questionCount: 7,
    estimatedTime: '3분',
    likes: 248,
    usageCount: 1024,
    hashtags: ['고객만족', '시장조사', 'NPS'],
    createdAt: new Date('2026-01-15'),
    questions: TEMPLATE_1_QUESTIONS,
  },
  {
    id: 'featured-template-2',
    surveyId: 'featured-survey-2',
    title: '서비스 사용성(Usability) 최적화를 위한 사용자 심층 인터뷰 설문',
    description: 'UX 리서치를 위한 사용성 테스트 설문으로 UI/UX 개선 포인트를 발굴합니다.',
    category: 'UX 리서치',
    authorId: 'formflex-official',
    authorName: 'FormFlex 공식',
    authorVerified: true,
    questionCount: 7,
    estimatedTime: '3분',
    likes: 312,
    usageCount: 876,
    hashtags: ['UX리서치', '사용성테스트', 'UI개선'],
    createdAt: new Date('2026-02-01'),
    questions: TEMPLATE_2_QUESTIONS,
  },
  {
    id: 'featured-template-3',
    surveyId: 'featured-survey-3',
    title: '[DevTech 2026] 컨퍼런스 세션 만족도 및 운영 피드백 조사',
    description: '컨퍼런스 참가자 만족도와 향후 주제 방향성을 수집하는 이벤트 피드백 설문입니다.',
    category: '이벤트',
    authorId: 'formflex-official',
    authorName: 'FormFlex 공식',
    authorVerified: true,
    questionCount: 7,
    estimatedTime: '3분',
    likes: 189,
    usageCount: 542,
    hashtags: ['이벤트', '컨퍼런스', '네트워킹'],
    createdAt: new Date('2026-03-10'),
    questions: TEMPLATE_3_QUESTIONS,
  },
  {
    id: 'featured-template-4',
    surveyId: 'featured-survey-4',
    title: '2026년 상반기 조직 문화 진단 및 근무 환경 만족도 조사',
    description: '직원 몰입도와 조직 문화를 진단하고 개선 방향을 발굴하는 HR 설문입니다.',
    category: '직원 설문',
    authorId: 'formflex-official',
    authorName: 'FormFlex 공식',
    authorVerified: true,
    questionCount: 7,
    estimatedTime: '3분',
    likes: 276,
    usageCount: 731,
    hashtags: ['직원설문', '조직문화', 'HR'],
    createdAt: new Date('2026-04-01'),
    questions: TEMPLATE_4_QUESTIONS,
  },
];

// ==================== Store ====================

interface SurveyStore {
  publicSurveys: Survey[];
  mySurveys: Survey[];
  templates: Template[];
  responses: SurveyResponse[];
  likedTemplates: string[];
  savedTemplates: string[];
  currentUserId: string;
  currentUserName: string;

  addSurvey: (survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName' | 'responseCount' | 'completionRate'>) => Survey;
  updateSurvey: (id: string, updates: Partial<Survey>) => void;
  deleteSurvey: (id: string) => void;
  getSurveyById: (id: string) => Survey | undefined;

  publishSurvey: (id: string) => void;
  closeSurvey: (id: string) => void;

  publishAsTemplate: (surveyId: string, category: string, title?: string) => void;
  copyTemplate: (templateId: string) => Survey;
  toggleLikeTemplate: (templateId: string) => void;
  toggleSaveTemplate: (templateId: string) => void;

  submitResponse: (surveyId: string, answers: Record<string, string | string[]>) => void;
  getResponsesBySurveyId: (surveyId: string) => SurveyResponse[];
}

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set, get) => ({
      publicSurveys: [],
      mySurveys: [],
      templates: SEED_TEMPLATES,
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
            mySurveys: state.mySurveys.map((s) => s.id === id ? updatedSurvey : s),
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

      publishAsTemplate: (surveyId, category, title) => {
        const survey = get().getSurveyById(surveyId);
        const newTemplate: Template = {
          id: `template-${Date.now()}`,
          surveyId,
          title: title || survey?.title || '새 템플릿',
          description: survey?.description || '',
          category,
          authorId: survey?.authorId || get().currentUserId,
          authorName: survey?.authorName || get().currentUserName,
          authorVerified: false,
          questionCount: survey?.questions.length || 0,
          estimatedTime: `${Math.ceil((survey?.questions.length || 1) / 3)}분`,
          likes: 0,
          usageCount: 0,
          hashtags: survey?.hashtags || [],
          createdAt: new Date(),
          coverImageUrl: survey?.coverImageUrl,
          questions: survey?.questions,
        };
        set((state) => ({
          templates: [newTemplate, ...state.templates],
        }));
      },

      copyTemplate: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) throw new Error('Template not found');

        // Use questions embedded in template first, then fall back to publicSurveys lookup
        const templateQuestions = template.questions || [];
        const originalSurvey = get().publicSurveys.find((s) => s.id === template.surveyId);
        const questions = templateQuestions.length > 0
          ? templateQuestions.map((q) => ({ ...q, id: `${q.id}-copy-${Date.now()}` }))
          : (originalSurvey?.questions || []);

        const newSurvey: Survey = {
          id: `survey-${Date.now()}`,
          title: `${template.title} (복사본)`,
          description: template.description,
          questions,
          themeColor: '#6366f1',
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
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Seed featured templates for existing users who had empty templates
          const existing = persistedState as SurveyStore;
          const hasSeeded = existing.templates?.some((t) => t.id.startsWith('featured-'));
          return {
            ...existing,
            templates: hasSeeded ? existing.templates : SEED_TEMPLATES,
          };
        }
        return persistedState as SurveyStore;
      },
    }
  )
);
