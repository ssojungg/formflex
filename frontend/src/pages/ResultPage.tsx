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

const INDIGO = '#5B4CF5';

// 대부분의 차트는 "크기 비교(단일 계열)"이므로 색의 역할은 sequential(한 가지 색조)이다.
// 이전에 쓰던 8색 순환 팔레트는 색을 '순위'에 배정하는 안티패턴이었고,
// 접근성 검증에서 명도 대역·CVD 분리·일반시야 분리 3개 항목이 FAIL이었다.
// 막대 길이가 이미 크기를 인코딩하므로 한 색으로 통일하는 것이 가장 안전하고 깔끔하다.
const SEQ_TRACK = '#F0EDFE'; // 미터 트랙(배경)

// 공통 시각 토큰 — 카드 표면/미터 마크를 한곳에서 관리한다.
const CARD =
  'bg-white rounded-[26px] border border-[#EEECF7] ' +
  'shadow-[0_1px_2px_rgba(20,20,43,0.03),0_14px_32px_-22px_rgba(91,76,245,0.35)]';
const FILL_GRADIENT = 'linear-gradient(90deg,#6E5FF7,#5B4CF5)';
const DIM_FILL = '#C9C2FB';

// 섹션 제목 앞의 액센트 룰
function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <>
      <div className="flex items-center gap-2.5 mb-0.5">
        <span
          className="w-[3px] h-[15px] rounded-full shrink-0"
          style={{ background: 'linear-gradient(180deg,#5B4CF5,#A79EFB)' }}
        />
        <h3 className="text-[16.5px] font-bold tracking-[-0.01em] text-[#14142B]">{title}</h3>
      </div>
      {desc && <p className="ml-3 mb-5 text-[12.5px] text-[#8E8CA8]">{desc}</p>}
    </>
  );
}

// 미터 한 줄 — 선택지/질문 목록이 같은 마크를 공유한다.
function Meter({ pct, dim = false }: { pct: number; dim?: boolean }) {
  return (
    <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: SEQ_TRACK }}>
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: dim ? DIM_FILL : FILL_GRADIENT,
          boxShadow: dim ? undefined : '0 1px 3px rgba(91,76,245,0.32)',
        }}
      />
    </div>
  );
}
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

// ── Choice distribution ────────────────────────────────────────────────
// 단일 계열(하나의 질문에 대한 선택지 분포)이므로 크기 비교가 유일한 임무다.
// 막대 + 도넛으로 같은 값을 두 번 그리던 구성을 하나의 미터 목록으로 합쳤다.
// ApexCharts 대신 순수 HTML/CSS로 그려 라벨 겹침·초기 폭 계산 문제도 함께 사라진다.
function ChoiceChart({ question }: { question: QuestionData }) {
  const choices = question.choices || [];
  const total = choices.reduce((s, c) => s + (c.count || 0), 0);
  const max = choices.reduce((m, c) => Math.max(m, c.count || 0), 0);

  if (choices.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center py-11 text-center rounded-[18px] border border-dashed border-[#DEDAF4] bg-[#FBFAFF]">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
          style={{ backgroundColor: SEQ_TRACK, color: INDIGO }}
        >
          <BarChartIcon />
        </div>
        <p className="text-[13.5px] font-semibold text-[#4A4A68]">아직 응답 데이터가 없어요</p>
        <p className="mt-1 text-xs text-[#8E8CA8]">응답이 들어오면 분포가 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mt-5 mb-4 pt-4 border-t border-[#EEECF7]">
        <span className="text-xs font-bold tracking-wide text-[#8E8CA8]">응답 분포</span>
        <span className="text-xs text-[#8E8CA8]">{total}명 응답</span>
      </div>

      <ul className="flex flex-col gap-[17px]">
        {choices.map((c) => {
          const count = c.count || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const isTop = count > 0 && count === max;
          return (
            <li key={c.option}>
              <div className="flex items-baseline justify-between gap-3.5 mb-2">
                <span
                  className={`text-sm leading-[1.4] break-words ${
                    isTop ? 'text-[#14142B] font-bold' : 'text-[#4A4A68] font-medium'
                  }`}
                >
                  {isTop && (
                    <span
                      className="inline-flex items-center h-[18px] px-[7px] mr-[7px] rounded-md text-[10.5px] font-extrabold align-[1px]"
                      style={{ backgroundColor: SEQ_TRACK, color: '#4C3DE8' }}
                    >
                      1위
                    </span>
                  )}
                  {c.option}
                </span>
                <span className="shrink-0 whitespace-nowrap text-[12.5px] tabular-nums text-[#8E8CA8]">
                  <span
                    className="text-[15px] font-extrabold tracking-[-0.02em]"
                    style={{ color: isTop ? '#4C3DE8' : '#4A4A68' }}
                  >
                    {Math.round(pct)}%
                  </span>
                  {` · ${count}명`}
                </span>
              </div>
              <Meter pct={pct} dim={!isTop} />
            </li>
          );
        })}
      </ul>
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

  // 이전에는 서로 다른 질문의 선택지를 한 칸에 누적(stacked)했는데,
  // Q1의 "기초"와 Q2의 "완전 처음이에요"는 같은 축으로 더할 수 있는 값이 아니라
  // 차트가 의미를 갖지 못했고 범례 라벨도 서로 겹쳤다.
  // 질문별 "총 응답 수" 비교(단일 계열 크기 비교)로 바꿔 의미와 가독성을 회복한다.
  const questionSummary = choiceQuestions.map((q, i) => {
    const optionTotal = (q.choices || []).reduce((sum, c) => sum + (c.count || 0), 0);
    const top = (q.choices || []).reduce<{ option: string; count: number } | null>(
      (best, c) => (!best || (c.count || 0) > best.count ? { option: c.option, count: c.count || 0 } : best),
      null,
    );
    return { key: q.questionId, label: `Q${i + 1}`, content: q.content, total: optionTotal, top };
  });
  const questionSummaryMax = questionSummary.reduce((m, q) => Math.max(m, q.total), 0);

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

              {/* ── Hero: 응답 추이 ── */}
              <div
                className={`${CARD} relative overflow-hidden p-7 md:p-8`}
                style={{
                  background:
                    'radial-gradient(120% 140% at 88% -20%, rgba(91,76,245,0.13), transparent 58%),' +
                    'linear-gradient(158deg,#FBFAFF 0%,#FFFFFF 60%)',
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[12.5px] font-medium text-[#8E8CA8]">오늘 들어온 응답</p>
                    <div className="flex items-end gap-3 mt-2.5">
                      <span className="text-[52px] font-extrabold text-[#14142B] tabular-nums leading-none tracking-[-0.035em]">
                        {stats.todayCount}
                        <span className="text-[19px] font-bold text-[#8E8CA8] ml-1.5 tracking-normal">명</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[9px] text-xs font-bold mb-[7px] ${
                          stats.todayDelta > 0
                            ? 'bg-[#E8FAF0] text-[#0E9F6E]'
                            : stats.todayDelta < 0
                            ? 'bg-[#FDECEC] text-[#E14747]'
                            : 'bg-[#F2F1F7] text-[#9795AC]'
                        }`}
                      >
                        {stats.todayDelta > 0 ? '▲' : stats.todayDelta < 0 ? '▼' : '—'}
                        {Math.abs(stats.todayDelta)}
                      </span>
                    </div>
                    <p className="mt-3 text-[12.5px] text-[#8E8CA8]">
                      전일 대비 · 전체 누적{' '}
                      <b className="font-semibold text-[#4A4A68]">{stats.totalResponses.toLocaleString()}명</b>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/75 text-[#4A4A68] border border-[#EEECF7] backdrop-blur-sm">
                    <CalendarIcon /> 최근 {trendData.labels.length}일
                  </span>
                </div>

                {trendData.values.length >= 2 ? (
                  <div className="mt-4">
                    <ReactApexChart
                      options={trendOptions}
                      series={[{ name: '응답수', data: trendData.values }]}
                      type="area"
                      height={260}
                    />
                  </div>
                ) : (
                  // 데이터 포인트가 1개 이하면 추이선이 성립하지 않는다.
                  // 260px 빈 격자를 그리는 대신 상태를 문장으로 알린다.
                  <div className="mt-6 rounded-[18px] border border-dashed border-[#DEDAF4] bg-white/60 py-8 text-center">
                    <div
                      className="w-[38px] h-[38px] rounded-xl flex items-center justify-center mx-auto mb-2.5"
                      style={{ backgroundColor: SEQ_TRACK, color: INDIGO }}
                    >
                      <BarChartIcon />
                    </div>
                    <p className="text-[13.5px] font-semibold text-[#4A4A68]">
                      {stats.totalResponses > 0 ? '추이를 그리려면 이틀 이상의 응답이 필요해요' : '아직 응답이 없어요'}
                    </p>
                    <p className="mt-1 text-xs text-[#8E8CA8]">응답이 쌓이면 일자별 추이가 여기에 표시됩니다</p>
                  </div>
                )}
              </div>

              {/* ── Stat Cards ── */}
              {/* 이전에는 네 카드 모두 같은 '일자별 응답수' 스파크라인을 그렸다.
                  '질문 수'나 '주관식 응답'의 추세가 아닌데 추세처럼 보여 오해를 준다.
                  실제로 시간에 따라 변하는 '총 응답'에만 스파크라인을 남긴다. */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 print:hidden">
                {[
                  { label: '총 응답', value: stats.totalResponses.toLocaleString(), icon: <UsersIcon />, trend: true },
                  { label: '질문 수', value: stats.questionCount, icon: <QuestionIcon />, trend: false },
                  { label: '평균 선택 응답', value: stats.avgChoiceResponses, icon: <BarChartIcon />, trend: false },
                  { label: '주관식 응답', value: stats.subjectiveCount, icon: <TextIcon />, trend: false },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="relative overflow-hidden bg-white rounded-[20px] border border-[#EEECF7] p-[19px] shadow-[0_1px_2px_rgba(20,20,43,0.03)] transition-shadow hover:shadow-[0_10px_24px_-16px_rgba(91,76,245,0.5)]"
                  >
                    <span
                      className="absolute inset-x-0 top-0 h-[2.5px] opacity-90"
                      style={{ background: 'linear-gradient(90deg,#5B4CF5,#A79EFB)' }}
                    />
                    <span
                      className="w-[34px] h-[34px] rounded-[11px] flex items-center justify-center mb-3.5"
                      style={{ backgroundColor: SEQ_TRACK, color: INDIGO }}
                    >
                      {card.icon}
                    </span>
                    <p className="text-[27px] font-extrabold text-[#14142B] tabular-nums leading-none tracking-[-0.03em]">
                      {card.value}
                    </p>
                    <p className="text-xs font-medium text-[#8E8CA8] mt-[7px]">{card.label}</p>
                    {card.trend && sparkTrend.length >= 2 && (
                      <div className="-mx-1 mt-2 h-9">
                        <ReactApexChart options={sparkOptions(INDIGO)} series={[{ data: sparkTrend }]} type="area" height={36} />
                      </div>
                    )}
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
                  {/* 질문별 응답 요약 (단일 계열 크기 비교) */}
                  {questionSummary.length > 1 && (
                    <div className={`${CARD} p-7`}>
                      <SectionHead title="질문별 응답 요약" desc="객관식 질문별 총 응답 수와 최다 선택지" />
                      <ul className="flex flex-col gap-[19px]">
                        {questionSummary.map((q) => {
                          const pct = questionSummaryMax > 0 ? (q.total / questionSummaryMax) * 100 : 0;
                          return (
                            <li key={q.key}>
                              <div className="flex items-center justify-between gap-3.5 mb-2">
                                <span className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className="inline-flex items-center justify-center min-w-[26px] h-5 px-1.5 rounded-[7px] text-[11px] font-extrabold shrink-0"
                                    style={{ backgroundColor: SEQ_TRACK, color: '#4C3DE8' }}
                                  >
                                    {q.label}
                                  </span>
                                  <span className="text-sm font-medium text-[#4A4A68] truncate">{q.content}</span>
                                </span>
                                <span className="shrink-0 text-[12.5px] tabular-nums text-[#8E8CA8]">
                                  <b className="text-[15px] font-extrabold text-[#4A4A68] tracking-[-0.02em]">{q.total}</b>명
                                </span>
                              </div>
                              <Meter pct={pct} />
                              {q.top && q.top.count > 0 && (
                                <p className="mt-2 text-xs text-[#8E8CA8] truncate">
                                  최다 · <b className="font-semibold text-[#4A4A68]">{q.top.option}</b> ({q.top.count}명)
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Per-question cards */}
                  {questionData?.questions?.map((question, index) => (
                    <div key={question.questionId} className={`${CARD} p-7`}>
                      <div className="flex items-start gap-3">
                        <span
                          className="shrink-0 w-[27px] h-[27px] rounded-[9px] text-white text-xs font-extrabold flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(140deg,#5B4CF5,#7C6EF8)',
                            boxShadow: '0 3px 8px -2px rgba(91,76,245,0.5)',
                          }}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-[#14142B] leading-[1.35] tracking-[-0.01em]">
                            {question.content}
                          </p>
                          <span className="inline-block mt-1.5 px-2.5 py-[3px] rounded-[7px] bg-[#F5F4FB] text-[11px] font-semibold text-[#8E8CA8]">
                            {typeLabel(question.type)}
                          </span>
                        </div>
                        <span className="shrink-0 text-xs text-[#8E8CA8]">
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
                  {/* 질문별 응답 비교 — radialBar는 각도로 크기를 인코딩해 비교가 어렵고
                      순위별로 색을 순환시키는 문제도 있어 공통 미터 목록으로 통일했다. */}
                  {questionSummary.length > 0 && (
                    <div className={`${CARD} p-7`}>
                      <SectionHead title="질문별 응답 비교" desc="각 객관식 질문의 총 응답 수" />
                      <ul className="flex flex-col gap-[19px]">
                        {questionSummary.map((q) => {
                          const pct = questionSummaryMax > 0 ? (q.total / questionSummaryMax) * 100 : 0;
                          return (
                            <li key={q.key}>
                              <div className="flex items-center justify-between gap-3.5 mb-2">
                                <span className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className="inline-flex items-center justify-center min-w-[26px] h-5 px-1.5 rounded-[7px] text-[11px] font-extrabold shrink-0"
                                    style={{ backgroundColor: SEQ_TRACK, color: '#4C3DE8' }}
                                  >
                                    {q.label}
                                  </span>
                                  <span className="text-sm font-medium text-[#4A4A68] truncate">{q.content}</span>
                                </span>
                                <span className="shrink-0 text-[12.5px] tabular-nums text-[#8E8CA8]">
                                  <b className="text-[15px] font-extrabold text-[#4A4A68] tracking-[-0.02em]">{q.total}</b>명
                                </span>
                              </div>
                              <Meter pct={pct} />
                            </li>
                          );
                        })}
                      </ul>
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
