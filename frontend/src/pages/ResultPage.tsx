import { useState, useMemo, useRef, useEffect, Fragment } from 'react';
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="9" y1="4" x2="9" y2="20" />
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
const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const PRIMARY = '#3182F6';
const CHART_FONT =
  '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const CARD = 'bg-white rounded-2xl border border-secondary-200';

function CardHead({ title, desc, right }: { title: string; desc?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h3 className="text-[15px] font-bold tracking-tight text-secondary-900">{title}</h3>
        {desc && <p className="mt-0.5 text-[13px] text-secondary-500">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

function Meter({ pct, dim = false, warn = false }: { pct: number; dim?: boolean; warn?: boolean }) {
  const fill = warn ? 'bg-amber-400' : dim ? 'bg-primary-200' : 'bg-primary-500';
  return (
    <div className="h-2 w-full rounded-full overflow-hidden bg-secondary-100">
      <div className={`h-full rounded-full transition-[width] duration-700 ease-out ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function KpiValue({ value, unit, delta }: { value: string | number; unit?: string; delta?: number }) {
  return (
    <div className="mt-1.5 flex items-baseline gap-2">
      <span className="text-[26px] font-bold tracking-[-0.03em] text-secondary-900 tabular-nums leading-none">{value}</span>
      {unit && <span className="text-sm text-secondary-500">{unit}</span>}
      {delta !== undefined && (
        <span
          className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
            delta > 0 ? 'bg-emerald-50 text-emerald-600' : delta < 0 ? 'bg-red-50 text-red-500' : 'bg-secondary-100 text-secondary-500'
          }`}
          title="어제 대비"
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </div>
  );
}

function EmptyBox({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-secondary-200 bg-secondary-50">
      <span className="w-9 h-9 rounded-lg bg-white border border-secondary-200 text-secondary-400 flex items-center justify-center mb-2.5">
        <BarChartIcon />
      </span>
      <p className="text-[13.5px] font-semibold text-secondary-700">{title}</p>
      <p className="mt-1 text-xs text-secondary-500">{desc}</p>
    </div>
  );
}

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

// 응답 원본의 칸은 무응답이면 '', 답이 있으면 문자열 배열(복수 선택은 여러 개)로 온다.
type Cell = string | string[] | null | undefined;

function cellValues(cell: Cell): string[] {
  if (Array.isArray(cell)) return cell.filter((v) => v != null && String(v).trim() !== '').map(String);
  if (cell == null) return [];
  const text = String(cell).trim();
  return text ? [text] : [];
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

function objectParticle(word: string) {
  const code = word.trim().slice(-1).charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 === 0 ? '를' : '을';
  return '을(를)';
}

function hourLabel(hour: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour < 12 ? '오전' : '오후'} ${h}시`;
}

function relativeTime(dateStr: string) {
  const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(dateStr);
}

// ── Choice distribution ────────────────────────────────────────────────
// 한 질문의 선택지 분포는 단일 계열 크기 비교라 한 가지 색의 미터 목록으로 그린다.
function ChoiceChart({ question }: { question: QuestionData }) {
  const choices = question.choices || [];
  const total = choices.reduce((s, c) => s + (c.count || 0), 0);
  const max = choices.reduce((m, c) => Math.max(m, c.count || 0), 0);

  if (choices.length === 0 || total === 0) {
    return (
      <div className="mt-5">
        <EmptyBox title="아직 응답이 없어요" desc="응답이 들어오면 선택지 분포가 여기에 표시돼요" />
      </div>
    );
  }

  return (
    <ul className="mt-5 flex flex-col gap-4">
      {choices.map((c) => {
        const count = c.count || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const isTop = count > 0 && count === max;
        return (
          <li key={c.option}>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span className={`text-sm leading-snug break-words ${isTop ? 'text-secondary-900 font-semibold' : 'text-secondary-600'}`}>
                {c.option}
              </span>
              <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-secondary-500">
                <span className={`text-sm font-bold ${isTop ? 'text-primary-600' : 'text-secondary-700'}`}>{Math.round(pct)}%</span>
                {` · ${count}명`}
              </span>
            </div>
            <Meter pct={pct} dim={!isTop} />
          </li>
        );
      })}
    </ul>
  );
}

// ── Subjective Answers ─────────────────────────────────────────────────
function SubjectiveAnswers({ question }: { question: QuestionData }) {
  const [showAll, setShowAll] = useState(false);
  const answers = question.answers || [];
  const shown = showAll ? answers : answers.slice(0, 5);

  if (answers.length === 0) {
    return (
      <div className="mt-5">
        <EmptyBox title="아직 응답이 없어요" desc="주관식 답변이 들어오면 여기에 모여요" />
      </div>
    );
  }

  const wordFreq: Record<string, number> = {};
  answers.forEach((a) => {
    a.content.split(/\s+/).filter((w) => w.length > 1).forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });
  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="mt-5 space-y-5">
      {topWords.length > 0 && (
        <div>
          <p className="text-xs font-medium text-secondary-500 mb-2">자주 나온 단어</p>
          <div className="flex flex-wrap gap-1.5">
            {topWords.map(([word, count], i) => (
              <span
                key={word}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[13px] ${
                  i === 0 ? 'bg-primary-50 text-primary-700 font-semibold' : 'bg-secondary-100 text-secondary-700'
                }`}
              >
                {word}
                <span className={`text-[11px] tabular-nums ${i === 0 ? 'text-primary-500' : 'text-secondary-400'}`}>{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-secondary-500 mb-2">답변 {answers.length}개</p>
        <ul className="divide-y divide-secondary-100 rounded-xl border border-secondary-200">
          {shown.map((a, i) => (
            <li key={a.answerId} className="flex gap-3 px-4 py-3">
              <span className="text-xs text-secondary-400 mt-0.5 shrink-0 tabular-nums w-5">{i + 1}</span>
              <p className="text-sm text-secondary-800 leading-relaxed">{a.content}</p>
            </li>
          ))}
        </ul>
        {answers.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 text-sm text-secondary-600 hover:text-secondary-900 font-medium"
          >
            {showAll ? '접기' : `${answers.length - 5}개 더 보기`}
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

  const [activeTab, setActiveTab] = useState<'question' | 'cross' | 'rate' | 'response'>('question');
  const [crossRowId, setCrossRowId] = useState<number | null>(null);
  const [crossColId, setCrossColId] = useState<number | null>(null);
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
  const trendTickAmount = trendYMax <= 8 ? trendYMax : undefined;

  const sparkOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', sparkline: { enabled: true }, fontFamily: CHART_FONT },
    colors: [PRIMARY],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0, stops: [0, 100] } },
    tooltip: { enabled: false },
    markers: { size: 0 },
  };
  const sparkTrend = trendData.values.slice(-8);

  const trendOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', fontFamily: CHART_FONT, zoom: { enabled: false } },
    colors: [PRIMARY],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.22, opacityTo: 0, stops: [0, 95] } },
    stroke: { curve: 'smooth', width: 2.5 },
    markers: { size: 0, colors: ['#fff'], strokeColors: PRIMARY, strokeWidth: 2, hover: { size: 5 } },
    xaxis: {
      categories: trendData.labels,
      labels: { style: { fontSize: '11px', colors: '#8b95a1' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 0,
      max: trendTickAmount ? trendYMax : undefined,
      tickAmount: trendTickAmount,
      labels: { formatter: (v) => `${Math.round(v)}`, style: { colors: '#8b95a1' } },
    },
    grid: { borderColor: '#f2f4f6', strokeDashArray: 0, padding: { left: 4, right: 8 } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => `${Math.round(v)}명` } },
  };

  // ── Per-question summary ───────────────────────────────────────────
  // 서로 다른 질문의 선택지는 더할 수 없으므로, 질문별 "총 응답 수"만 비교한다.
  const choiceQuestions = (questionData?.questions || []).filter(
    (q) => q.type !== 'SUBJECTIVE_QUESTION' && (q.choices?.length || 0) > 0
  );
  const allQuestions = questionData?.questions || [];
  const qNumber = new Map(allQuestions.map((q, i) => [q.questionId, i + 1]));

  const questionSummary = choiceQuestions.map((q) => {
    const optionTotal = (q.choices || []).reduce((sum, c) => sum + (c.count || 0), 0);
    const top = (q.choices || []).reduce<{ option: string; count: number } | null>(
      (best, c) => (!best || (c.count || 0) > best.count ? { option: c.option, count: c.count || 0 } : best),
      null,
    );
    return { key: q.questionId, label: `Q${qNumber.get(q.questionId)}`, content: q.content, total: optionTotal, top };
  });

  // ── Deeper analytics from raw response rows ────────────────────────
  const rows = answerData?.list?.rows || [];
  const head = answerData?.list?.head || [];
  // 응답 원본의 열 순서는 질문 순서와 같지만, 어긋날 때를 대비해 질문 내용으로 다시 맞춘다.
  const columnOf = (q: QuestionData) => {
    const i = allQuestions.indexOf(q);
    return head[i] === q.content ? i : head.indexOf(q.content);
  };
  const cellsOf = (row: (typeof rows)[number]) => row.responses as unknown as Cell[];

  const responseRates = allQuestions.map((q) => {
    const col = columnOf(q);
    const answered = col < 0 ? 0 : rows.filter((r) => cellValues(cellsOf(r)[col]).length > 0).length;
    return {
      key: q.questionId,
      label: `Q${qNumber.get(q.questionId)}`,
      content: q.content,
      answered,
      rate: rows.length > 0 ? Math.round((answered / rows.length) * 100) : 0,
    };
  });
  const avgResponseRate =
    rows.length > 0 && responseRates.length > 0
      ? Math.round(responseRates.reduce((s, r) => s + r.rate, 0) / responseRates.length)
      : null;
  const lowestRate =
    rows.length > 0 && responseRates.length > 0
      ? responseRates.reduce((low, r) => (r.rate < low.rate ? r : low))
      : null;

  const heatmap = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => new Array<number>(24).fill(0));
    (answerData?.list?.rows || []).forEach((r) => {
      const d = new Date(r.createdAt);
      grid[(d.getDay() + 6) % 7][d.getHours()] += 1;
    });
    let max = 0;
    let peakDay = -1;
    let peakHour = -1;
    for (let day = 0; day < 7; day += 1) {
      for (let hour = 0; hour < 24; hour += 1) {
        if (grid[day][hour] > max) {
          max = grid[day][hour];
          peakDay = day;
          peakHour = hour;
        }
      }
    }
    return { grid, max, peakDay, peakHour };
  }, [answerData]);

  const deadlineInfo = useMemo(() => {
    if (!questionData?.deadline) return null;
    const end = new Date(questionData.deadline);
    if (Number.isNaN(end.getTime())) return null;
    const dayMs = 86400000;
    const now = new Date();
    const toDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const daysLeft = Math.round((toDay(end) - toDay(now)) / dayMs);
    const start = questionData.createdAt ? new Date(questionData.createdAt) : now;
    const totalDays = Math.max(1, Math.round((toDay(end) - toDay(start)) / dayMs));
    const elapsed = Math.min(totalDays, Math.max(0, Math.round((toDay(now) - toDay(start)) / dayMs)));
    return {
      label: daysLeft > 0 ? `D-${daysLeft}` : daysLeft === 0 ? 'D-Day' : '마감',
      endText: end.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
      pct: Math.round((elapsed / totalDays) * 100),
      closed: daysLeft < 0,
    };
  }, [questionData]);

  const chronological = [...rows].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const recentResponses = chronological
    .map((row, i) => {
      const first = cellsOf(row).map(cellValues).find((v) => v.length > 0);
      return { key: `${row.userId}-${i}`, no: i + 1, time: row.createdAt, preview: first ? first.join(', ') : '' };
    })
    .slice(-5)
    .reverse();

  // ── Crosstab between two choice questions ──────────────────────────
  const crossRowQ = choiceQuestions.find((q) => q.questionId === crossRowId) || choiceQuestions[0];
  const crossColQ =
    choiceQuestions.find((q) => q.questionId === crossColId && q !== crossRowQ) ||
    choiceQuestions.find((q) => q !== crossRowQ);
  const crosstab = (() => {
    if (!crossRowQ || !crossColQ) return null;
    const rowOpts = (crossRowQ.choices || []).map((c) => c.option);
    const colOpts = (crossColQ.choices || []).map((c) => c.option);
    const counts = rowOpts.map(() => colOpts.map(() => 0));
    const ra = columnOf(crossRowQ);
    const cb = columnOf(crossColQ);
    if (ra >= 0 && cb >= 0) {
      rows.forEach((r) => {
        const cells = cellsOf(r);
        const bv = cellValues(cells[cb]);
        cellValues(cells[ra]).forEach((a) => {
          const ai = rowOpts.indexOf(a);
          if (ai < 0) return;
          bv.forEach((b) => {
            const bi = colOpts.indexOf(b);
            if (bi >= 0) counts[ai][bi] += 1;
          });
        });
      });
    }
    const rowTotals = counts.map((line) => line.reduce((s, v) => s + v, 0));
    let best: { a: string; b: string; share: number; ai: number; bi: number } | null = null;
    for (let ai = 0; ai < rowOpts.length; ai += 1) {
      for (let bi = 0; bi < colOpts.length; bi += 1) {
        if (rowTotals[ai] >= 3) {
          const share = Math.round((counts[ai][bi] / rowTotals[ai]) * 100);
          if (!best || share > best.share) best = { a: rowOpts[ai], b: colOpts[bi], share, ai, bi };
        }
      }
    }
    return { rowOpts, colOpts, counts, rowTotals, best };
  })();

  const isLoading = qLoading || aLoading;
  const hasData = !!surveyId && (!!questionData || !!answerData);

  // ApexCharts computes its width on first paint, before the flex layout settles,
  // which collapses the charts until an interaction forces a reflow.
  useEffect(() => {
    if (!hasData || isLoading) return undefined;
    const fire = () => window.dispatchEvent(new Event('resize'));
    const raf = requestAnimationFrame(fire);
    const timers = [80, 250, 600].map((ms) => setTimeout(fire, ms));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [hasData, isLoading, activeTab, showSidebar]);

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

  const tabs = [
    { id: 'question' as const, label: '질문별 분석' },
    { id: 'cross' as const, label: '교차 분석' },
    { id: 'rate' as const, label: '응답률' },
    { id: 'response' as const, label: '응답 원본' },
  ];

  const kpiCell = 'px-5 py-4 min-h-[112px] flex flex-col';
  const kpiLabel = 'text-[13px] text-secondary-500';
  const kpiFoot = 'mt-auto pt-2 text-xs text-secondary-400 truncate';
  const selectClass =
    'h-10 w-full sm:flex-1 min-w-0 px-3 rounded-lg border border-secondary-200 bg-white text-sm text-secondary-800 outline-none focus:border-primary-500';

  return (
    <div className="flex h-full bg-secondary-50 overflow-hidden print:overflow-visible print:block print:h-auto">
      {/* Mobile overlay backdrop */}
      {showSidebar && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Survey list */}
      {showSidebar && (
        <aside className={`
          ${isMobile
            ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-xl'
            : 'w-64 border-r border-secondary-200 flex-shrink-0'
          } bg-white flex flex-col print:hidden
        `}>
          <div className="h-16 flex items-center justify-between px-5 flex-shrink-0">
            <h2 className="text-sm font-semibold text-secondary-900">
              내 설문 <span className="ml-1 font-normal text-secondary-400 tabular-nums">{mySurveys.length}</span>
            </h2>
            {isMobile && (
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-500"
                aria-label="닫기"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-0.5">
            {mySurveys.length === 0 && (
              <p className="px-3 py-6 text-sm text-secondary-500">아직 만든 설문이 없어요.</p>
            )}
            {mySurveys.map((survey) => {
              const isSelected = survey.surveyId === surveyId;
              const isActive = new Date(survey.deadline) > new Date();
              return (
                <button
                  key={survey.surveyId}
                  onClick={() => navigate(`/result?id=${survey.surveyId}`)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    isSelected ? 'bg-secondary-100' : 'hover:bg-secondary-50'
                  }`}
                >
                  <p className={`text-sm truncate ${isSelected ? 'font-semibold text-secondary-900' : 'text-secondary-700'}`}>
                    {survey.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-secondary-500">
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-secondary-300'}`} />
                    {isActive ? '진행중' : '종료'}
                    <span className="text-secondary-300">·</span>
                    <span className="tabular-nums">{survey.attendCount || 0}명</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 print:overflow-visible print:block">
        {/* Header */}
        <header className="h-16 flex items-center justify-between gap-3 px-4 md:px-6 bg-white border-b border-secondary-200 flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-500"
              aria-label="설문 목록 열기/닫기"
            >
              <MenuIcon />
            </button>
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="text-secondary-500 shrink-0">분석</span>
              {questionData?.title && (
                <>
                  <span className="text-secondary-300">/</span>
                  <span className="font-semibold text-secondary-900 truncate">{questionData.title}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setShowEmailModal(true); setEmailError(''); }}
              className="flex items-center gap-2 h-9 px-3 border border-secondary-200 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors disabled:opacity-40"
              disabled={!hasData}
            >
              <MailIcon />
              <span className="hidden sm:inline">메일로 보내기</span>
            </button>
            <button
              onClick={handleExport}
              disabled={!hasData}
              className="flex items-center gap-2 h-9 px-3.5 bg-secondary-900 text-white text-sm font-semibold rounded-lg hover:bg-secondary-800 transition-colors disabled:opacity-40"
            >
              <DownloadIcon />
              <span className="hidden sm:inline">PDF 저장</span>
            </button>
          </div>
        </header>

        {/* No survey selected */}
        {!surveyId && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-xs">
              <span className="w-12 h-12 rounded-xl bg-white border border-secondary-200 text-secondary-400 flex items-center justify-center mx-auto mb-4">
                <BarChartIcon />
              </span>
              <p className="font-semibold text-secondary-900">분석할 설문을 골라 주세요</p>
              <p className="mt-1 text-sm text-secondary-500">왼쪽 목록에서 설문을 선택하면 결과가 여기에 표시돼요.</p>
            </div>
          </div>
        )}

        {!!surveyId && isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasData && !isLoading && (
          <>
            {/* Print-only header */}
            <div className="hidden print:block px-6 py-4 mb-2">
              <h1 className="text-xl font-bold text-secondary-900">{questionData?.title || '설문 분석 결과'}</h1>
              <p className="text-xs text-secondary-500 mt-1">생성일: {questionData?.createdAt ? formatDate(questionData.createdAt) : ''}</p>
            </div>

            <div ref={contentRef} className="flex-1 overflow-y-auto print:overflow-visible print:p-0">
              <div className="w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-5">

                {/* ── Title ── */}
                <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
                  <div className="min-w-0">
                    <h1 className="text-[24px] lg:text-[26px] font-bold tracking-[-0.02em] text-secondary-900 break-keep">
                      {questionData?.title || '설문 분석'}
                    </h1>
                    <div className="mt-1.5 flex items-center gap-2 text-[13px] text-secondary-500">
                      <span className={`inline-flex items-center gap-1.5 font-medium ${stats.isActive ? 'text-emerald-600' : 'text-secondary-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stats.isActive ? 'bg-success' : 'bg-secondary-300'}`} />
                        {stats.isActive ? '진행중' : '종료'}
                      </span>
                      {questionData?.createdAt && (
                        <>
                          <span className="text-secondary-300">·</span>
                          <span>{formatDate(questionData.createdAt)} 생성</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── KPI strip ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-secondary-200 rounded-2xl border border-secondary-200 overflow-hidden [&>*]:bg-white">
                  <div className={kpiCell}>
                    <p className={kpiLabel}>총 응답</p>
                    <KpiValue value={stats.totalResponses.toLocaleString()} unit="명" />
                    {sparkTrend.length >= 2 ? (
                      <div className="mt-auto -mx-1 h-8 print:hidden">
                        <ReactApexChart options={sparkOptions} series={[{ data: sparkTrend }]} type="area" height={32} />
                      </div>
                    ) : (
                      <p className={kpiFoot}>질문 {stats.questionCount}개</p>
                    )}
                  </div>
                  <div className={kpiCell}>
                    <p className={kpiLabel}>오늘 응답</p>
                    <KpiValue value={stats.todayCount} unit="명" delta={stats.todayDelta} />
                    <p className={kpiFoot}>어제 {stats.yesterdayCount}명</p>
                  </div>
                  <div className={kpiCell}>
                    <p className={kpiLabel}>평균 응답률</p>
                    <KpiValue value={avgResponseRate ?? '—'} unit={avgResponseRate === null ? undefined : '%'} />
                    <p className={kpiFoot}>
                      {lowestRate && lowestRate.rate < 100
                        ? `가장 낮은 질문 ${lowestRate.label} · ${lowestRate.rate}%`
                        : `질문 ${stats.questionCount}개 기준`}
                    </p>
                  </div>
                  <div className={kpiCell}>
                    <p className={kpiLabel}>마감까지</p>
                    <KpiValue value={deadlineInfo?.label ?? '—'} />
                    {deadlineInfo ? (
                      <div className="mt-auto pt-2">
                        <div className="h-1.5 rounded-full bg-secondary-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${deadlineInfo.closed ? 'bg-secondary-300' : 'bg-primary-500'}`}
                            style={{ width: `${deadlineInfo.closed ? 100 : deadlineInfo.pct}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-secondary-400">{deadlineInfo.endText} 마감</p>
                      </div>
                    ) : (
                      <p className={kpiFoot}>마감일이 없어요</p>
                    )}
                  </div>
                </div>

                {/* ── Trend + summary ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className={`${CARD} p-5 lg:p-6 lg:col-span-2 min-w-0`}>
                    <CardHead
                      title="일자별 응답"
                      desc={`누적 ${stats.totalResponses.toLocaleString()}명`}
                      right={
                        trendData.labels.length > 0 ? (
                          <span className="shrink-0 px-2.5 py-1 rounded-md bg-secondary-100 text-xs font-medium text-secondary-600">
                            {trendData.labels.length}일
                          </span>
                        ) : undefined
                      }
                    />
                    {trendData.values.length >= 2 ? (
                      <div className="-mx-2">
                        <ReactApexChart
                          options={trendOptions}
                          series={[{ name: '응답', data: trendData.values }]}
                          type="area"
                          height={240}
                        />
                      </div>
                    ) : (
                      <EmptyBox
                        title={stats.totalResponses > 0 ? '이틀 이상 응답이 쌓이면 추이가 보여요' : '아직 응답이 없어요'}
                        desc="응답이 들어오는 날마다 그래프가 이어져요"
                      />
                    )}
                  </div>

                  <div className={`${CARD} p-5 lg:p-6 min-w-0`}>
                    <CardHead title="가장 많이 고른 답" desc="객관식 질문별 1위 선택지" />
                    {questionSummary.length === 0 ? (
                      <EmptyBox title="객관식 질문이 없어요" desc="선택형 질문을 추가하면 여기에 요약돼요" />
                    ) : (
                      <ul className="space-y-3.5">
                        {questionSummary.slice(0, 6).map((q) => {
                          const share = q.top && q.total > 0 ? Math.round((q.top.count / q.total) * 100) : 0;
                          return (
                            <li key={q.key} className="flex items-start gap-3">
                              <span className="mt-0.5 shrink-0 w-7 text-[11px] font-bold text-secondary-400 tabular-nums">{q.label}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-secondary-500 truncate">{q.content}</p>
                                <div className="mt-0.5 flex items-baseline justify-between gap-2">
                                  <p className="text-sm font-semibold text-secondary-900 truncate">
                                    {q.top && q.top.count > 0 ? q.top.option : '응답 없음'}
                                  </p>
                                  {q.top && q.top.count > 0 && (
                                    <span className="shrink-0 text-xs font-semibold text-primary-600 tabular-nums">{share}%</span>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                {/* ── When responses arrive + recent ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className={`${CARD} p-5 lg:p-6 lg:col-span-2 min-w-0`}>
                    <CardHead
                      title="응답이 들어오는 시간"
                      desc={
                        heatmap.max > 0 && heatmap.peakDay >= 0
                          ? `${DAYS[heatmap.peakDay]}요일 ${hourLabel(heatmap.peakHour)}에 응답이 가장 많았어요`
                          : '요일·시간대별 응답 수'
                      }
                    />
                    {heatmap.max === 0 ? (
                      <EmptyBox title="아직 응답이 없어요" desc="응답이 들어오면 언제 많이 답하는지 보여 드려요" />
                    ) : (
                      <div>
                        <div>
                          <div className="grid gap-[3px]" style={{ gridTemplateColumns: '22px repeat(24, minmax(0, 1fr))' }}>
                            {heatmap.grid.map((line, day) => (
                              <Fragment key={DAYS[day]}>
                                <span className="self-center text-[11px] leading-none text-secondary-500">{DAYS[day]}</span>
                                {line.map((v, hour) => (
                                  <span
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={hour}
                                    title={`${DAYS[day]}요일 ${hourLabel(hour)} · ${v}명`}
                                    className="aspect-square rounded-[3px]"
                                    style={{
                                      backgroundColor: v === 0 ? '#f2f4f6' : `rgba(49, 130, 246, ${0.18 + 0.82 * (v / heatmap.max)})`,
                                    }}
                                  />
                                ))}
                              </Fragment>
                            ))}
                            <span />
                            {Array.from({ length: 24 }).map((_, h) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <span key={h} className="pt-1 text-center text-[10px] text-secondary-400 tabular-nums">
                                {h % 6 === 0 ? h : ''}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-secondary-400">
                            적음
                            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                              <span
                                key={t}
                                className="w-3 h-3 rounded-[3px]"
                                style={{ backgroundColor: t === 0 ? '#f2f4f6' : `rgba(49, 130, 246, ${0.18 + 0.82 * t})` }}
                              />
                            ))}
                            많음
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`${CARD} p-5 lg:p-6 min-w-0`}>
                    <CardHead title="최근 응답" desc="가장 최근에 들어온 5건" />
                    {recentResponses.length === 0 ? (
                      <EmptyBox title="아직 응답이 없어요" desc="새 응답이 들어오면 여기에 쌓여요" />
                    ) : (
                      <ul className="space-y-3.5">
                        {recentResponses.map((r) => (
                          <li key={r.key} className="flex items-start gap-3">
                            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="text-sm font-semibold text-secondary-900 tabular-nums">응답 #{r.no}</p>
                                <span className="shrink-0 text-xs text-secondary-400">{relativeTime(r.time)}</span>
                              </div>
                              <p className="mt-0.5 text-[13px] text-secondary-500 truncate">{r.preview || '답변 없음'}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* ── Tabs ── */}
                <div className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 bg-secondary-50/90 backdrop-blur print:hidden">
                  <div className="flex gap-6 border-b border-secondary-200">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative py-3 text-sm font-medium transition-colors ${
                          activeTab === tab.id ? 'text-secondary-900' : 'text-secondary-500 hover:text-secondary-800'
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-secondary-900 rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── 질문별 탭 ── */}
                {(activeTab === 'question' || isPrinting) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {questionData?.questions?.map((question, index) => {
                      const isSubjective = question.type === 'SUBJECTIVE_QUESTION';
                      const count = isSubjective
                        ? question.answers?.length || 0
                        : (question.choices || []).reduce((s, c) => s + (c.count || 0), 0);
                      return (
                        <div
                          key={question.questionId}
                          className={`${CARD} p-5 lg:p-6 min-w-0 ${isSubjective ? 'lg:col-span-2' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="shrink-0 w-7 h-7 rounded-lg bg-secondary-100 text-secondary-700 text-xs font-bold flex items-center justify-center tabular-nums">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[15px] font-semibold text-secondary-900 leading-snug break-keep">
                                {question.content}
                              </p>
                              <p className="mt-1 text-xs text-secondary-500">
                                {typeLabel(question.type)}
                                <span className="mx-1.5 text-secondary-300">·</span>
                                <span className="tabular-nums">{count}{isSubjective ? '개 답변' : '명 응답'}</span>
                              </p>
                            </div>
                          </div>

                          {isSubjective
                            ? <SubjectiveAnswers question={question} />
                            : <ChoiceChart question={question} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── 응답 원본 탭 ── */}
                {(activeTab === 'response' || isPrinting) && (
                  <div className={`${CARD} overflow-hidden`}>
                    <div className="px-5 lg:px-6 py-4 border-b border-secondary-100">
                      <h3 className="text-[15px] font-bold tracking-tight text-secondary-900">응답 원본</h3>
                      <p className="text-[13px] text-secondary-500 mt-0.5">응답 {answerData?.list?.rows?.length || 0}건</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-secondary-50 border-b border-secondary-100">
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 whitespace-nowrap">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 whitespace-nowrap">응답 일시</th>
                            {answerData?.list?.head?.map((h) => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-secondary-500 whitespace-nowrap max-w-[180px]">
                                <span className="block truncate">{h}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                          {answerData?.list?.rows?.map((row, i) => (
                            <tr key={row.userId} className="hover:bg-secondary-50 transition-colors">
                              <td className="px-4 py-3 text-secondary-400 text-xs tabular-nums">{i + 1}</td>
                              <td className="px-4 py-3 text-secondary-500 text-xs whitespace-nowrap">{formatDate(row.createdAt)}</td>
                              {cellsOf(row).map((cell, j) => {
                                const text = cellValues(cell).join(', ');
                                return (
                                  // eslint-disable-next-line react/no-array-index-key
                                  <td key={j} className="px-4 py-3 text-secondary-800 text-[13px] max-w-[180px]">
                                    <span className="block truncate" title={text}>{text || '—'}</span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(!answerData?.list?.rows?.length) && (
                        <div className="p-6">
                          <EmptyBox title="아직 응답이 없어요" desc="응답이 들어오면 한 줄씩 쌓여요" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 교차 분석 탭 ── */}
                {(activeTab === 'cross' || isPrinting) && (
                  <div className={`${CARD} p-5 lg:p-6`}>
                    <CardHead title="교차 분석" desc="두 질문의 답을 엇갈려 보면 응답자 그룹별 차이가 보여요" />
                    {choiceQuestions.length < 2 || !crosstab ? (
                      <EmptyBox title="객관식 질문이 두 개 이상 필요해요" desc="선택형 질문끼리만 엇갈려 볼 수 있어요" />
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-5 print:hidden">
                          <select
                            value={crossRowQ?.questionId}
                            onChange={(e) => setCrossRowId(Number(e.target.value))}
                            className={selectClass}
                            aria-label="가로줄 질문"
                          >
                            {choiceQuestions.map((q) => (
                              <option key={q.questionId} value={q.questionId}>
                                Q{qNumber.get(q.questionId)}. {q.content}
                              </option>
                            ))}
                          </select>
                          <span className="shrink-0 text-center text-xs text-secondary-400">×</span>
                          <select
                            value={crossColQ?.questionId}
                            onChange={(e) => setCrossColId(Number(e.target.value))}
                            className={selectClass}
                            aria-label="세로줄 질문"
                          >
                            {choiceQuestions
                              .filter((q) => q !== crossRowQ)
                              .map((q) => (
                                <option key={q.questionId} value={q.questionId}>
                                  Q{qNumber.get(q.questionId)}. {q.content}
                                </option>
                              ))}
                          </select>
                        </div>

                        {crosstab.best && crosstab.best.share > 0 && (
                          <p className="mb-4 rounded-lg bg-primary-50 px-3.5 py-2.5 text-sm leading-relaxed text-secondary-700">
                            ‘{crosstab.best.a}’{objectParticle(crosstab.best.a)} 고른 사람의{' '}
                            <b className="font-semibold text-primary-700">{crosstab.best.share}%</b>가 ‘{crosstab.best.b}’
                            {objectParticle(crosstab.best.b)} 골랐어요.
                          </p>
                        )}

                        <div className="overflow-x-auto">
                          <table className="w-full border-separate border-spacing-1 text-sm">
                            <thead>
                              <tr>
                                <th className="min-w-[120px] px-2 py-1.5 text-left text-xs font-medium text-secondary-400">
                                  Q{crossRowQ && qNumber.get(crossRowQ.questionId)} \ Q{crossColQ && qNumber.get(crossColQ.questionId)}
                                </th>
                                {crosstab.colOpts.map((o) => (
                                  <th key={o} className="min-w-[84px] px-2 py-1.5 text-center text-xs font-medium text-secondary-600">
                                    {o}
                                  </th>
                                ))}
                                <th className="px-2 py-1.5 text-right text-xs font-medium text-secondary-400">합계</th>
                              </tr>
                            </thead>
                            <tbody>
                              {crosstab.rowOpts.map((ro, ai) => (
                                <tr key={ro}>
                                  <th scope="row" className="max-w-[200px] px-2 py-2 text-left text-[13px] font-medium text-secondary-700">
                                    <span className="block truncate">{ro}</span>
                                  </th>
                                  {crosstab.colOpts.map((co, bi) => {
                                    const v = crosstab.counts[ai][bi];
                                    const share = crosstab.rowTotals[ai] > 0 ? v / crosstab.rowTotals[ai] : 0;
                                    const isBest = !!crosstab.best && crosstab.best.ai === ai && crosstab.best.bi === bi;
                                    return (
                                      <td
                                        key={co}
                                        className={`rounded-lg px-2 py-2 text-center tabular-nums ${isBest ? 'ring-2 ring-inset ring-primary-500' : ''}`}
                                        style={{ backgroundColor: v === 0 ? '#f9fafb' : `rgba(49, 130, 246, ${0.08 + 0.42 * share})` }}
                                      >
                                        <span className="text-[13px] font-semibold text-secondary-900">{v}</span>
                                        {crosstab.rowTotals[ai] > 0 && (
                                          <span className="ml-1 text-[11px] text-secondary-600">{Math.round(share * 100)}%</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="px-2 py-2 text-right text-[13px] text-secondary-500 tabular-nums">
                                    {crosstab.rowTotals[ai]}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-3 text-xs text-secondary-400">
                          퍼센트는 가로줄 기준이에요. 복수 선택 질문은 고른 보기마다 한 번씩 셉니다.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* ── 응답률 탭 ── */}
                {(activeTab === 'rate' || isPrinting) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className={`${CARD} p-5 lg:p-6`}>
                      <CardHead
                        title="질문별 응답률"
                        desc={
                          lowestRate && lowestRate.rate < 100
                            ? `${lowestRate.label}에서 가장 많이 건너뛰었어요`
                            : '응답자 중 각 질문에 답한 비율'
                        }
                      />
                      {rows.length === 0 ? (
                        <EmptyBox title="아직 응답이 없어요" desc="응답이 들어오면 질문마다 얼마나 답했는지 보여 드려요" />
                      ) : (
                        <ul className="flex flex-col gap-4">
                          {responseRates.map((r) => (
                            <li key={r.key}>
                              <div className="flex items-center justify-between gap-3 mb-1.5">
                                <span className="flex items-center gap-2 min-w-0">
                                  <span className="shrink-0 w-7 text-[11px] font-bold text-secondary-400 tabular-nums">{r.label}</span>
                                  <span className="text-sm text-secondary-700 truncate">{r.content}</span>
                                </span>
                                <span className="shrink-0 text-sm font-semibold text-secondary-900 tabular-nums">
                                  {r.rate}%<span className="ml-1 text-xs font-normal text-secondary-400">{r.answered}명</span>
                                </span>
                              </div>
                              <Meter pct={r.rate} warn={lowestRate !== null && r.key === lowestRate.key && r.rate < 100} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className={`${CARD} p-5 lg:p-6`}>
                      <CardHead title="질문 요약" desc="유형, 응답 수, 가장 많이 고른 답" />
                      <ul className="divide-y divide-secondary-100">
                        {questionData?.questions?.map((q, i) => {
                          const total = q.type === 'SUBJECTIVE_QUESTION'
                            ? q.answers?.length || 0
                            : (q.choices || []).reduce((s, c) => s + (c.count || 0), 0);
                          const topChoice = q.type !== 'SUBJECTIVE_QUESTION'
                            ? (q.choices || []).reduce((prev, cur) => (cur.count || 0) > (prev.count || 0) ? cur : prev, q.choices?.[0] || { option: '-', count: 0 })
                            : null;
                          return (
                            <li key={q.questionId} className="flex items-center gap-3 py-3">
                              <span className="w-6 text-[11px] font-bold text-secondary-400 tabular-nums shrink-0">Q{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-secondary-800 truncate">{q.content}</p>
                                <p className="text-xs text-secondary-500 truncate">
                                  {typeLabel(q.type)}
                                  {topChoice && topChoice.count ? ` · 1위 ${topChoice.option}` : ''}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-secondary-900 shrink-0 tabular-nums">{total}</span>
                            </li>
                          );
                        })}
                      </ul>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-secondary-900">리포트 메일로 보내기</h2>
            <p className="mt-1 text-[13px] text-secondary-500 mb-5">분석 결과를 PDF로 만들어 보내드려요.</p>

            <label className="block text-xs font-medium text-secondary-700 mb-1.5">받는 사람</label>
            <input
              type="email"
              value={reportEmail}
              onChange={(e) => setReportEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
              placeholder="name@example.com"
              disabled={isSending}
              className="w-full h-11 px-3.5 text-sm bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:opacity-50"
            />
            {emailError && <p className="mt-1.5 text-xs text-error">{emailError}</p>}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { setShowEmailModal(false); setReportEmail(''); setEmailError(''); }}
                disabled={isSending}
                className="flex-1 h-11 text-sm font-medium border border-secondary-200 rounded-xl hover:bg-secondary-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="flex-1 h-11 text-sm font-semibold bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    보내는 중
                  </>
                ) : (
                  '보내기'
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
