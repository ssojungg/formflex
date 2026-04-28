import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QuestionResultForm } from '../../types/questionData';
import { AnswerData } from '../../types/answerData';
import { getAnswerResultAPI, getQuestionResultAPI } from '../../api/getResult';
import { useResponsive } from '../../hooks/useResponsive';
import SurveySelector from './SurveySelector';
import AnalyticsHeader from './AnalyticsHeader';
import AnalyticsStats from './AnalyticsStats';
import QuestionAnalytics from './QuestionAnalytics';
import ResponseAnalytics from './ResponseAnalytics';
import TrendAnalytics from './TrendAnalytics';

function AnalyticsDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const surveyId = Number(searchParams.get('id'));
  const { isMobile } = useResponsive();

  const [activeTab, setActiveTab] = useState<'question' | 'response' | 'trend'>('question');
  const [showSidebar, setShowSidebar] = useState(!isMobile);

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

  // Mock data for stats
  const stats = {
    avgTime: '3분 42초',
    dropoutRate: '22%',
    npsScore: '+42',
    responseRate: '8.3%',
    totalResponses: questionData?.questions?.length || 17,
    completionRate: 78,
    totalViews: 324,
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Full-width Header (aligns with main sidebar logo area h-16) ── */}
      <AnalyticsHeader
        title={questionData?.title || '새 설문조사'}
        stats={stats}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        showSidebar={showSidebar}
      />

      {/* ── Body: sidebar + content side-by-side below header ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Survey Selector Sidebar */}
        {showSidebar && (
          <div className="w-64 border-r border-border bg-card flex-shrink-0 flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                설문 선택
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SurveySelector
                selectedId={surveyId}
                onSelect={(id) => navigate(`/result?id=${id}`)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-border bg-card px-4 md:px-6">
            <div className="flex gap-6">
              {(['question', 'response', 'trend'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'question' ? '질문별' : tab === 'response' ? '응답별' : '트렌드'}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <AnalyticsStats stats={stats} />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === 'question' && (
              <QuestionAnalytics questions={questionData?.questions || []} />
            )}
            {activeTab === 'response' && (
              <ResponseAnalytics data={{ head: answerData?.list?.head || [], rows: (answerData?.list?.rows as unknown as any[][]) || [] }} />
            )}
            {activeTab === 'trend' && (
              <TrendAnalytics surveyId={surveyId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
