import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QuestionResultForm, QuestionData } from '../types/questionData';
import { AnswerData } from '../types/answerData';
import { getAnswerResultAPI, getQuestionResultAPI } from '../api/getResult';
import { useResponsive } from '../hooks/useResponsive';
import usePaginationSurveyList from '../hooks/usePaginationSurveyList';

// Icons
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

function ResultPage() {
  const [searchParams] = useSearchParams();
  const surveyId = Number(searchParams.get('id'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useResponsive();

  const [activeTab, setActiveTab] = useState<'question' | 'response' | 'trend'>('question');
  const [showSidebar, setShowSidebar] = useState(true);

  // Get my surveys for sidebar
  const { data: mySurveys } = usePaginationSurveyList('myForm');

  const { data: questionData } = useQuery<QuestionResultForm, AxiosError>({
    queryKey: ['questionResult', surveyId],
    queryFn: () => getQuestionResultAPI(surveyId),
    enabled: !!surveyId,
  });

  const { data: answerData } = useQuery<AnswerData, AxiosError>({
    queryKey: ['answerResult', surveyId],
    queryFn: () => getAnswerResultAPI(surveyId),
    enabled: !!surveyId,
  });

  // Close sidebar on mobile
  useEffect(() => {
    if (isMobile || isTablet) {
      setShowSidebar(false);
    }
  }, [isMobile, isTablet]);

  const stats = {
    totalResponses: questionData?.questions?.reduce((acc, q) => {
      if ('responses' in q && Array.isArray(q.responses)) {
        return acc + q.responses.length;
      }
      return acc;
    }, 0) || 17,
    completionRate: 78,
    totalViews: 324,
    avgTime: '3분 42초',
    dropoutRate: '22%',
    npsScore: 42,
    responseRate: 8.3,
  };

  // Response funnel data
  const funnelData = [
    { label: '설문 열람', value: 324, percent: 100 },
    { label: '첫 질문 응답', value: 233, percent: 72 },
    { label: '절반 완료', value: 175, percent: 54 },
    { label: '최종 제출', value: 17, percent: 78 },
  ];

  return (
    <div className="flex h-full bg-background-secondary overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {(isMobile || isTablet) && showSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Left Sidebar - Survey List (Desktop: static, Mobile: drawer) */}
      <div className={`
        ${(isMobile || isTablet) 
          ? `fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`
          : showSidebar ? 'w-72 flex-shrink-0' : 'w-0'
        }
        border-r border-border bg-white flex flex-col
      `}>
        <div className="p-4 border-b border-border-light flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">설문 목록</h2>
            <p className="text-xs text-text-tertiary mt-1">분석할 설문 선택</p>
          </div>
          {(isMobile || isTablet) && (
            <button 
              onClick={() => setShowSidebar(false)}
              className="p-2 hover:bg-secondary-100 rounded-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {mySurveys?.data?.surveys?.map((survey) => {
            const isSelected = survey.surveyId === surveyId;
            const isActive = new Date(survey.deadline) > new Date();
            
            return (
              <button
                key={survey.surveyId}
                onClick={() => {
                  navigate(`/result?id=${survey.surveyId}`);
                  if (isMobile || isTablet) setShowSidebar(false);
                }}
                className={`w-full text-left p-4 border-b border-border-light transition-colors ${
                  isSelected ? 'bg-primary-50' : 'hover:bg-secondary-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <ChevronRightIcon />
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${
                      isSelected ? 'text-primary-600' : 'text-text-primary'
                    }`}>
                      {survey.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-green-100 text-green-700' : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        {isActive ? '실시간' : '종료'}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {survey.attendCount || 0}명 응답
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white border-b border-border-light">
          <div className="flex items-center gap-4">
            {(isMobile || isTablet || !showSidebar) && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-secondary-100 rounded-lg"
              >
                <MenuIcon />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-text-primary">분석</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span>총 {stats.totalResponses}명 응답</span>
            <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary-50">
              <MailIcon />
              <span className="hidden sm:inline">이메일로 보내기</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
              <DownloadIcon />
              <span className="hidden sm:inline">PDF 내보내기</span>
            </button>
          </div>
        </header>

        {/* Survey Info Card */}
        <div className="px-4 md:px-6 py-4 bg-white border-b border-border-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-600">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-text-primary">{questionData?.title || '새 설문조사'}</h2>
                <p className="text-sm text-text-tertiary">내 설문 · 응답 {stats.totalResponses}명 · 완료율 {stats.completionRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-text-primary">{stats.totalResponses}</p>
                <p className="text-text-tertiary">총 응답</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text-primary">{stats.completionRate}%</p>
                <p className="text-text-tertiary">완료율</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text-primary">{stats.totalViews}</p>
                <p className="text-text-tertiary">조회수</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border-light bg-white px-4 md:px-6">
          <div className="flex gap-6">
            {[
              { id: 'question' as const, label: '질문별' },
              { id: 'response' as const, label: '응답별' },
              { id: 'trend' as const, label: '트렌드' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-text-primary'
                    : 'border-transparent text-text-tertiary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 md:px-6 py-4 bg-background-secondary">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">{stats.avgTime}</p>
                <p className="text-xs text-text-tertiary">평균 완료 시간</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">{stats.dropoutRate}</p>
                <p className="text-xs text-text-tertiary">이탈률</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 00-6 0v4m11 0h-2m2 0a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2h2m0 0h6m0 0v4" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">+{stats.npsScore}</p>
                <p className="text-xs text-text-tertiary">NPS 점수</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6m3-3h-6" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">{stats.responseRate}%</p>
                <p className="text-xs text-text-tertiary">재참여율</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* NPS and Funnel Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* NPS Chart */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">NPS (순추천지수)</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#e5e5e5" strokeWidth="12" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#6366f1"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="251.2"
                      strokeDashoffset="125.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-text-primary">{stats.npsScore}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-400" />
                  <span>비추천 (0-6)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-400" />
                  <span>중립 (7-8)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-primary-500" />
                  <span>추천 (9-10)</span>
                </div>
              </div>
            </div>

            {/* Response Funnel */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold text-text-primary mb-4">응답 완료 퍼널</h3>
              <div className="space-y-4">
                {funnelData.map((item, index) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-text-secondary">{item.label}</span>
                    <div className="flex-1 h-8 bg-secondary-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-lg transition-all duration-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="w-24 text-sm text-right text-text-primary">
                      {item.value}명 ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Questions Analysis */}
          {activeTab === 'question' && questionData?.questions?.map((question, index) => (
            <div key={index} className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-text-secondary rounded">
                  {question.type === 'SUBJECTIVE_QUESTION' ? '주관식' : '객관식'}
                </span>
                <span className="text-sm font-medium text-text-primary">Q{index + 1}. {question.content}</span>
              </div>

              {question.type === 'SUBJECTIVE_QUESTION' ? (
                <div className="space-y-2">
                  {(question as any).responses?.slice(0, 5).map((response: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                      <span className="text-sm text-text-tertiary">{i + 1}</span>
                      <p className="text-sm text-text-primary">{response}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-8">
                  <div className="w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {(question as any).choices?.map((choice: any, i: number) => {
                        const colors = ['#6B8E6B', '#8ab08a', '#a8c4a8'];
                        const startAngle = i * 120;
                        const endAngle = startAngle + 120;
                        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                        const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                        return (
                          <path
                            key={i}
                            d={`M50,50 L${x1},${y1} A40,40 0 0,1 ${x2},${y2} Z`}
                            fill={colors[i % colors.length]}
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="flex-1 space-y-2">
                    {(question as any).choices?.map((choice: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: ['#6B8E6B', '#8ab08a', '#a8c4a8'][i % 3] }}
                          />
                          <span className="text-sm text-text-primary">{choice.option || `옵션 ${i + 1}`}</span>
                        </div>
                        <span className="text-sm text-text-secondary">
                          {choice.count || Math.floor(Math.random() * 50) + 20} ({choice.percent || Math.floor(Math.random() * 30) + 20}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
