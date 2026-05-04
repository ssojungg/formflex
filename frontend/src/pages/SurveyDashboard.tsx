import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/AuthStore';
import Alert from '../components/common/Alert';
import useInfiniteList from '../hooks/useInfiniteList';
import { Survey } from '../types/survey';

// ==================== ICONS ====================
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);
const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const TrendUpIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const DotsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
);

// ==================== CONSTANTS ====================
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 100%)',
  'linear-gradient(135deg, #E0E7FF 0%, #A5B4FC 100%)',
  'linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)',
  'linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)',
  'linear-gradient(135deg, #E0E7FF 0%, #818CF8 100%)',
  'linear-gradient(135deg, #EEF2FF 0%, #A5B4FC 100%)',
  'linear-gradient(135deg, #F5F3FF 0%, #C4B5FD 100%)',
  'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
  'linear-gradient(135deg, #EDE9FE 0%, #A5B4FC 100%)',
];

const SORT_OPTIONS = [
  { value: '', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'attendCount', label: '응답 많은 순' },
  { value: 'deadline', label: '마감일 임박순' },
];

type StatusFilter = 'all' | 'active' | 'closed';

function surveyStatus(survey: Survey): 'active' | 'closed' {
  if (!survey.open) return 'closed';
  if (survey.deadline && new Date(survey.deadline) < new Date()) return 'closed';
  return 'active';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

// ==================== SKELETON CARD ====================
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E8E6F0] animate-pulse">
      <div className="h-36 bg-gradient-to-r from-[#F0EEF8] to-[#E8E6F0]" />
      <div className="p-4">
        <div className="h-4 bg-[#F0EEF8] rounded-full w-3/4 mb-2" />
        <div className="h-3 bg-[#F0EEF8] rounded-full w-1/2 mb-4" />
        <div className="flex justify-between pt-3 border-t border-[#F0EEF8]">
          <div className="h-3 bg-[#F0EEF8] rounded-full w-16" />
          <div className="h-3 bg-[#F0EEF8] rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}

// ==================== STAT CARD ====================
interface StatCardProps {
  label: string;
  value: string | number | null;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  trend?: string;
  isLoading: boolean;
}

function StatCard({ label, value, icon, iconBg, iconColor, accentColor, trend, isLoading }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E8E6F0] shadow-sm flex">
      <div className="w-1 shrink-0 rounded-l-2xl" style={{ backgroundColor: accentColor }} />
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#6B6880] mb-1">{label}</p>
            {isLoading ? (
              <div className="h-7 w-16 bg-[#F0EEF8] rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-[#1A1A2A]">
                {value !== null ? value : '—'}
              </p>
            )}
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        </div>
        <div className="mt-2 h-4">
          {!isLoading && trend && (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: accentColor }}>
              <TrendUpIcon />
              {trend}
            </span>
          )}
          {!isLoading && !trend && (
            <span className="text-xs text-[#C4C0D0]">데이터 없음</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== SURVEY CARD ====================
interface SurveyCardProps {
  survey: Survey;
  index: number;
  onClick: () => void;
}

function SurveyCard({ survey, index, onClick }: SurveyCardProps) {
  const status = surveyStatus(survey);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.5) }}
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-[#E8E6F0] cursor-pointer
                 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="h-36 relative overflow-hidden">
        {survey.mainImageUrl ? (
          <img src={survey.mainImageUrl} alt={survey.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: gradient }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <DocumentIcon />
            </div>
          </div>
        )}

        {/* Status badge */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full"
          style={
            status === 'active'
              ? { backgroundColor: '#D1FAE5', color: '#059669' }
              : { backgroundColor: '#F1F5F9', color: '#64748B' }
          }
        >
          {status === 'active' ? '● 진행중' : '■ 종료'}
        </span>

        {/* 3-dot menu */}
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm
                     flex items-center justify-center text-[#6B6880]
                     opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <DotsIcon />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-[#1A1A2A] text-sm leading-snug line-clamp-2 mb-3">
          {survey.title}
        </h3>
        <div className="flex items-center justify-between pt-3 border-t border-[#F4F2FA]">
          <span
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full"
            style={{ backgroundColor: '#F0EEFF', color: '#5B4CF5' }}
          >
            <UsersIcon />
            {(survey.attendCount ?? 0).toLocaleString()}명
          </span>
          <span className="text-xs text-[#9B97A8]">{formatDate(survey.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== EMPTY STATE ====================
function EmptyState({ hasSearch, hasFilter, onCreateClick, isLoggedIn }: {
  hasSearch: boolean;
  hasFilter: boolean;
  onCreateClick: () => void;
  isLoggedIn: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 text-4xl"
        style={{ background: 'linear-gradient(135deg, #EEE9FF 0%, #E0D9FF 100%)' }}
      >
        {hasSearch ? '🔍' : hasFilter ? '🗂️' : '📋'}
      </div>
      <h3 className="text-xl font-bold text-[#1A1A2A] mb-2">
        {hasSearch ? '검색 결과가 없어요' : hasFilter ? '해당 설문이 없어요' : '아직 설문이 없어요'}
      </h3>
      <p className="text-sm text-[#6B6880] mb-8 max-w-xs leading-relaxed">
        {hasSearch
          ? '다른 키워드로 검색해보세요'
          : hasFilter
          ? '다른 필터를 선택해보세요'
          : '첫 번째 설문을 만들어서 응답을 모아보세요'}
      </p>
      {!hasSearch && !hasFilter && isLoggedIn && (
        <button
          type="button"
          onClick={onCreateClick}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white
                     transition-all hover:brightness-110 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #5B4CF5 0%, #7B6FF5 100%)' }}
        >
          <PlusIcon />
          첫 설문 만들기
        </button>
      )}
    </motion.div>
  );
}

// ==================== MAIN COMPONENT ====================
function SurveyDashboard() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const myUserId = useAuthStore((state) => state.userId);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [accessAlert, setAccessAlert] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortValue, setSortValue] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    surveys: allSurveys,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleSearchChange,
    handleSortChange,
    searchTerm,
    setSearchTerm,
  } = useInfiniteList('allForm');

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const surveys = useMemo(() => {
    if (statusFilter === 'all') return allSurveys;
    return allSurveys.filter((s) => surveyStatus(s) === statusFilter);
  }, [allSurveys, statusFilter]);

  const activeCount = useMemo(
    () => allSurveys.filter((s) => surveyStatus(s) === 'active').length,
    [allSurveys],
  );
  const closedCount = allSurveys.length - activeCount;

  const stats = useMemo(() => {
    if (allSurveys.length === 0) return null;
    const totalResponses = allSurveys.reduce((acc, s) => acc + (s.attendCount || 0), 0);
    const activeRate = Math.round((activeCount / allSurveys.length) * 100);
    return { total: allSurveys.length, totalResponses, activeCount, activeRate };
  }, [allSurveys, activeCount]);

  const handleSurveyClick = useCallback((survey: Survey) => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    if (survey.ownerId && survey.ownerId === myUserId) {
      setAccessAlert('본인이 만든 설문에는 참여할 수 없습니다.');
      return;
    }
    if (survey.isAttended) {
      setAccessAlert('이미 참여한 설문입니다.\n내 정보 > 내가 참여한 설문에서 확인하세요.');
      return;
    }
    const status = surveyStatus(survey);
    if (status === 'closed') {
      setAccessAlert('마감된 설문입니다.');
      return;
    }
    navigate(`/responseform?id=${survey.surveyId}`);
  }, [isLoggedIn, myUserId, navigate]);

  const handleSortSelect = (value: string) => {
    setSortValue(value);
    handleSortChange(value);
    setShowSortDropdown(false);
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortValue)?.label ?? '최신순';

  const STATUS_TABS = [
    { value: 'all' as StatusFilter, label: '전체', count: allSurveys.length },
    { value: 'active' as StatusFilter, label: '진행중', count: activeCount },
    { value: 'closed' as StatusFilter, label: '종료', count: closedCount },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#F8F7FF' }}
      onClick={() => showSortDropdown && setShowSortDropdown(false)}
    >
      <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Page Title ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A2A]">설문 탐색</h1>
          <p className="text-sm text-[#6B6880] mt-1">모든 공개 설문을 확인하세요</p>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="전체 설문"
            value={stats ? stats.total : null}
            icon={<DocumentIcon />}
            iconBg="#EEE9FF"
            iconColor="#5B4CF5"
            accentColor="#5B4CF5"
            trend={stats ? `총 ${stats.total}개` : undefined}
            isLoading={isPending}
          />
          <StatCard
            label="총 응답수"
            value={stats ? stats.totalResponses.toLocaleString() : null}
            icon={<UsersIcon />}
            iconBg="#E0F2FE"
            iconColor="#0284C7"
            accentColor="#0284C7"
            trend={stats && stats.totalResponses > 0 ? `${stats.totalResponses.toLocaleString()}명` : undefined}
            isLoading={isPending}
          />
          <StatCard
            label="활성률"
            value={stats ? `${stats.activeRate}%` : null}
            icon={<ActivityIcon />}
            iconBg="#FEF3C7"
            iconColor="#D97706"
            accentColor="#D97706"
            trend={stats && stats.activeRate > 50 ? '절반 이상 활성' : undefined}
            isLoading={isPending}
          />
          <StatCard
            label="활성 설문"
            value={stats ? stats.activeCount : null}
            icon={<CheckCircleIcon />}
            iconBg="#D1FAE5"
            iconColor="#059669"
            accentColor="#10B981"
            trend={stats && stats.activeCount > 0 ? `${stats.activeCount}개 진행중` : undefined}
            isLoading={isPending}
          />
        </div>

        {/* ── Control Row ── */}
        <div className="bg-white rounded-2xl border border-[#E8E6F0] shadow-sm px-4 py-3 mb-5
                        flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#9B97A8]">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="설문 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearchChange(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-[#F8F7FF] border border-[#E8E6F0]
                         text-[#1A1A2A] placeholder-[#C4C0D0]
                         focus:outline-none focus:ring-2 focus:border-[#5B4CF5] transition-all"
            />
          </div>

          {/* Sort */}
          <div className="relative" ref={sortRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-[#E8E6F0]
                         bg-white text-[#6B6880] hover:bg-[#F8F7FF] transition-colors whitespace-nowrap"
            >
              <span>정렬: {currentSortLabel}</span>
              <ChevronDownIcon />
            </button>
            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl
                             border border-[#E8E6F0] py-1.5 z-20 min-w-[150px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => handleSortSelect(opt.value)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors
                        ${sortValue === opt.value
                          ? 'text-[#5B4CF5] font-semibold bg-[#F0EEFF]'
                          : 'text-[#1A1A2A] hover:bg-[#F8F7FF]'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pill Filter Tabs */}
          <div className="relative flex items-center bg-[#F0EEF8] rounded-full p-1">
            {STATUS_TABS.map((tab, i) =>
              statusFilter === tab.value ? (
                <motion.div
                  key="indicator"
                  layoutId="pill-indicator"
                  className="absolute rounded-full"
                  style={{
                    backgroundColor: '#5B4CF5',
                    height: 'calc(100% - 8px)',
                    width: `calc(${100 / STATUS_TABS.length}% - 4px)`,
                    left: `${i * (100 / STATUS_TABS.length)}%`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              ) : null,
            )}
            {STATUS_TABS.map((tab) => (
              <button
                type="button"
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                            transition-colors duration-300 whitespace-nowrap
                            ${statusFilter === tab.value ? 'text-white' : 'text-[#6B6880] hover:text-[#1A1A2A]'}`}
              >
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                    ${statusFilter === tab.value
                      ? 'bg-white/25 text-white'
                      : 'bg-[#E0DCF0] text-[#6B6880]'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-[#F0EEF8] rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#5B4CF5] shadow-sm'
                  : 'text-[#9B97A8] hover:text-[#6B6880]'
              }`}
            >
              <GridIcon />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#5B4CF5] shadow-sm'
                  : 'text-[#9B97A8] hover:text-[#6B6880]'
              }`}
            >
              <ListIcon />
            </button>
          </div>

          {/* Create */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white
                         transition-all hover:brightness-110 hover:scale-105 active:scale-95 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #5B4CF5 0%, #7B6FF5 100%)' }}
            >
              <PlusIcon />
              <span className="hidden sm:inline">새 설문</span>
            </button>
          )}
        </div>

        {/* ── Count ── */}
        <p className="text-xs text-[#9B97A8] mb-4 px-1">
          {isPending ? '불러오는 중...' : `${surveys.length}개의 설문`}
        </p>

        {/* ── Loading Skeleton ── */}
        {isPending && (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Grid View ── */}
        {!isPending && viewMode === 'grid' && surveys.length > 0 && (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {surveys.map((survey, index) => (
              <SurveyCard
                key={survey.surveyId}
                survey={survey}
                index={index}
                onClick={() => handleSurveyClick(survey)}
              />
            ))}
          </div>
        )}

        {/* ── List View ── */}
        {!isPending && viewMode === 'list' && surveys.length > 0 && (
          <div className="flex flex-col gap-2">
            {surveys.map((survey, index) => {
              const status = surveyStatus(survey);
              return (
                <motion.div
                  key={survey.surveyId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.4) }}
                  onClick={() => handleSurveyClick(survey)}
                  className="bg-white rounded-2xl border border-[#E8E6F0] overflow-hidden
                             cursor-pointer hover:shadow-md transition-all flex group"
                >
                  <div
                    className="w-1 shrink-0"
                    style={{ background: CARD_GRADIENTS[index % CARD_GRADIENTS.length] }}
                  />
                  <div className="flex flex-1 items-center gap-4 px-4 py-3.5 min-w-0">
                    <span
                      className="shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full"
                      style={
                        status === 'active'
                          ? { backgroundColor: '#D1FAE5', color: '#059669' }
                          : { backgroundColor: '#F1F5F9', color: '#64748B' }
                      }
                    >
                      {status === 'active' ? '진행중' : '종료'}
                    </span>
                    <h3 className="flex-1 font-semibold text-[#1A1A2A] text-sm truncate">
                      {survey.title}
                    </h3>
                    <span
                      className="hidden sm:flex items-center gap-1.5 text-xs font-medium shrink-0
                                 px-2 py-1 rounded-full"
                      style={{ backgroundColor: '#F0EEFF', color: '#5B4CF5' }}
                    >
                      <UsersIcon />
                      {(survey.attendCount ?? 0).toLocaleString()}명
                    </span>
                    <span className="hidden md:block text-xs text-[#9B97A8] shrink-0">
                      {formatDate(survey.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Empty State ── */}
        {!isPending && surveys.length === 0 && (
          <EmptyState
            hasSearch={!!searchTerm}
            hasFilter={statusFilter !== 'all'}
            onCreateClick={() => navigate('/create')}
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* ── Infinite scroll trigger ── */}
        <div ref={loadMoreRef} className="h-12 flex items-center justify-center mt-4">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-sm text-[#9B97A8]">
              <div className="w-4 h-4 border-2 border-[#5B4CF5] border-t-transparent rounded-full animate-spin" />
              불러오는 중...
            </div>
          )}
          {!isFetchingNextPage && !hasNextPage && allSurveys.length > 0 && (
            <p className="text-xs text-[#C4C0D0]">모든 설문을 불러왔습니다</p>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <Alert
          type="login"
          title="로그인이 필요합니다"
          message="설문에 참여하려면 로그인이 필요합니다."
          buttonText="로그인하기"
          buttonClick={() => navigate('/login')}
          secondaryButtonText="회원가입"
          secondaryButtonClick={() => navigate('/signup')}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Access Alert */}
      {accessAlert && (
        <Alert
          type="error"
          message={accessAlert}
          buttonText="확인"
          buttonClick={() => setAccessAlert('')}
          onClose={() => setAccessAlert('')}
        />
      )}
    </div>
  );
}

export default SurveyDashboard;
