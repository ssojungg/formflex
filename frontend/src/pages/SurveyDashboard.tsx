import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/AuthStore';
import Alert from '../components/common/Alert';
import usePaginationSurveyList from '../hooks/usePaginationSurveyList';
import { Survey } from '../types/survey';

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const TrendUpIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
  </svg>
);
const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const INDIGO = '#6366f1';

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

function SurveyDashboard() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortValue, setSortValue] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const {
    data,
    isPending,
    currentPage,
    handlePageChange,
    handleSearchChange,
    handleSortChange,
    searchTerm,
    setSearchTerm,
  } = usePaginationSurveyList('allForm');

  const allSurveys: Survey[] = data?.surveys ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Client-side status filter
  const surveys = useMemo(() => {
    if (statusFilter === 'all') return allSurveys;
    return allSurveys.filter((s) => surveyStatus(s) === statusFilter);
  }, [allSurveys, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalApprox = (data?.totalPages ?? 1) * 9;
    const totalResponses = allSurveys.reduce((acc, s) => acc + (s.attendCount || 0), 0);
    const activeCount = allSurveys.filter((s) => surveyStatus(s) === 'active').length;
    const activeRate = allSurveys.length > 0
      ? Math.round((activeCount / allSurveys.length) * 100)
      : 0;
    return { totalApprox, totalResponses, activeCount, activeRate };
  }, [allSurveys, data]);

  const handleSurveyClick = (surveyId: number) => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    navigate(`/responseform?id=${surveyId}`);
  };

  const handleSortSelect = (value: string) => {
    setSortValue(value);
    handleSortChange(value);
    setShowSortDropdown(false);
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortValue)?.label ?? '최신순';

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => showSortDropdown && setShowSortDropdown(false)}>
      <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8">

        {/* ── Control Row ── */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm mb-4 flex flex-wrap items-center gap-2">

          {/* Search */}
          <div className="relative flex-1 min-w-[140px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
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
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <span className="text-gray-600 text-xs">정렬: {currentSortLabel}</span>
              <ChevronDownIcon />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full mt-1 left-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortSelect(opt.value)}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors ${
                      sortValue === opt.value ? 'text-indigo-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['all', 'active', 'closed'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === s
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'all' ? '전체' : s === 'active' ? 'Active' : 'Closed'}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="카드 보기"
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="목록 보기"
            >
              <ListIcon />
            </button>
          </div>

          {/* Create Button */}
          {isLoggedIn && (
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500 text-white text-xs font-medium rounded-xl hover:bg-indigo-600 transition-colors whitespace-nowrap"
            >
              <PlusIcon />
              <span className="hidden sm:inline">새 설문</span>
            </button>
          )}
        </div>

        {/* ── Stats Row ── */}
        {!isPending && allSurveys.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">전체 설문</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalApprox}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <DocumentIcon />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-indigo-500 font-medium">
                <TrendUpIcon />
                <span>+{Math.min(stats.totalApprox, 12)}%</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">총 응답수</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalResponses.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <UsersIcon />
                </div>
              </div>
              {stats.totalResponses > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-500 font-medium">
                  <TrendUpIcon />
                  <span>+{Math.min(Math.round(stats.totalResponses / 50), 28)}%</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">활성률</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeRate}%</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <ActivityIcon />
                </div>
              </div>
              {stats.activeRate > 50 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-500 font-medium">
                  <TrendUpIcon />
                  <span>+{stats.activeRate - 50}pp</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">활성 설문</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeCount}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <CheckCircleIcon />
                </div>
              </div>
              {stats.activeCount > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-500 font-medium">
                  <TrendUpIcon />
                  <span>+{stats.activeCount}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Count */}
        <p className="text-sm text-gray-500 mb-3 px-1">
          {isPending ? '불러오는 중...' : `${surveys.length}개의 설문`}
        </p>

        {/* Loading */}
        {isPending && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Grid View */}
        {!isPending && viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {surveys.map((survey) => {
              const status = surveyStatus(survey);
              return (
                <motion.div
                  key={survey.surveyId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleSurveyClick(survey.surveyId)}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="h-28 relative overflow-hidden">
                    {survey.mainImageUrl ? (
                      <img src={survey.mainImageUrl} alt={survey.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${INDIGO}18 0%, ${INDIGO}40 100%)` }}>
                        <div className="absolute bottom-3 right-3 opacity-30 flex flex-col gap-1">
                          <div className="h-0.5 w-10 rounded-full bg-indigo-500" />
                          <div className="h-0.5 w-7 rounded-full bg-indigo-500" />
                          <div className="h-0.5 w-4 rounded-full bg-indigo-500" />
                        </div>
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded ${
                      status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {status === 'active' ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1 mb-1">{survey.title}</h3>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <UsersIcon />
                        {survey.attendCount.toLocaleString()}명
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(survey.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {!isPending && viewMode === 'list' && (
          <div className="flex flex-col gap-2">
            {surveys.map((survey) => {
              const status = surveyStatus(survey);
              return (
                <motion.div
                  key={survey.surveyId}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => handleSurveyClick(survey.surveyId)}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex"
                >
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: INDIGO }} />
                  <div className="flex flex-1 items-center gap-4 px-4 py-3 min-w-0">
                    <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded ${
                      status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {status === 'active' ? 'Active' : 'Closed'}
                    </span>
                    <h3 className="flex-1 font-semibold text-gray-900 text-sm truncate">{survey.title}</h3>
                    <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <UsersIcon />{survey.attendCount.toLocaleString()}명
                    </span>
                    <span className="hidden md:block text-xs text-gray-400 shrink-0">{formatDate(survey.createdAt)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isPending && surveys.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <SearchIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">설문이 없습니다</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? '다른 검색어를 시도해보세요' : statusFilter !== 'all' ? '다른 필터를 선택해보세요' : '아직 공개된 설문이 없습니다'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isPending && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-indigo-500 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight />
            </button>
          </div>
        )}
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
    </div>
  );
}

export default SurveyDashboard;
