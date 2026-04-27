import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SurveyCoverType, Survey } from '../../types/survey';
import { useResponsive } from '../../hooks/useResponsive';
import FormCard from './FormCard';
import FormListItem from './FormListItem';
import StatsCards from './StatsCards';

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5h10" />
    <path d="M11 9h7" />
    <path d="M11 13h4" />
    <path d="M3 17l3 3 3-3" />
    <path d="M6 18V4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'closed';
type SortOption = 'latest' | 'attendCount' | 'deadline';

interface DashboardProps {
  surveyData: SurveyCoverType;
  currentPage: number;
  onClickAddButton?: () => void;
  onPageChange: (page: number) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'attendCount', label: '참여자순' },
  { value: 'deadline', label: '마감일순' },
] as const;

export function Dashboard({
  surveyData,
  currentPage,
  onClickAddButton,
  onPageChange,
  searchTerm,
  setSearchTerm,
  onSortChange,
}: DashboardProps) {
  const { isMobile, isTablet } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const isMyFormPage = location.pathname.includes('/myform');
  const showAddButton = location.pathname !== '/myresponses';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter surveys based on status
  const filteredSurveys = surveyData.surveys?.filter((survey) => {
    if (filterStatus === 'all') return true;
    const isActive = new Date(survey.deadline) > new Date();
    return filterStatus === 'active' ? isActive : !isActive;
  }) || [];

  // Count surveys by status
  const activeSurveys = surveyData.surveys?.filter(s => new Date(s.deadline) > new Date()).length || 0;
  const closedSurveys = (surveyData.surveys?.length || 0) - activeSurveys;

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
    onSortChange(value);
    setIsSortDropdownOpen(false);
  };

  const handleAddClick = () => {
    if (onClickAddButton) {
      onClickAddButton();
    } else {
      navigate('/create');
    }
  };

  // Stats data
  const stats = {
    totalSurveys: surveyData.surveys?.length || 0,
    totalResponses: surveyData.surveys?.reduce((acc, s) => acc + (s.attendCount || 0), 0) || 0,
    avgCompletion: 74.3,
    activeSurveys: activeSurveys,
  };

  return (
    <div className="min-h-full bg-background-secondary">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-text-primary">
            {isMyFormPage ? 'My Forms' : '템플릿 라이브러리'}
          </h1>
        </div>

        {/* Search and Filters Row */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-secondary-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="설문 제목을 입력하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="btn-outline flex items-center gap-2 min-w-[120px]"
              >
                <SortIcon />
                <span className="hidden sm:inline">정렬:</span>
                <span>{SORT_OPTIONS.find(o => o.value === sortOption)?.label}</span>
                <ChevronDownIcon />
              </button>
              
              <AnimatePresence>
                {isSortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-dropdown z-20"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-secondary-50 first:rounded-t-xl last:rounded-b-xl
                          ${sortOption === option.value ? 'text-primary-500 bg-primary-50' : 'text-text-primary'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex bg-secondary-100 rounded-xl p-1">
              {[
                { value: 'all', label: `전체 (${surveyData.surveys?.length || 0})` },
                { value: 'active', label: `Active (${activeSurveys})` },
                { value: 'closed', label: `Closed (${closedSurveys})` },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilterStatus(tab.value as FilterStatus)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all
                    ${filterStatus === tab.value 
                      ? 'bg-primary-500 text-white' 
                      : 'text-text-secondary hover:text-text-primary'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle - Hidden on mobile */}
            {!isMobile && (
              <div className="flex bg-secondary-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  title="그리드 보기"
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  title="리스트 보기"
                >
                  <ListIcon />
                </button>
              </div>
            )}

            {/* Add Button */}
            {showAddButton && (
              <button
                onClick={handleAddClick}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon />
                <span className="hidden sm:inline">추가</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {isMyFormPage && <StatsCards stats={stats} />}

        {/* Survey Grid/List */}
        {filteredSurveys.length > 0 ? (
          <>
            {viewMode === 'grid' || isMobile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {/* Add New Survey Card */}
                {showAddButton && isMyFormPage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card border-2 border-dashed border-border hover:border-primary-400 
                             flex flex-col items-center justify-center min-h-[200px] md:min-h-[280px]
                             cursor-pointer group transition-colors"
                    onClick={handleAddClick}
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center 
                                  group-hover:bg-primary-100 transition-colors mb-3">
                      <PlusIcon />
                    </div>
                    <span className="text-sm text-text-secondary group-hover:text-primary-500 transition-colors">
                      새 설문 만들기
                    </span>
                  </motion.div>
                )}
                
                {/* Survey Cards */}
                {filteredSurveys.map((survey, index) => (
                  <FormCard
                    key={survey.surveyId}
                    survey={survey}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="card overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary-50 text-sm font-medium text-text-secondary border-b border-border">
                  <div className="col-span-5">제목</div>
                  <div className="col-span-2">상태</div>
                  <div className="col-span-2">응답 수</div>
                  <div className="col-span-2">완료율</div>
                  <div className="col-span-1">수정일</div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y divide-border">
                  {filteredSurveys.map((survey) => (
                    <FormListItem
                      key={survey.surveyId}
                      survey={survey}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {surveyData.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-outline px-3 py-2 disabled:opacity-50"
                  >
                    이전
                  </button>
                  
                  {Array.from({ length: surveyData.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors
                        ${page === currentPage 
                          ? 'bg-primary-500 text-white' 
                          : 'hover:bg-secondary-100'}`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === surveyData.totalPages}
                    className="btn-outline px-3 py-2 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary-400">
                <path d="M9 9h.01M15 9h.01M9 15h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">설문이 없습니다</h3>
            <p className="text-text-secondary mb-6">새로운 설문을 만들어 시작해보세요</p>
            {showAddButton && (
              <button onClick={handleAddClick} className="btn-primary">
                새 설문 만들기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
