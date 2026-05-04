import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useInfiniteList from '../hooks/useInfiniteList';
import { Survey } from '../types/survey';
import Alert from '../components/common/Alert';

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const INDIGO = '#6366f1';

function surveyStatus(survey: Survey): 'active' | 'closed' {
  if (survey.open === false) return 'closed';
  if (survey.deadline && new Date(survey.deadline) < new Date()) return 'closed';
  return 'active';
}

function isEditable(survey: Survey): boolean {
  return survey.attendCount === 0;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

const ProgressBar = ({
  attendCount,
  threshold,
}: {
  attendCount: number;
  threshold: number | null | undefined;
}) => {
  if (!threshold) return null;
  const pct = Math.min((attendCount / threshold) * 100, 100);
  return (
    <div className="mt-2 pt-2 border-t border-border-light">
      <div className="flex justify-between text-xs text-text-tertiary mb-1">
        <span>리포트 목표</span>
        <span>{attendCount}/{threshold}명</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

function MyForm() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editBlockAlert, setEditBlockAlert] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    surveys,
    totalCount,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    searchTerm,
    handleSearchChange,
  } = useInfiniteList('myForm');

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

  const stats = useMemo(() => {
    const totalResponses = surveys.reduce((acc, s) => acc + (s.attendCount || 0), 0);
    const activeCount = surveys.filter((s) => surveyStatus(s) === 'active').length;
    return { totalCount, totalResponses, activeCount };
  }, [surveys, totalCount]);

  const handleEditClick = (e: React.MouseEvent, survey: Survey) => {
    e.stopPropagation();
    if (isEditable(survey)) {
      navigate(`/create?id=${survey.surveyId}`);
    } else {
      setEditBlockAlert(true);
    }
  };

  return (
    <div className="min-h-full bg-background-secondary">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">My Forms</h1>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px] md:w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-tertiary">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="설문 제목을 입력하세요..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-light rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-border-light">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-text-tertiary hover:text-text-secondary'}`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-text-tertiary hover:text-text-secondary'}`}
              >
                <ListIcon />
              </button>
            </div>

            {/* Create */}
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              <PlusIcon />
              <span className="hidden sm:inline">추가</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                <DocumentIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalCount ?? '-'}</p>
                <p className="text-xs text-text-tertiary">전체 설문</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <UsersIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalResponses.toLocaleString()}</p>
                <p className="text-xs text-text-tertiary">총 응답 수</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.activeCount}</p>
                <p className="text-xs text-text-tertiary">활성 설문</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isPending && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Survey Grid / List */}
        {!isPending && (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {/* Create New Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate('/create')}
                  className="bg-white rounded-xl border-2 border-dashed border-primary-300 cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all min-h-[200px] flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-3">
                    <PlusIcon />
                  </div>
                  <p className="font-medium text-primary-600 text-sm">새 설문 만들기</p>
                </motion.div>

                {surveys.map((survey, index) => {
                  const status = surveyStatus(survey);
                  const canEdit = isEditable(survey);
                  return (
                    <motion.div
                      key={survey.surveyId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (index + 1) * 0.03 }}
                      className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all group relative"
                    >
                      {/* Card header */}
                      <div
                        className="relative h-28 p-4 cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${INDIGO}18 0%, ${INDIGO}40 100%)` }}
                        onClick={() => navigate(`/responseform?id=${survey.surveyId}`)}
                      >
                        <span className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded ${
                          status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {status === 'active' ? 'Active' : 'Closed'}
                        </span>

                        <button
                          onClick={(e) => handleEditClick(e, survey)}
                          className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition-all ${
                            canEdit
                              ? 'bg-white/90 text-indigo-600 hover:bg-white'
                              : 'bg-white/60 text-gray-400 hover:bg-white/80'
                          }`}
                          title={canEdit ? '수정하기' : '수정 불가'}
                        >
                          <EditIcon />
                          <span>수정</span>
                        </button>

                        <div className="absolute bottom-3 right-3 opacity-30 flex flex-col gap-1">
                          <div className="h-0.5 w-8 rounded-full bg-indigo-500" />
                          <div className="h-0.5 w-5 rounded-full bg-indigo-500" />
                          <div className="h-0.5 w-3 rounded-full bg-indigo-500" />
                        </div>
                      </div>

                      {/* Card content */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => navigate(`/responseform?id=${survey.surveyId}`)}
                      >
                        <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">{survey.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-text-tertiary mt-2">
                          <span className="flex items-center gap-1">
                            <UsersIcon />
                            {survey.attendCount.toLocaleString()}명
                          </span>
                          <span>{formatDate(survey.createdAt)}</span>
                        </div>

                        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-border-light">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/result?id=${survey.surveyId}`); }}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-text-tertiary hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <ChartIcon />
                            분석
                          </button>
                        </div>

                        <ProgressBar
                          attendCount={survey.attendCount}
                          threshold={survey.emailReportThreshold}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl overflow-hidden shadow-card"
              >
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-secondary-50 text-sm font-medium text-text-secondary border-b border-border-light">
                  <div className="col-span-4">제목</div>
                  <div className="col-span-2">상태</div>
                  <div className="col-span-2">응답 수</div>
                  <div className="col-span-2">목표</div>
                  <div className="col-span-1">날짜</div>
                  <div className="col-span-1">관리</div>
                </div>
                <div className="divide-y divide-border-light">
                  {surveys.map((survey, index) => {
                    const status = surveyStatus(survey);
                    const canEdit = isEditable(survey);
                    const threshold = survey.emailReportThreshold;
                    const pct = threshold
                      ? Math.min((survey.attendCount / threshold) * 100, 100)
                      : null;
                    return (
                      <motion.div
                        key={survey.surveyId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => navigate(`/responseform?id=${survey.surveyId}`)}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 hover:bg-secondary-50 cursor-pointer transition-colors"
                      >
                        <div className="md:col-span-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: `${INDIGO}20` }}>
                            <DocumentIcon />
                          </div>
                          <h4 className="font-medium text-text-primary truncate">{survey.title}</h4>
                        </div>
                        <div className="md:col-span-2 flex items-center">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {status === 'active' ? 'Active' : 'Closed'}
                          </span>
                        </div>
                        <div className="md:col-span-2 flex items-center text-sm text-text-secondary">
                          {survey.attendCount.toLocaleString()}명
                        </div>
                        <div className="md:col-span-2 flex items-center">
                          {pct !== null ? (
                            <div className="w-full">
                              <div className="flex justify-between text-xs text-text-tertiary mb-1">
                                <span>{survey.attendCount}/{threshold}명</span>
                                <span>{Math.round(pct)}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-text-tertiary">-</span>
                          )}
                        </div>
                        <div className="md:col-span-1 flex items-center text-sm text-text-tertiary">
                          {formatDate(survey.createdAt)}
                        </div>
                        <div className="md:col-span-1 flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/result?id=${survey.surveyId}`); }}
                            className="p-1.5 text-text-tertiary hover:text-primary-500 hover:bg-primary-50 rounded-lg"
                            title="분석"
                          >
                            <ChartIcon />
                          </button>
                          <button
                            onClick={(e) => handleEditClick(e, survey)}
                            className={`p-1.5 rounded-lg ${
                              canEdit
                                ? 'text-text-tertiary hover:text-primary-500 hover:bg-primary-50'
                                : 'text-gray-200 cursor-not-allowed'
                            }`}
                            title={canEdit ? '수정하기' : '수정 불가 (응답 있음)'}
                          >
                            <EditIcon />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!isPending && surveys.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
              <DocumentIcon />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {searchTerm ? '검색 결과가 없습니다' : '아직 만든 설문이 없습니다'}
            </h3>
            <p className="text-text-tertiary mb-6">
              {searchTerm ? '다른 검색어를 시도해보세요' : '첫 번째 설문을 만들어보세요!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
              >
                <PlusIcon />
                새 설문 만들기
              </button>
            )}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="h-12 flex items-center justify-center mt-4">
          {isFetchingNextPage && (
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          )}
          {!isFetchingNextPage && !hasNextPage && surveys.length > 0 && (
            <p className="text-xs text-text-tertiary">모든 설문을 불러왔습니다</p>
          )}
        </div>
      </div>

      {/* Edit Not Allowed Alert */}
      {editBlockAlert && (
        <Alert
          type="error"
          title="수정 불가"
          message="이미 응답이 있는 설문은 수정할 수 없습니다. 응답이 없는 경우에만 수정 가능합니다."
          buttonText="확인"
          buttonClick={() => setEditBlockAlert(false)}
          onClose={() => setEditBlockAlert(false)}
        />
      )}
    </div>
  );
}

export default MyForm;
