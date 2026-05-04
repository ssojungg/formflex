import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import ReactApexChart from 'react-apexcharts';
import { QuestionResultForm, QuestionData } from '../types/questionData';
import { AnswerData } from '../types/answerData';
import { getAnswerResultAPI, getQuestionResultAPI } from '../api/getResult';
import { useResponsive } from '../hooks/useResponsive';
import useInfiniteList from '../hooks/useInfiniteList';

// ── Icons ──────────────────────────────────────────────────────────────
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const QuestionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const TextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>
  </svg>
);
const BarChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const INDIGO = '#6366f1';
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#ec4899'];

// ── Helpers ────────────────────────────────────────────────────────────
function typeLabel(type: string) {
  const map: Record<string, string> = {
    MULTIPLE_CHOICE: '객관식', SUBJECTIVE_QUESTION: '주관식',
    CHECKBOX: '체크박스', DROPDOWN: '드롭다운',
  };
  return map[type] || type;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

// ── Choice Bar + Donut ─────────────────────────────────────────────────
function ChoiceChart({ question }: { question: QuestionData }) {
  const choices = question.choices || [];
  const total = choices.reduce((s, c) => s + (c.count || 0), 0);

  const barOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '60%' } },
    colors: [INDIGO],
    xaxis: { categories: choices.map((c) => c.option), labels: { style: { fontSize: '12px' } } },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => total > 0 ? `${Math.round((val / total) * 100)}%` : '0%',
      style: { fontSize: '11px', colors: ['#fff'] },
    },
    grid: { borderColor: '#f1f5f9' },
    tooltip: {
      y: { formatter: (val: number) => `${val}명 (${total > 0 ? Math.round((val / total) * 100) : 0}%)` },
    },
  };
  const barSeries = [{ name: '응답수', data: choices.map((c) => c.count || 0) }];

  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut', background: 'transparent' },
    colors: CHART_COLORS,
    labels: choices.map((c) => c.option),
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '65%' } } },
    tooltip: { y: { formatter: (val: number) => `${val}명` } },
  };
  const donutSeries = choices.map((c) => c.count || 0);

  if (choices.length === 0) return <p className="text-sm text-gray-400 text-center py-8">응답 데이터 없음</p>;

  return (
    <div className="grid lg:grid-cols-2 gap-4 mt-2">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">응답 분포 (막대)</p>
        <ReactApexChart options={barOptions} series={barSeries} type="bar" height={Math.max(choices.length * 44, 120)} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">비율 (도넛)</p>
        <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={220} />
      </div>
    </div>
  );
}

// ── Subjective Answers ─────────────────────────────────────────────────
function SubjectiveAnswers({ question }: { question: QuestionData }) {
  const [showAll, setShowAll] = useState(false);
  const answers = question.answers || [];
  const shown = showAll ? answers : answers.slice(0, 5);

  if (answers.length === 0) return <p className="text-sm text-gray-400 text-center py-8">응답 데이터 없음</p>;

  // Word frequency (simple)
  const wordFreq: Record<string, number> = {};
  answers.forEach((a) => {
    a.content.split(/\s+/).filter((w) => w.length > 1).forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });
  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="mt-2 space-y-4">
      {topWords.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">자주 등장한 키워드</p>
          <div className="flex flex-wrap gap-2">
            {topWords.map(([word, count]) => (
              <span
                key={word}
                className="px-3 py-1 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: INDIGO, opacity: 0.4 + Math.min(count / topWords[0][1], 1) * 0.6 }}
              >
                {word} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">응답 목록 ({answers.length}개)</p>
        <div className="space-y-2">
          {shown.map((a, i) => (
            <div key={a.answerId} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-400 mt-0.5 shrink-0">#{i + 1}</span>
              <p className="text-sm text-gray-800">{a.content}</p>
            </div>
          ))}
        </div>
        {answers.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showAll ? '접기' : `${answers.length - 5}개 더 보기 ▾`}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
function ResultPage() {
  const [searchParams] = useSearchParams();
  const surveyId = Number(searchParams.get('id'));
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const [activeTab, setActiveTab] = useState<'question' | 'response' | 'trend'>('question');
  const [showSidebar, setShowSidebar] = useState(!isMobile && !isTablet);
  const [isPrinting, setIsPrinting] = useState(false);

  const { surveys: mySurveys } = useInfiniteList('myForm');

  const { data: questionData, isLoading: qLoading } = useQuery<QuestionResultForm, AxiosError>({
    queryKey: ['questionResult', surveyId],
    queryFn: () => getQuestionResultAPI(surveyId),
    enabled: !!surveyId,
  });

  const { data: answerData, isLoading: aLoading } = useQuery<AnswerData, AxiosError>({
    queryKey: ['answerResult', surveyId],
    queryFn: () => getAnswerResultAPI(surveyId),
    enabled: !!surveyId,
  });

  // ── Real stats from data ───────────────────────────────────────────
  const stats = useMemo(() => {
    const totalResponses = answerData?.list?.rows?.length ?? 0;
    const questionCount = questionData?.questions?.length ?? 0;
    const isActive = questionData?.open ?? false;

    // Choice questions total votes
    const choiceQuestions = (questionData?.questions || []).filter(
      (q) => q.type !== 'SUBJECTIVE_QUESTION'
    );
    const avgChoiceResponses = choiceQuestions.length > 0
      ? Math.round(
          choiceQuestions.reduce((sum, q) => {
            const total = (q.choices || []).reduce((s, c) => s + (c.count || 0), 0);
            return sum + total;
          }, 0) / choiceQuestions.length
        )
      : 0;

    // Subjective answer count
    const subjectiveCount = (questionData?.questions || [])
      .filter((q) => q.type === 'SUBJECTIVE_QUESTION')
      .reduce((sum, q) => sum + (q.answers?.length || 0), 0);

    return { totalResponses, questionCount, isActive, avgChoiceResponses, subjectiveCount };
  }, [questionData, answerData]);

  // ── Trend: responses per day ───────────────────────────────────────
  const trendData = useMemo(() => {
    const rows = answerData?.list?.rows || [];
    const byDay: Record<string, number> = {};
    rows.forEach((row) => {
      const day = new Date(row.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
      byDay[day] = (byDay[day] || 0) + 1;
    });
    const sorted = Object.entries(byDay).sort((a, b) =>
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
    return { labels: sorted.map(([d]) => d), values: sorted.map(([, v]) => v) };
  }, [answerData]);

  const trendOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
    colors: [INDIGO],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: trendData.labels, labels: { style: { fontSize: '11px' } } },
    yaxis: { labels: { formatter: (v) => `${v}명` } },
    grid: { borderColor: '#f1f5f9' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => `${v}명` } },
  };

  // ── Per-question choice summary (stacked bar) ──────────────────────
  const choiceQuestions = (questionData?.questions || []).filter(
    (q) => q.type !== 'SUBJECTIVE_QUESTION' && (q.choices?.length || 0) > 0
  );

  const stackedOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false }, background: 'transparent' },
    colors: CHART_COLORS,
    plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
    xaxis: {
      categories: choiceQuestions.map((_, i) => `Q${i + 1}`),
      labels: { style: { fontSize: '12px' } },
    },
    yaxis: { labels: { formatter: (v) => `${v}명` } },
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f5f9' },
    tooltip: { y: { formatter: (v) => `${v}명` } },
  };

  const allOptionLabels = [...new Set(
    choiceQuestions.flatMap((q) => (q.choices || []).map((c) => c.option))
  )];

  const stackedSeries = allOptionLabels.slice(0, 8).map((label) => ({
    name: label,
    data: choiceQuestions.map((q) => {
      const choice = (q.choices || []).find((c) => c.option === label);
      return choice?.count || 0;
    }),
  }));

  const isLoading = qLoading || aLoading;
  const hasData = !!surveyId && (!!questionData || !!answerData);

  const handleExport = () => {
    setIsPrinting(true);
    const cleanup = () => {
      setIsPrinting(false);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    // Double rAF ensures React re-renders all tab content before print dialog opens
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden print:overflow-visible print:block print:h-auto">
      {/* Sidebar */}
      {showSidebar && !isMobile && (
        <div className="w-64 border-r border-gray-100 bg-white flex-shrink-0 flex flex-col print:hidden">
          <div className="h-16 flex items-center px-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-800">내 설문</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mySurveys.map((survey) => {
              const isSelected = survey.surveyId === surveyId;
              const isActive = new Date(survey.deadline) > new Date();
              return (
                <button
                  key={survey.surveyId}
                  onClick={() => navigate(`/result?id=${survey.surveyId}`)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                    isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ChevronRightIcon />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-600' : 'text-gray-800'}`}>
                        {survey.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isActive ? '진행중' : '종료'}
                        </span>
                        <span className="text-xs text-gray-400">{survey.attendCount || 0}명</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:block">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-100 flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-gray-100 rounded-lg">
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {questionData?.title || '분석'}
              </h1>
              {questionData?.createdAt && (
                <p className="text-xs text-gray-400">{formatDate(questionData.createdAt)} 생성</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 text-gray-600">
              <MailIcon />
              <span className="hidden sm:inline">이메일</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white text-sm rounded-xl hover:bg-indigo-600"
            >
              <DownloadIcon />
              <span className="hidden sm:inline">내보내기</span>
            </button>
          </div>
        </header>

        {/* No survey selected */}
        {!surveyId && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChartIcon />
              </div>
              <p className="text-gray-500">왼쪽에서 분석할 설문을 선택하세요</p>
            </div>
          </div>
        )}

        {surveyId && isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasData && !isLoading && (
          <>
            {/* Stats Cards */}
            <div className="px-4 md:px-6 py-4 bg-white border-b border-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-indigo-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                    <UsersIcon />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
                    <p className="text-xs text-gray-500">총 응답</p>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                    <QuestionIcon />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.questionCount}</p>
                    <p className="text-xs text-gray-500">질문 수</p>
                  </div>
                </div>
                <div className="bg-cyan-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-white">
                    <BarChartIcon />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgChoiceResponses}</p>
                    <p className="text-xs text-gray-500">평균 선택 응답</p>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                    <CalendarIcon />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.subjectiveCount}</p>
                    <p className="text-xs text-gray-500">주관식 응답</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-100 px-4 md:px-6 print:hidden">
              <div className="flex gap-6">
                {[
                  { id: 'question' as const, label: '질문별 분석' },
                  { id: 'response' as const, label: '응답별 보기' },
                  { id: 'trend' as const, label: '트렌드' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Print-only header */}
            <div className="hidden print:block px-6 py-4 mb-2">
              <h1 className="text-xl font-bold text-gray-900">{questionData?.title || '설문 분석 결과'}</h1>
              <p className="text-xs text-gray-500 mt-1">생성일: {questionData?.createdAt ? formatDate(questionData.createdAt) : ''}</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 print:overflow-visible print:p-0">

              {/* ── 질문별 탭 ── */}
              {(activeTab === 'question' || isPrinting) && (
                <>
                  {/* Stacked summary (only if multiple choice questions) */}
                  {stackedSeries.length > 0 && choiceQuestions.length > 1 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-1">전체 선택 응답 요약</h3>
                      <p className="text-xs text-gray-400 mb-4">객관식 질문 전체 응답 분포</p>
                      <ReactApexChart options={stackedOptions} series={stackedSeries} type="bar" height={240} />
                    </div>
                  )}

                  {/* Per-question cards */}
                  {questionData?.questions?.map((question, index) => (
                    <div key={question.questionId} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              question.type === 'SUBJECTIVE_QUESTION'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {question.type === 'SUBJECTIVE_QUESTION' ? <TextIcon /> : <BarChartIcon />}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              question.type === 'SUBJECTIVE_QUESTION'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-indigo-50 text-indigo-600'
                            }`}>
                              {typeLabel(question.type)}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{question.content}</p>
                        </div>
                        <span className="shrink-0 text-xs text-gray-400">
                          {question.type === 'SUBJECTIVE_QUESTION'
                            ? `${question.answers?.length || 0}개 응답`
                            : `${(question.choices || []).reduce((s, c) => s + (c.count || 0), 0)}명 응답`}
                        </span>
                      </div>

                      {question.type === 'SUBJECTIVE_QUESTION'
                        ? <SubjectiveAnswers question={question} />
                        : <ChoiceChart question={question} />}
                    </div>
                  ))}
                </>
              )}

              {/* ── 응답별 탭 ── */}
              {(activeTab === 'response' || isPrinting) && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">개별 응답 목록</h3>
                      <p className="text-xs text-gray-400 mt-0.5">총 {answerData?.list?.rows?.length || 0}개 응답</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">응답 일시</th>
                          {answerData?.list?.head?.map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap max-w-[180px]">
                              <span className="block truncate">{h}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {answerData?.list?.rows?.map((row, i) => (
                          <tr key={row.userId} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-indigo-50/40 transition-colors`}>
                            <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(row.createdAt)}</td>
                            {row.responses.map((resp, j) => (
                              <td key={j} className="px-4 py-3 text-gray-700 text-xs max-w-[180px]">
                                <span className="block truncate" title={resp}>{resp || '—'}</span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!answerData?.list?.rows?.length) && (
                      <div className="text-center py-12 text-gray-400 text-sm">응답 데이터가 없습니다</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 트렌드 탭 ── */}
              {(activeTab === 'trend' || isPrinting) && (
                <div className="space-y-5">
                  {/* Daily trend */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-1">일별 응답 추이</h3>
                    <p className="text-xs text-gray-400 mb-4">날짜별 응답 수</p>
                    {trendData.labels.length > 0 ? (
                      <ReactApexChart
                        options={trendOptions}
                        series={[{ name: '응답수', data: trendData.values }]}
                        type="area"
                        height={240}
                      />
                    ) : (
                      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                        날짜별 데이터가 없습니다
                      </div>
                    )}
                  </div>

                  {/* Radial per-question completion */}
                  {choiceQuestions.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-1">질문별 응답 비교</h3>
                      <p className="text-xs text-gray-400 mb-4">각 객관식 질문의 총 응답 수</p>
                      <ReactApexChart
                        options={{
                          chart: { type: 'radialBar', background: 'transparent', toolbar: { show: false } },
                          colors: CHART_COLORS,
                          plotOptions: {
                            radialBar: {
                              dataLabels: {
                                name: { fontSize: '11px' },
                                value: { fontSize: '14px', formatter: (v) => `${v}명` },
                                total: {
                                  show: true,
                                  label: '총 응답',
                                  formatter: () => `${choiceQuestions.reduce((s, q) => s + (q.choices || []).reduce((ss, c) => ss + (c.count || 0), 0), 0)}명`,
                                },
                              },
                            },
                          },
                          labels: choiceQuestions.map((q, i) => `Q${i + 1}`),
                        }}
                        series={choiceQuestions.map((q) => {
                          const total = (q.choices || []).reduce((s, c) => s + (c.count || 0), 0);
                          const max = Math.max(...choiceQuestions.map((qq) =>
                            (qq.choices || []).reduce((s, c) => s + (c.count || 0), 0)
                          ), 1);
                          return Math.round((total / max) * 100);
                        })}
                        type="radialBar"
                        height={300}
                      />
                    </div>
                  )}

                  {/* Summary table */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">질문별 요약</h3>
                    <div className="space-y-3">
                      {questionData?.questions?.map((q, i) => {
                        const total = q.type === 'SUBJECTIVE_QUESTION'
                          ? q.answers?.length || 0
                          : (q.choices || []).reduce((s, c) => s + (c.count || 0), 0);
                        const topChoice = q.type !== 'SUBJECTIVE_QUESTION'
                          ? (q.choices || []).reduce((prev, cur) => (cur.count || 0) > (prev.count || 0) ? cur : prev, q.choices?.[0] || { option: '-', count: 0 })
                          : null;
                        return (
                          <div key={q.questionId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <p className="flex-1 text-sm text-gray-700 truncate">{q.content}</p>
                            <span className="text-xs text-gray-400 shrink-0">{typeLabel(q.type)}</span>
                            <span className="text-sm font-semibold text-indigo-600 shrink-0 w-16 text-right">{total}명</span>
                            {topChoice && (
                              <span className="hidden sm:block text-xs text-gray-500 shrink-0 max-w-[120px] truncate">
                                최다: {topChoice.option}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResultPage;
