import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuthStore } from '../store/AuthStore';
import Alert from '../components/common/Alert';
import ShareMailModal from '../components/common/ShareMailModal';
import useInfiniteList from '../hooks/useInfiniteList';
import { deleteSurveyAPI } from '../api/deleteSurvey';
import { ApiResponseError } from '../types/apiResponseError';
import { Survey } from '../types/survey';
import menuSee from '../assets/menuSee.svg';
import menuLink from '../assets/menuLink.svg';
import menuAnalysis from '../assets/menuAnalysis.svg';
import menuEdit from '../assets/menuEdit.svg';
import menuDel from '../assets/menuDel.svg';

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
const DotsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
);

// ==================== CONSTANTS ====================
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
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E8EB] animate-pulse">
      <div className="h-36 bg-[#F2F4F6]" />
      <div className="p-4">
        <div className="h-4 bg-[#F2F4F6] rounded-full w-3/4 mb-2" />
        <div className="h-3 bg-[#F2F4F6] rounded-full w-1/2 mb-4" />
        <div className="flex justify-between pt-3 border-t border-[#F2F4F6]">
          <div className="h-3 bg-[#F2F4F6] rounded-full w-16" />
          <div className="h-3 bg-[#F2F4F6] rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}

// ==================== STAT CARD ====================
interface StatCardProps {
  label: string;
  value: string | number | null;
  unit?: string;
  isLoading: boolean;
}

function StatCard({ label, value, unit, isLoading }: StatCardProps) {
  return (
    <div className="px-5 py-4">
      <p className="text-[13px] text-secondary-500">{label}</p>
      {isLoading ? (
        <div className="mt-1.5 h-7 w-16 bg-secondary-100 rounded-md animate-pulse" />
      ) : (
        <p className="mt-1 text-[22px] font-bold tracking-tight text-secondary-900 tabular-nums">
          {value !== null ? value : '—'}
          {value !== null && unit && <span className="ml-0.5 text-base font-semibold text-secondary-500">{unit}</span>}
        </p>
      )}
    </div>
  );
}

// ==================== SURVEY CARD MENU ====================
const dropdownVariants = {
  open: { scaleY: 1, transition: { when: 'beforeChildren', staggerChildren: 0.06, duration: 0.03 } },
  closed: { scaleY: 0, transition: { when: 'afterChildren', staggerChildren: 0.06, duration: 0.03 } },
};

const itemVariants = {
  open: { opacity: 1, y: 0, transition: { duration: 0.1 } },
  closed: { opacity: 0, y: -8, transition: { duration: 0.1 } },
};

interface SurveyCardMenuProps {
  survey: Survey;
  onDeleted: () => void;
}

function SurveyCardMenu({ survey, onDeleted }: SurveyCardMenuProps) {
  const navigate = useNavigate();
  const myId = useAuthStore((state) => state.userId) ?? 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const canEdit = survey.attendCount === 0;

  const { mutate: deleteSurvey, isError: deleteError } = useMutation({
    mutationFn: () => deleteSurveyAPI(survey.surveyId, myId),
    onSuccess: onDeleted,
    onError: (error: AxiosError) => {
      const err = error as AxiosError<ApiResponseError>;
      setErrorMessage(err.response?.data?.message || '설문 삭제에 실패했습니다.');
    },
  });

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !isShareModalVisible) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isShareModalVisible]);

  const items = [
    { label: '보기', icon: menuSee, onSelect: () => navigate(`/view?id=${survey.surveyId}`) },
    {
      label: '편집',
      icon: menuEdit,
      onSelect: () => (canEdit ? navigate(`/create?id=${survey.surveyId}`) : setShowEditAlert(true)),
    },
    { label: '공유', icon: menuLink, onSelect: () => setIsShareModalVisible(true) },
    { label: '분석', icon: menuAnalysis, onSelect: () => navigate(`/result?id=${survey.surveyId}`) },
    { label: '삭제', icon: menuDel, onSelect: () => deleteSurvey() },
  ];

  return (
    <div className="absolute top-2 right-2 z-10" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsMenuOpen((v) => !v)}
        className="w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm
                   flex items-center justify-center text-[#6B7684]
                   opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
      >
        <DotsIcon />
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.ul
            initial="closed"
            animate="open"
            exit="closed"
            variants={dropdownVariants}
            className="absolute top-full right-0 mt-1 flex flex-col w-28 bg-white shadow-xl rounded-xl z-20 overflow-hidden border border-[#E5E8EB]"
          >
            {items.map(({ label, icon, onSelect }) => (
              <motion.li
                key={label}
                variants={itemVariants}
                onClick={() => {
                  setIsMenuOpen(false);
                  onSelect();
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 whitespace-nowrap hover:bg-[#EEF5FF] text-[#191F28] transition-colors cursor-pointer"
              >
                <img src={icon} alt={label} className="w-4 h-4" />
                <span className={`text-sm ${label === '삭제' ? 'text-[#D0021B]' : ''}`}>{label}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {isShareModalVisible && (
        <ShareMailModal
          surveyId={survey.surveyId}
          isVisible={isShareModalVisible}
          onClose={() => {
            setIsShareModalVisible(false);
            setIsMenuOpen(false);
          }}
        />
      )}
      {deleteError && <Alert type="error" message={errorMessage} buttonText="확인" buttonClick={() => setErrorMessage('')} />}
      {showEditAlert && (
        <Alert
          type="error"
          message="참여자가 있는 설문은 편집할 수 없습니다."
          buttonText="확인"
          buttonClick={() => setShowEditAlert(false)}
        />
      )}
    </div>
  );
}

// ==================== SURVEY CARD ====================
interface SurveyCardProps {
  survey: Survey;
  index: number;
  isOwner: boolean;
  onClick: () => void;
  onDeleted: () => void;
}

function SurveyCard({ survey, index, isOwner, onClick, onDeleted }: SurveyCardProps) {
  const status = surveyStatus(survey);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.5) }}
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-secondary-200 cursor-pointer
                 hover:border-secondary-300 hover:shadow-card-hover transition-[border-color,box-shadow] duration-200"
    >
      {/* Thumbnail */}
      <div className="h-36 relative overflow-hidden bg-secondary-50 border-b border-secondary-100">
        {survey.mainImageUrl ? (
          <img src={survey.mainImageUrl} alt={survey.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-secondary-300">
            <DocumentIcon />
          </div>
        )}

        {/* 3-dot menu (only for the survey's owner) */}
        {isOwner && <SurveyCardMenu survey={survey} onDeleted={onDeleted} />}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-success' : 'bg-secondary-300'}`} />
          <span className={`text-xs font-medium ${status === 'active' ? 'text-emerald-600' : 'text-secondary-500'}`}>
            {status === 'active' ? '진행중' : '종료'}
          </span>
        </div>
        <h3 className="font-semibold text-secondary-900 text-[15px] leading-snug line-clamp-2 min-h-[2.6em]">
          {survey.title}
        </h3>
        <div className="flex items-center justify-between mt-3 text-xs text-secondary-500">
          <span className="flex items-center gap-1 tabular-nums">
            <UsersIcon />
            {(survey.attendCount ?? 0).toLocaleString()}명 응답
          </span>
          <span>{formatDate(survey.createdAt)}</span>
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
      <div className="w-14 h-14 rounded-2xl bg-secondary-100 text-secondary-400 flex items-center justify-center mb-5">
        {hasSearch ? <SearchIcon /> : <DocumentIcon />}
      </div>
      <h3 className="text-lg font-bold text-secondary-900 mb-1.5">
        {hasSearch ? '검색 결과가 없어요' : hasFilter ? '해당 설문이 없어요' : '아직 설문이 없어요'}
      </h3>
      <p className="text-sm text-[#6B7684] mb-8 max-w-xs leading-relaxed">
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
          className="flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold text-white
                     bg-primary-500 hover:bg-primary-600 transition-colors"
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
      style={{ backgroundColor: '#F9FAFB' }}
      onClick={() => showSortDropdown && setShowSortDropdown(false)}
    >
      <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Page Title ── */}
        <div className="mb-6">
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-secondary-900">설문 탐색</h1>
          <p className="text-[15px] text-secondary-500 mt-1">모든 공개 설문을 확인하세요</p>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-secondary-100 rounded-2xl border border-secondary-200
                        overflow-hidden mb-8 [&>*]:bg-white">
          <StatCard label="전체 설문" value={stats ? stats.total : null} unit="개" isLoading={isPending} />
          <StatCard
            label="총 응답"
            value={stats ? stats.totalResponses.toLocaleString() : null}
            unit="명"
            isLoading={isPending}
          />
          <StatCard label="진행중 비율" value={stats ? stats.activeRate : null} unit="%" isLoading={isPending} />
          <StatCard label="진행중 설문" value={stats ? stats.activeCount : null} unit="개" isLoading={isPending} />
        </div>

        {/* ── Control Row ── */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5">

          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#8B95A1]">
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
              className="w-full h-10 pl-9 pr-4 rounded-xl text-sm bg-white border border-secondary-200
                         text-secondary-900 placeholder-secondary-400
                         focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Sort */}
          <div className="relative" ref={sortRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-sm border border-secondary-200
                         bg-white text-secondary-700 hover:bg-secondary-50 transition-colors whitespace-nowrap"
            >
              <span>{currentSortLabel}</span>
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
                             border border-[#E5E8EB] py-1.5 z-20 min-w-[150px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => handleSortSelect(opt.value)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors
                        ${sortValue === opt.value
                          ? 'text-[#3182F6] font-semibold bg-[#EEF5FF]'
                          : 'text-[#191F28] hover:bg-[#F9FAFB]'
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
          <div className="relative flex items-center h-10 bg-secondary-100 rounded-xl p-1">
            {STATUS_TABS.map((tab, i) =>
              statusFilter === tab.value ? (
                <motion.div
                  key="indicator"
                  layoutId="pill-indicator"
                  className="absolute rounded-lg bg-white shadow-[0_1px_3px_rgba(25,31,40,0.1)]"
                  style={{
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
                className={`relative z-10 flex items-center gap-1.5 px-3 h-full rounded-lg text-[13px]
                            transition-colors duration-200 whitespace-nowrap
                            ${statusFilter === tab.value ? 'text-secondary-900 font-semibold' : 'text-secondary-500 font-medium hover:text-secondary-800'}`}
              >
                {tab.label}
                <span
                  className={`text-xs tabular-nums
                    ${statusFilter === tab.value ? 'text-primary-500' : 'text-secondary-400'}`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center h-10 gap-0.5 bg-secondary-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="카드 보기"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-secondary-900 shadow-[0_1px_3px_rgba(25,31,40,0.1)]'
                  : 'text-secondary-400 hover:text-secondary-700'
              }`}
            >
              <GridIcon />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="목록 보기"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-secondary-900 shadow-[0_1px_3px_rgba(25,31,40,0.1)]'
                  : 'text-secondary-400 hover:text-secondary-700'
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
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold text-white
                         bg-primary-500 hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              <PlusIcon />
              <span className="hidden sm:inline">새 설문</span>
            </button>
          )}
        </div>

        {/* ── Count ── */}
        <p className="text-[13px] text-secondary-500 mb-3">
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
                isOwner={!!survey.ownerId && survey.ownerId === myUserId}
                onClick={() => handleSurveyClick(survey)}
                onDeleted={() => window.location.reload()}
              />
            ))}
          </div>
        )}

        {/* ── List View ── */}
        {!isPending && viewMode === 'list' && surveys.length > 0 && (
          <div className="flex flex-col gap-2">
            {surveys.map((survey, index) => {
              const status = surveyStatus(survey);
              const isOwner = !!survey.ownerId && survey.ownerId === myUserId;
              return (
                <motion.div
                  key={survey.surveyId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.4) }}
                  onClick={() => handleSurveyClick(survey)}
                  className="relative bg-white rounded-xl border border-secondary-200 overflow-hidden
                             cursor-pointer hover:border-secondary-300 transition-colors flex group"
                >
                  <div className="flex flex-1 items-center gap-4 px-4 py-3.5 min-w-0">
                    <span className="shrink-0 flex items-center gap-1.5 w-14">
                      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-success' : 'bg-secondary-300'}`} />
                      <span className={`text-xs font-medium ${status === 'active' ? 'text-emerald-600' : 'text-secondary-500'}`}>
                        {status === 'active' ? '진행중' : '종료'}
                      </span>
                    </span>
                    <h3 className="flex-1 font-semibold text-secondary-900 text-sm truncate">
                      {survey.title}
                    </h3>
                    <span className="hidden sm:flex items-center gap-1 text-xs text-secondary-500 shrink-0 tabular-nums">
                      <UsersIcon />
                      {(survey.attendCount ?? 0).toLocaleString()}명
                    </span>
                    <span className="hidden md:block text-xs text-secondary-500 shrink-0">
                      {formatDate(survey.createdAt)}
                    </span>
                    {isOwner && <div className="w-7 shrink-0" />}
                  </div>
                  {isOwner && <SurveyCardMenu survey={survey} onDeleted={() => window.location.reload()} />}
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
            <div className="flex items-center gap-2 text-sm text-[#8B95A1]">
              <div className="w-4 h-4 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
              불러오는 중...
            </div>
          )}
          {!isFetchingNextPage && !hasNextPage && allSurveys.length > 0 && (
            <p className="text-xs text-[#B0B8C1]">모든 설문을 불러왔습니다</p>
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
