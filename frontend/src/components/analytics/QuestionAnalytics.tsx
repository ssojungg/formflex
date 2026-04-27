import React, { useState } from 'react';

interface QuestionAnalyticsProps {
  questions: any[];
}

function QuestionAnalytics({ questions }: QuestionAnalyticsProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'bar' | 'list'>('chart');

  // NPS Chart Component
  const NPSChart = () => (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">NPS (순추천지수)</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Donut Chart */}
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#6B8E6B"
              strokeWidth="12"
              strokeDasharray="251.2"
              strokeDashoffset="75"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-foreground">42</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-destructive" />
          <span className="text-muted-foreground">비추천 (0-6)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-yellow-400" />
          <span className="text-muted-foreground">중립 (7-8)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-primary" />
          <span className="text-muted-foreground">추천 (9-10)</span>
        </div>
      </div>
    </div>
  );

  // Response Funnel
  const ResponseFunnel = () => (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">응답 완료 퍼널</h3>
      <div className="space-y-3">
        {[
          { label: '설문 열람', count: 324, percentage: 100 },
          { label: '첫 질문 응답', count: 233, percentage: 72 },
          { label: '절반 완료', count: 175, percentage: 54 },
          { label: '최종 제출', count: 17, percentage: 78 },
        ].map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-24 text-sm text-muted-foreground">{item.label}</div>
            <div className="flex-1">
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
            <div className="w-24 text-right">
              <span className="text-sm font-medium text-foreground">{item.count}명</span>
              <span className="text-xs text-muted-foreground ml-1">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Question Card Component
  const QuestionCard = ({ question, index }: { question: any; index: number }) => {
    const isObjective = question.type !== 'SUBJECTIVE_QUESTION';
    const mockResponses = [
      '매우 유익한 설문이었습니다.',
      '전반적으로 만족스러웠어요.',
      '다음에도 참여하고 싶습니다.',
      '개선 사항을 잘 반영해주셨으면 좋겠습니다.',
      '빠른 응답 감사합니다.',
    ];

    const mockChoices = [
      { option: '옵션 1', count: 29, percentage: 20 },
      { option: '옵션 2', count: 51, percentage: 35 },
      { option: '옵션 3', count: 66, percentage: 45 },
    ];

    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
              {isObjective ? '객관식' : '주관식'}
            </span>
            <span className="text-sm font-medium text-foreground">
              Q{index + 1}. {question.content || '질문 내용'}
            </span>
          </div>
          {isObjective && (
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('chart')}
                className={`p-1.5 rounded ${viewMode === 'chart' ? 'bg-card shadow-sm' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('bar')}
                className={`p-1.5 rounded ${viewMode === 'bar' ? 'bg-card shadow-sm' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-card shadow-sm' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          {isObjective ? (
            <div className="flex items-start gap-6">
              {/* Pie Chart */}
              <div className="w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#6B8E6B"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="125"
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#8FAE8F"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="175"
                    transform="rotate(35 50 50)"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                {mockChoices.map((choice, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded"
                        style={{
                          backgroundColor: idx === 0 ? '#6B8E6B' : idx === 1 ? '#8FAE8F' : '#A3C9A3',
                        }}
                      />
                      <span className="text-sm text-foreground">{choice.option}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-foreground">{choice.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">({choice.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {mockResponses.map((response, idx) => (
                <div key={idx} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground w-6">{idx + 1}</span>
                  <p className="text-sm text-foreground">{response}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Demo questions if none provided
  const demoQuestions = questions.length > 0 ? questions : [
    { type: 'SUBJECTIVE_QUESTION', content: '이메일' },
    { type: 'SUBJECTIVE_QUESTION', content: '텍스트 입력' },
    { type: 'CHECKBOX', content: '복수 선택' },
    { type: 'DROPDOWN', content: '드롭다운' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NPSChart />
        <ResponseFunnel />
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {demoQuestions.map((question, index) => (
          <QuestionCard key={index} question={question} index={index} />
        ))}
      </div>
    </div>
  );
}

export default QuestionAnalytics;
