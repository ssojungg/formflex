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
}

const MOCK_PUBLIC_SURVEYS: Survey[] = [];

const MOCK_TEMPLATES: Template[] = [];

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
