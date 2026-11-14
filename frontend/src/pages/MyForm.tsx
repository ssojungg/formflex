import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useInfiniteList from '../hooks/useInfiniteList';
import { Survey } from '../types/survey';
import Alert from '../components/common/Alert';
import CoverArt from '../components/common/CoverArt';

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
    <div className="mt-3">
      <div className="flex justify-between text-xs text-secondary-500 mb-1 tabular-nums">
        <span>리포트 목표</span>
        <span>{attendCount}/{threshold}명</span>
      </div>
      <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
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

  const statusDot = (status: 'active' | 'closed') => (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-success' : 'bg-secondary-300'}`} />
      <span className={`text-xs font-medium ${status === 'active' ? 'text-emerald-600' : 'text-secondary-500'}`}>
        {status === 'active' ? '진행중' : '종료'}
      </span>
    </span>
  );

  return (
    <div className="min-h-full bg-secondary-50">
      <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-secondary-900">내 설문</h1>
            <p className="mt-1 text-[15px] text-secondary-500">만든 설문을 관리하고 결과를 확인하세요</p>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
          >
            <PlusIcon />
            새 설문
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-secondary-100 rounded-2xl border border-secondary-200 overflow-hidden mb-8 [&>*]:bg-white">
          {[
            { label: '전체 설문', value: stats.totalCount ?? '—', unit: '개' },
            { label: '총 응답', value: stats.totalResponses.toLocaleString(), unit: '명' },
            { label: '진행중', value: stats.activeCount, unit: '개' },
          ].map((s) => (
            <div key={s.label} className="px-5 py-4">
              <p className="text-[13px] text-secondary-500">{s.label}</p>
              <p className="mt-1 text-[22px] font-bold tracking-tight text-secondary-900 tabular-nums">
                {s.value}
                <span className="ml-0.5 text-base font-semibold text-secondary-500">{s.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mb-5 flex items-center gap-2.5">
          <div className="relative flex-1 min-w-0 sm:max-w-sm">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-secondary-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="설문 제목으로 찾기"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-secondary-200 rounded-xl text-sm text-secondary-900 placeholder-secondary-400 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-colors"
            />
          </div>
          <div className="ml-auto flex items-center h-10 gap-0.5 bg-secondary-100 rounded-xl p-1">
            {(['grid', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                aria-label={mode === 'grid' ? '카드 보기' : '목록 보기'}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-secondary-900 shadow-[0_1px_3px_rgba(25,31,40,0.1)]'
                    : 'text-secondary-400 hover:text-secondary-700'
                }`}
              >
                {mode === 'grid' ? <GridIcon /> : <ListIcon />}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isPending && (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Survey Grid / List */}
        {!isPending && surveys.length > 0 && (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <button
                  onClick={() => navigate('/create')}
                  className="min-h-[260px] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-secondary-300 text-secondary-500 hover:border-secondary-400 hover:bg-white hover:text-secondary-800 transition-colors"
                >
                  <span className="w-11 h-11 rounded-xl bg-white border border-secondary-200 flex items-center justify-center">
                    <PlusIcon />
                  </span>
                  <span className="text-sm font-medium">새 설문 만들기</span>
                </button>

                {surveys.map((survey, index) => {
                  const status = surveyStatus(survey);
                  const canEdit = isEditable(survey);
                  return (
                    <motion.div
                      key={survey.surveyId}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min((index + 1) * 0.03, 0.4) }}
                      className="group bg-white rounded-2xl border border-secondary-200 overflow-hidden hover:border-secondary-300 hover:shadow-card-hover transition-[border-color,box-shadow]"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/responseform?id=${survey.surveyId}`)}
                        className="block w-full h-36 relative overflow-hidden border-b border-secondary-100 bg-secondary-50"
                        aria-label={`${survey.title} 열기`}
                      >
                        {survey.mainImageUrl ? (
                          <img src={survey.mainImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <CoverArt title={survey.title} className="transition-transform duration-500 group-hover:scale-[1.03]" />
                        )}
                      </button>

                      <div className="p-4">
                        {statusDot(status)}
                        <button
                          type="button"
                          onClick={() => navigate(`/responseform?id=${survey.surveyId}`)}
                          className="mt-1.5 block w-full text-left font-semibold text-[15px] leading-snug text-secondary-900 line-clamp-2 min-h-[2.6em] hover:underline underline-offset-2"
                        >
                          {survey.title}
                        </button>
                        <div className="mt-2 flex items-center gap-3 text-xs text-secondary-500">
                          <span className="flex items-center gap-1 tabular-nums">
                            <UsersIcon />
                            {survey.attendCount.toLocaleString()}명 응답
                          </span>
                          <span>{formatDate(survey.createdAt)}</span>
                        </div>

                        <ProgressBar attendCount={survey.attendCount} threshold={survey.emailReportThreshold} />

                        <div className="mt-3 pt-3 border-t border-secondary-100 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => navigate(`/result?id=${survey.surveyId}`)}
                            className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-secondary-200 text-[13px] font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <ChartIcon />
                            결과 보기
                          </button>
                          <button
                            onClick={(e) => handleEditClick(e, survey)}
                            title={canEdit ? '수정하기' : '응답이 있어 수정할 수 없어요'}
                            className={`flex items-center justify-center gap-1.5 h-9 rounded-lg border text-[13px] font-medium transition-colors ${
                              canEdit
                                ? 'border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                                : 'border-secondary-100 text-secondary-300'
                            }`}
                          >
                            <EditIcon />
                            수정
                          </button>
                        </div>
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
                className="bg-white rounded-2xl border border-secondary-200 overflow-hidden"
              >
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-secondary-50 text-xs font-medium text-secondary-500 border-b border-secondary-100">
                  <div className="col-span-5">제목</div>
                  <div className="col-span-1">상태</div>
                  <div className="col-span-2">응답</div>
                  <div className="col-span-2">리포트 목표</div>
                  <div className="col-span-1">만든 날</div>
                  <div className="col-span-1 text-right">관리</div>
                </div>
                <div className="divide-y divide-secondary-100">
                  {surveys.map((survey, index) => {
                    const status = surveyStatus(survey);
                    const canEdit = isEditable(survey);
                    const threshold = survey.emailReportThreshold;
                    const pct = threshold ? Math.min((survey.attendCount / threshold) * 100, 100) : null;
                    return (
                      <motion.div
                        key={survey.surveyId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.3) }}
                        onClick={() => navigate(`/responseform?id=${survey.surveyId}`)}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-3.5 hover:bg-secondary-50 cursor-pointer transition-colors"
                      >
                        <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                          <div className="w-12 h-9 rounded-md overflow-hidden flex-shrink-0 border border-secondary-100">
                            <CoverArt title={survey.title} compact />
                          </div>
                          <h4 className="font-medium text-sm text-secondary-900 truncate">{survey.title}</h4>
                        </div>
                        <div className="md:col-span-1 flex items-center">{statusDot(status)}</div>
                        <div className="md:col-span-2 flex items-center text-sm text-secondary-700 tabular-nums">
                          {survey.attendCount.toLocaleString()}명
                        </div>
                        <div className="md:col-span-2 flex items-center">
                          {pct !== null ? (
                            <div className="w-full">
                              <div className="flex justify-between text-xs text-secondary-500 mb-1 tabular-nums">
                                <span>
                                  {survey.attendCount}/{threshold}명
                                </span>
                                <span>{Math.round(pct)}%</span>
                              </div>
                              <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-secondary-400">—</span>
                          )}
                        </div>
                        <div className="md:col-span-1 flex items-center text-sm text-secondary-500">
                          {formatDate(survey.createdAt)}
                        </div>
                        <div className="md:col-span-1 flex items-center md:justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/result?id=${survey.surveyId}`);
                            }}
                            className="p-1.5 text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
                            title="결과 보기"
                          >
                            <ChartIcon />
                          </button>
                          <button
                            onClick={(e) => handleEditClick(e, survey)}
                            className={`p-1.5 rounded-lg ${
                              canEdit ? 'text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100' : 'text-secondary-300'
                            }`}
                            title={canEdit ? '수정하기' : '응답이 있어 수정할 수 없어요'}
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="w-14 h-14 rounded-2xl bg-white border border-secondary-200 text-secondary-400 flex items-center justify-center mb-5">
              <DocumentIcon />
            </span>
            <h3 className="text-lg font-bold text-secondary-900">
              {searchTerm ? '찾는 설문이 없어요' : '아직 만든 설문이 없어요'}
            </h3>
            <p className="mt-1.5 text-sm text-secondary-500">
              {searchTerm ? '다른 단어로 찾아보세요' : '첫 설문을 만들어서 응답을 모아 보세요'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/create')}
                className="mt-6 inline-flex items-center gap-2 h-11 px-5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors"
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
            <p className="text-xs text-secondary-400">모든 설문을 불러왔어요</p>
          )}
        </div>
      </div>

      {/* Edit Not Allowed Alert */}
      {editBlockAlert && (
        <Alert
          type="error"
          title="수정할 수 없어요"
          message="이미 응답이 들어온 설문은 수정할 수 없어요. 응답이 없을 때만 고칠 수 있어요."
          buttonText="확인"
          buttonClick={() => setEditBlockAlert(false)}
          onClose={() => setEditBlockAlert(false)}
        />
      )}
    </div>
  );
}

export default MyForm;
