import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyStore, Survey } from '../store/SurveyStore';
import { useResponsive } from '../hooks/useResponsive';

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const STATUS_LABELS = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Closed', color: 'bg-red-100 text-red-700' },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
};

function MyForm() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  const mySurveys = useSurveyStore((state) => state.mySurveys);
  const deleteSurvey = useSurveyStore((state) => state.deleteSurvey);
  const publishSurvey = useSurveyStore((state) => state.publishSurvey);
  const closeSurvey = useSurveyStore((state) => state.closeSurvey);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Filter surveys
  const filteredSurveys = useMemo(() => {
    return mySurveys.filter((survey) => {
      const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [mySurveys, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = mySurveys.length;
    const totalResponses = mySurveys.reduce((sum, s) => sum + s.responseCount, 0);
    const avgCompletion = mySurveys.length > 0
      ? Math.round(mySurveys.reduce((sum, s) => sum + s.completionRate, 0) / mySurveys.length)
      : 0;
    const active = mySurveys.filter((s) => s.status === 'active').length;
    
    return { total, totalResponses, avgCompletion, active };
  }, [mySurveys]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteSurvey(id);
    }
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-full bg-background-secondary">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">My Forms</h1>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-tertiary">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="설문 제목을 입력하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-light rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-border-light">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <ListIcon />
              </button>
            </div>
            
            {/* Create Button */}
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
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
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
          
          <div className="bg-white rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                <ChartIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.avgCompletion}%</p>
                <p className="text-xs text-text-tertiary">평균 완료율</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.active}</p>
                <p className="text-xs text-text-tertiary">활성 설문</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'active', 'closed', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-text-secondary hover:bg-secondary-50 border border-border-light'
              }`}
            >
              {status === 'all' ? `전체 (${mySurveys.length})` : 
               status === 'active' ? `Active (${mySurveys.filter(s => s.status === 'active').length})` :
               status === 'closed' ? `Closed (${mySurveys.filter(s => s.status === 'closed').length})` :
               `Draft (${mySurveys.filter(s => s.status === 'draft').length})`}
            </button>
          ))}
        </div>

        {/* Survey Grid/List */}
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
                className="bg-white rounded-xl border-2 border-dashed border-primary-300 cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all min-h-[280px] flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                  <PlusIcon />
                </div>
                <p className="font-medium text-primary-600">새 설문 만들기</p>
              </motion.div>
              
              {filteredSurveys.map((survey, index) => (
                <motion.div
                  key={survey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 1) * 0.03 }}
                  className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all group"
                >
                  {/* Card Header */}
                  <div 
                    className="relative h-32 p-4 cursor-pointer"
                    style={{ 
                      background: `linear-gradient(135deg, ${survey.themeColor}20 0%, ${survey.themeColor}40 100%)` 
                    }}
                    onClick={() => navigate(`/create?id=${survey.id}`)}
                  >
                    <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded ${STATUS_LABELS[survey.status].color}`}>
                      {STATUS_LABELS[survey.status].label}
                    </span>
                    
                    {/* Menu Button */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === survey.id ? null : survey.id);
                        }}
                        className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors"
                      >
                        <MoreIcon />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openMenuId === survey.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-border py-1 z-10 min-w-[140px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/create?id=${survey.id}`);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-secondary-50"
                          >
                            <EditIcon /> 편집
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/result?id=${survey.id}`);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-secondary-50"
                          >
                            <ChartIcon /> 분석
                          </button>
                          {survey.status === 'draft' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                publishSurvey(survey.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50"
                            >
                              배포하기
                            </button>
                          )}
                          {survey.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                closeSurvey(survey.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
                            >
                              마감하기
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(survey.id);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon /> 삭제
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Decorative lines */}
                    <div className="absolute bottom-4 right-4 opacity-50">
                      <div className="flex flex-col gap-1.5">
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i} 
                            className="h-1 rounded-full"
                            style={{ 
                              width: `${60 - i * 15}px`,
                              backgroundColor: survey.themeColor 
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => navigate(`/create?id=${survey.id}`)}
                  >
                    <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">
                      {survey.title}
                    </h3>
                    
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-text-tertiary mt-3">
                      <span className="flex items-center gap-1">
                        <DocumentIcon />
                        {survey.questions.length}문항
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon />
                        {survey.responseCount}
                      </span>
                      {survey.completionRate > 0 && (
                        <span>{survey.completionRate}%</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl overflow-hidden shadow-card"
            >
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-secondary-50 text-sm font-medium text-text-secondary border-b border-border-light">
                <div className="col-span-5">제목</div>
                <div className="col-span-2">상태</div>
                <div className="col-span-2">응답 수</div>
                <div className="col-span-2">완료율</div>
                <div className="col-span-1">수정일</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-border-light">
                {filteredSurveys.map((survey, index) => (
                  <motion.div
                    key={survey.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => navigate(`/create?id=${survey.id}`)}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 hover:bg-secondary-50 cursor-pointer transition-colors"
                  >
                    <div className="md:col-span-5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${survey.themeColor}20` }}
                        >
                          <DocumentIcon />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-text-primary truncate">{survey.title}</h4>
                          <p className="text-xs text-text-tertiary">{survey.questions.length}문항</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${STATUS_LABELS[survey.status].color}`}>
                        {STATUS_LABELS[survey.status].label}
                      </span>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center">
                      <span className="text-sm text-text-secondary">
                        {survey.responseCount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center gap-2">
                      {survey.completionRate > 0 ? (
                        <>
                          <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden max-w-[80px]">
                            <div 
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${survey.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-text-secondary">{survey.completionRate}%</span>
                        </>
                      ) : (
                        <span className="text-sm text-text-tertiary">-</span>
                      )}
                    </div>
                    
                    <div className="md:col-span-1 flex items-center">
                      <span className="text-sm text-text-tertiary">
                        {formatDate(survey.updatedAt)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredSurveys.length === 0 && mySurveys.length > 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">검색 결과가 없습니다</h3>
            <p className="text-text-tertiary">다른 검색어나 필터를 시도해보세요</p>
          </div>
        )}

        {/* First Time User Empty State */}
        {mySurveys.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentIcon />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">아직 만든 설문이 없습니다</h3>
            <p className="text-text-tertiary mb-6">첫 번째 설문을 만들어보세요!</p>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              <PlusIcon />
              새 설문 만들기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyForm;
