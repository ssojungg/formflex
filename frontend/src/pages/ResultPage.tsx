import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import ReactApexChart from 'react-apexcharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QuestionResultForm, QuestionData } from '../types/questionData';
import { AnswerData } from '../types/answerData';
import { getAnswerResultAPI, getQuestionResultAPI, sendReportEmailAPI } from '../api/getResult';
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
// Soft, harmonious palette (muted jewel tones) for a premium analytics look.
const CHART_COLORS = ['#6366f1', '#a78bfa', '#22d3ee', '#fbbf24', '#fb7185', '#34d399', '#f97316', '#e879f9'];
const CHART_FONT =
  'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

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
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: CHART_FONT, parentHeightOffset: 0 },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        borderRadiusApplication: 'end',
        barHeight: '55%',
        distributed: true,
      },
    },
    colors: CHART_COLORS,
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'horizontal', gradientToColors: undefined, opacityFrom: 1, opacityTo: 0.85, stops: [0, 100] },
    },
    states: { hover: { filter: { type: 'darken' } } },
    xaxis: {
      categories: choices.map((c) => c.option),
      labels: { style: { fontSize: '12px', colors: '#94a3b8' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: '12px', colors: '#475569' } } },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => (total > 0 ? `${Math.round((val / total) * 100)}%` : '0%'),
      style: { fontSize: '11px', fontWeight: 700, colors: ['#fff'] },
      dropShadow: { enabled: false },
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    tooltip: {
      y: { formatter: (val: number) => `${val}명 (${total > 0 ? Math.round((val / total) * 100) : 0}%)` },
    },
  };
  const barSeries = [{ name: '응답수', data: choices.map((c) => c.count || 0) }];

  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: CHART_FONT },
    colors: CHART_COLORS,
    labels: choices.map((c) => c.option),
    stroke: { width: 2, colors: ['#fff'] },
    legend: { position: 'bottom', fontSize: '12px', fontWeight: 500, labels: { colors: '#64748b' }, markers: { radius: 12 }, itemMargin: { horizontal: 8, vertical: 3 } },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: '총 응답',
              fontSize: '12px',
              color: '#94a3b8',
              formatter: () => `${total}명`,
            },
            value: { fontSize: '22px', fontWeight: 700, color: '#1e293b' },
          },
        },
      },
    },
    tooltip: { y: { formatter: (val: number) => `${val}명` } },
  };
  const donutSeries = choices.map((c) => c.count || 0);

  if (choices.length === 0) {
    return (
      <div className="mt-2 flex flex-col items-center justify-center py-10 text-center rounded-2xl bg-gray-50/60">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 mb-2">
          <BarChartIcon />
        </div>
        <p className="text-sm text-gray-400">아직 응답 데이터가 없어요</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-2">
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4">
        <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> 응답 분포
        </p>
        <ReactApexChart options={barOptions} series={barSeries} type="bar" height={Math.max(choices.length * 48, 140)} />
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4">
        <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> 비율
        </p>
        <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={260} />
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

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

    // 오늘 / 어제 응답 수 (같은 로컬 날짜 기준)
    const rows = answerData?.list?.rows || [];
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const todayCount = rows.filter((r) => sameDay(new Date(r.createdAt), now)).length;
    const yesterdayCount = rows.filter((r) => sameDay(new Date(r.createdAt), yesterday)).length;
    const todayDelta = todayCount - yesterdayCount;

    return { totalResponses, questionCount, isActive, avgChoiceResponses, subjectiveCount, todayCount, yesterdayCount, todayDelta };
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

  // 응답 수 축 최대값을 정수 눈금으로 (작은 범위에서 소수점 눈금이 생기는 문제 방지)
  const trendYMax = Math.max(...trendData.values, 1);
  // 작은 범위(<=8)에서는 1칸=1명으로 고정, 큰 범위는 Apex 기본 눈금 사용
  const trendTickAmount = trendYMax <= 8 ? trendYMax : undefined;

  // 스탯 카드용 미니 스파크라인 옵션 (축·격자 없이 라인만)
  const sparkOptions = (color: string, area = true): ApexCharts.ApexOptions => ({
    chart: { type: area ? 'area' : 'line', sparkline: { enabled: true }, fontFamily: CHART_FONT },
    colors: [color],
    stroke: { curve: 'smooth', width: 2.5 },
    fill: area
      ? { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 100] } }
      : { type: 'solid', opacity: 0 },
    tooltip: { enabled: false },
    markers: { size: 0 },
  });
  const sparkTrend = trendData.values.slice(-8);

  const trendOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', fontFamily: CHART_FONT, zoom: { enabled: false } },
    colors: [INDIGO],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.02, stops: [0, 95] } },
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4, colors: ['#fff'], strokeColors: INDIGO, strokeWidth: 2, hover: { size: 6 } },
    xaxis: {
      categories: trendData.labels,
      labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      // 응답 수는 정수이므로 축 눈금도 정수로만 표기 (희소 데이터의 소수점 눈금 방지)
      max: trendTickAmount ? trendYMax : undefined,
      tickAmount: trendTickAmount,
      labels: { formatter: (v) => `${Math.round(v)}명`, style: { colors: '#94a3b8' } },
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => `${Math.round(v)}명` } },
  };

  // ── Per-question choice summary (stacked bar) ──────────────────────
  const choiceQuestions = (questionData?.questions || []).filter(
    (q) => q.type !== 'SUBJECTIVE_QUESTION' && (q.choices?.length || 0) > 0
  );

  const stackedOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false }, background: 'transparent', fontFamily: CHART_FONT },
    colors: CHART_COLORS,
    plotOptions: { bar: { horizontal: false, borderRadius: 6, borderRadiusApplication: 'end', columnWidth: '45%' } },
    xaxis: {
      categories: choiceQuestions.map((_, i) => `Q${i + 1}`),
      labels: { style: { fontSize: '12px', colors: '#94a3b8' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: (v) => `${v}명`, style: { colors: '#94a3b8' } } },
    legend: { position: 'bottom', fontSize: '12px', labels: { colors: '#64748b' }, markers: { radius: 12 } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
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

  // ApexCharts computes its width on first paint, before the flex layout settles,
  // which collapses the charts (hero/sparklines) until an interaction forces a reflow.
  // Nudge a resize a few times after data mounts so every chart lays out correctly.
  useEffect(() => {
    if (!hasData || isLoading) return undefined;
    const fire = () => window.dispatchEvent(new Event('resize'));
    const raf = requestAnimationFrame(fire);
    const timers = [80, 250, 600].map((ms) => setTimeout(fire, ms));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [hasData, isLoading, activeTab]);

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

  const handleSendEmail = async () => {
    if (!reportEmail.trim()) {
      setEmailError('이메일을 입력해 주세요');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reportEmail)) {
      setEmailError('올바른 이메일 형식이 아닙니다');
      return;
    }

    setEmailError('');
    setIsSending(true);

    try {
      // Render all tabs simultaneously for capture
      setIsPrinting(true);
      await new Promise((r) => setTimeout(r, 1500));

      const target = contentRef.current;
      if (!target) throw new Error('콘텐츠를 찾을 수 없습니다');

      const canvas = await html2canvas(target, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        height: target.scrollHeight,
        windowHeight: target.scrollHeight,
        logging: false,
      });

      setIsPrinting(false);

      const imgWidth = 210; // A4 mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let y = 0;
      while (y < imgHeight) {
        if (y > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.75), 'JPEG', 0, -y, imgWidth, imgHeight);
        y += pageHeight;
      }

      const pdfBlob = pdf.output('blob');
      await sendReportEmailAPI(surveyId, reportEmail, pdfBlob, questionData?.title || '설문');

      setShowEmailModal(false);
      setReportEmail('');
      alert('리포트가 이메일로 전송되었습니다.');
    } catch (err) {
      console.error(err);
      setEmailError('전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsPrinting(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 overflow-hidden print:overflow-visible print:block print:h-auto">
      {/* Mobile overlay backdrop */}
      {showSidebar && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div className={`
          ${isMobile
            ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-xl'
            : 'w-64 border-r border-gray-100 flex-shrink-0'
          } bg-white flex flex-col print:hidden
        `}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-800">내 설문</h2>
            {isMobile && (
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                aria-label="닫기"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 print:overflow-visible print:block">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 bg-white/70 backdrop-blur-md border-b border-slate-100 flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <MenuIcon />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <BarChartIcon />
              </span>
              <h1 className="text-base font-semibold text-slate-800">설문 분석</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowEmailModal(true); setEmailError(''); }}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 text-slate-600 transition-colors"
              disabled={!hasData}
            >
              <MailIcon />
              <span className="hidden sm:inline">이메일</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3.5 py-2 text-white text-sm rounded-xl transition-all hover:brightness-110 shadow-sm"
              style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}
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

        {!!surveyId && isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasData && !isLoading && (
          <>
            {/* Print-only header */}
            <div className="hidden print:block px-6 py-4 mb-2">
              <h1 className="text-xl font-bold text-gray-900">{questionData?.title || '설문 분석 결과'}</h1>
              <p className="text-xs text-gray-500 mt-1">생성일: {questionData?.createdAt ? formatDate(questionData.createdAt) : ''}</p>
            </div>

            {/* Content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto print:overflow-visible print:p-0">
              <div className="w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">

              {/* ── Greeting ── */}
              <div className="flex flex-wrap items-end justify-between gap-2 print:hidden">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {questionData?.title || '설문 분석'}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  stats.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stats.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {stats.isActive ? '진행중' : '종료됨'}
                </span>
              </div>

              {/* ── Hero: 응답 추이 (cashflow-style) ── */}
              <div className="bg-white rounded-3xl ring-1 ring-slate-100 shadow-sm p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-400">오늘 들어온 응답</p>
                    <div className="flex items-end gap-3 mt-1">
                      <span className="text-4xl font-extrabold text-slate-800 tabular-nums leading-none">
                        {stats.todayCount}
                        <span className="text-lg font-bold text-slate-400 ml-1">명</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold mb-0.5 ${
                        stats.todayDelta > 0 ? 'bg-emerald-50 text-emerald-600'
                        : stats.todayDelta < 0 ? 'bg-red-50 text-red-500'
                        : 'bg-slate-100 text-slate-400'
                      }`}>
                        {stats.todayDelta > 0 ? '▲' : stats.todayDelta < 0 ? '▼' : '—'}
                        {Math.abs(stats.todayDelta)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">전일 대비 · 전체 누적 {stats.totalResponses.toLocaleString()}명</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">
                    <CalendarIcon /> 최근 {trendData.labels.length}일
                  </span>
                </div>
                <ReactApexChart options={trendOptions} series={[{ name: '응답수', data: trendData.values }]} type="area" height={260} />
              </div>

              {/* ── Sparkline Stat Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
                {[
                  { label: '총 응답', value: stats.totalResponses.toLocaleString(), sub: '전체 누적', color: '#6366f1', icon: <UsersIcon />, ib: '#eef2ff', ic: '#6366f1' },
                  { label: '질문 수', value: stats.questionCount, sub: '설문 문항', color: '#8b5cf6', icon: <QuestionIcon />, ib: '#f5f3ff', ic: '#8b5cf6' },
                  { label: '평균 선택 응답', value: stats.avgChoiceResponses, sub: '객관식 평균', color: '#06b6d4', icon: <BarChartIcon />, ib: '#ecfeff', ic: '#06b6d4' },
                  { label: '주관식 응답', value: stats.subjectiveCount, sub: '텍스트 응답', color: '#f59e0b', icon: <TextIcon />, ib: '#fffbeb', ic: '#f59e0b' },
                ].map((card) => (
                  <div key={card.label} className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.ib, color: card.ic }}>
                        {card.icon}
                      </span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-800 tabular-nums leading-none">{card.value}</p>
                    <p className="text-xs text-slate-400 mt-1.5">{card.label}</p>
                    <div className="-mx-1 mt-2 h-9">
                      <ReactApexChart options={sparkOptions(card.color)} series={[{ data: sparkTrend }]} type="area" height={36} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Tabs (sticky) ── */}
              <div className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-2 bg-gradient-to-b from-slate-50/95 to-transparent backdrop-blur-sm print:hidden">
                <div className="inline-flex items-center gap-1 p-1 bg-white ring-1 ring-slate-100 shadow-sm rounded-xl">
                  {[
                    { id: 'question' as const, label: '질문별 분석' },
                    { id: 'response' as const, label: '응답별 보기' },
                    { id: 'trend' as const, label: '트렌드' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                      style={activeTab === tab.id ? { background: 'linear-gradient(135deg,#6366f1,#818cf8)' } : undefined}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── 질문별 탭 ── */}
              {(activeTab === 'question' || isPrinting) && (
                <>
                  {/* Stacked summary (only if multiple choice questions) */}
                  {stackedSeries.length > 0 && choiceQuestions.length > 1 && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100">
                      <h3 className="font-semibold text-gray-800 mb-1">전체 선택 응답 요약</h3>
                      <p className="text-xs text-gray-400 mb-4">객관식 질문 전체 응답 분포</p>
                      <ReactApexChart options={stackedOptions} series={stackedSeries} type="bar" height={240} />
                    </div>
                  )}

                  {/* Per-question cards */}
                  {questionData?.questions?.map((question, index) => (
                    <div key={question.questionId} className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100">
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
                <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
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
                  {/* Radial per-question completion */}
                  {choiceQuestions.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100">
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
                  <div className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100">
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
            </div>
          </>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">리포트 이메일 발송</h2>
            <p className="text-xs text-gray-400 mb-4">분석 결과 PDF를 이메일로 전송합니다</p>

            <label className="block text-xs font-medium text-gray-600 mb-1">받는 이메일</label>
            <input
              type="email"
              value={reportEmail}
              onChange={(e) => setReportEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
              placeholder="example@email.com"
              disabled={isSending}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />
            {emailError && <p className="mt-1.5 text-xs text-red-500">{emailError}</p>}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setShowEmailModal(false); setReportEmail(''); setEmailError(''); }}
                disabled={isSending}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="flex-1 px-4 py-2.5 text-sm bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    전송 중…
                  </>
                ) : (
                  <>
                    <MailIcon />
                    전송
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultPage;
