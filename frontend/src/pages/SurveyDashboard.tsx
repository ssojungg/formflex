import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyStore, Survey } from '../store/SurveyStore';
import { useAuthStore } from '../store/AuthStore';
import { useResponsive } from '../hooks/useResponsive';
import Alert from '../components/common/Alert';

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
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
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const HashtagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 5h10" />
    <path d="M11 9h7" />
    <path d="M11 13h4" />
    <path d="M3 17l3 3 3-3" />
    <path d="M6 18V4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Popular hashtags
const POPULAR_HASHTAGS = ['#고객만족', '#시장조사', '#HR', '#이벤트', '#NPS', '#UX', '#피드백', '#마케팅'];

const STATUS_LABELS = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Closed', color: 'bg-red-100 text-red-700' },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
};

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'responses', label: '응답순' },
];

function SurveyDashboard() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const publicSurveys = useSurveyStore((state) => state.publicSurveys);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [sortOption, setSortOption] = useState('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [previewSurvey, setPreviewSurvey] = useState<Survey | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Filter and sort surveys
  const filteredSurveys = useMemo(() => {
    let result = publicSurveys.filter((survey) => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Hashtag filter
      const matchesHashtag = !selectedHashtag || 
        survey.hashtags.some((tag) => `#${tag}`.toLowerCase() === selectedHashtag.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
      
      return matchesSearch && matchesHashtag && matchesStatus;
    });
    
    // Sort
    switch (sortOption) {
      case 'popular':
        result.sort((a, b) => b.responseCount - a.responseCount);
        break;
      case 'responses':
        result.sort((a, b) => b.responseCount - a.responseCount);
        break;
      case 'latest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return result;
  }, [publicSurveys, searchTerm, selectedHashtag, statusFilter, sortOption]);

  // Get all unique hashtags from surveys
  const allHashtags = useMemo(() => {
    const tags = new Set<string>();
    publicSurveys.forEach((survey) => {
      survey.hashtags.forEach((tag) => tags.add(`#${tag}`));
    });
    return Array.from(tags);
  }, [publicSurveys]);

  const handleSurveyClick = (surveyId: string) => {
    // Check if user is logged in before allowing to respond
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigate(`/responseform?id=${surveyId}`);
  };

  const handlePreviewClick = (e: React.MouseEvent, survey: Survey) => {
    e.stopPropagation();
    setPreviewSurvey(survey);
    setShowPreviewModal(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-full bg-background-secondary">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-2">설문 탐색</h1>
          <p className="text-text-tertiary">다양한 설문에 참여하고 의견을 공유하세요</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 shadow-card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-tertiary">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="설문 제목 또는 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background-secondary border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-secondary-100'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-primary-500 text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-secondary-100'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'closed'
                    ? 'bg-primary-500 text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-secondary-100'
                }`}
              >
                Closed
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-background-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <ListIcon />
              </button>
            </div>
          </div>

          {/* Hashtag Pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm text-text-tertiary whitespace-nowrap flex items-center gap-1">
              <HashtagIcon /> 인기 태그:
            </span>
            {POPULAR_HASHTAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedHashtag(selectedHashtag === tag ? null : tag)}
                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                  selectedHashtag === tag
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Sort */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-secondary">
            {filteredSurveys.length}개의 설문
            {selectedHashtag && <span className="text-primary-600 font-medium"> ({selectedHashtag})</span>}
          </p>
          
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              <SortIcon />
              {SORT_OPTIONS.find((o) => o.value === sortOption)?.label}
              <ChevronDownIcon />
            </button>
            
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-border py-1 z-10 min-w-[120px]">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 ${
                      sortOption === option.value ? 'text-primary-600 font-medium' : 'text-text-secondary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              {filteredSurveys.map((survey, index) => (
                <motion.div
                  key={survey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSurveyClick(survey.id)}
                  className="bg-white rounded-xl overflow-hidden cursor-pointer group hover:shadow-card-hover transition-all"
                >
                  {/* Card Header with gradient */}
                  <div 
                    className="relative h-32 p-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${survey.themeColor}20 0%, ${survey.themeColor}40 100%)` 
                    }}
                  >
                    <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded ${STATUS_LABELS[survey.status].color}`}>
                      {STATUS_LABELS[survey.status].label}
                    </span>
                    
                    {/* Decorative lines (like the design image) */}
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
                  <div className="p-4">
                    <h3 className="font-semibold text-text-primary mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {survey.title}
                    </h3>
                    <p className="text-sm text-text-tertiary mb-3 line-clamp-2">
                      {survey.description}
                    </p>
                    
                    {/* Author */}
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                        style={{ backgroundColor: survey.themeColor }}
                      >
                        {survey.authorName[0]}
                      </div>
                      <span className="text-sm text-text-secondary">{survey.authorName}</span>
                    </div>
                    
                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {survey.hashtags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-text-tertiary pt-3 border-t border-border-light">
                      <span className="flex items-center gap-1">
                        <UsersIcon />
                        {survey.responseCount.toLocaleString()}명 참여
                      </span>
                      <button
                        onClick={(e) => handlePreviewClick(e, survey)}
                        className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        미리보기
                      </button>
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
                <div className="col-span-5">설문 제목</div>
                <div className="col-span-2">작성자</div>
                <div className="col-span-1">상태</div>
                <div className="col-span-2">응답 수</div>
                <div className="col-span-2">작성일</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-border-light">
                {filteredSurveys.map((survey, index) => (
                  <motion.div
                    key={survey.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleSurveyClick(survey.id)}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 hover:bg-secondary-50 cursor-pointer transition-colors"
                  >
                    <div className="md:col-span-5">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium shrink-0"
                          style={{ backgroundColor: survey.themeColor }}
                        >
                          {survey.title[0]}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-text-primary truncate">{survey.title}</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {survey.hashtags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs text-primary-600">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center">
                      <span className="text-sm text-text-secondary">{survey.authorName}</span>
                    </div>
                    
                    <div className="md:col-span-1 flex items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${STATUS_LABELS[survey.status].color}`}>
                        {STATUS_LABELS[survey.status].label}
                      </span>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center">
                      <span className="text-sm text-text-secondary">
                        {survey.responseCount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center">
                      <span className="text-sm text-text-tertiary">
                        {formatDate(survey.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredSurveys.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">검색 결과가 없습니다</h3>
            <p className="text-text-tertiary">다른 검색어나 필터를 시도해보세요</p>
          </div>
        )}
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <Alert
          type="login"
          title="로그인이 필요합니다"
          message="설문에 참여하려면 로그인이 필요합니다. 로그인 후 다시 시도해주세요."
          buttonText="로그인하기"
          buttonClick={() => navigate('/login')}
          secondaryButtonText="회원가입"
          secondaryButtonClick={() => navigate('/signup')}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Survey Preview Modal */}
      {showPreviewModal && previewSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div 
              className="h-32 p-6 relative"
              style={{ 
                background: `linear-gradient(135deg, ${previewSurvey.themeColor}30 0%, ${previewSurvey.themeColor}60 100%)` 
              }}
            >
              <button
                onClick={() => setShowPreviewModal(false)}
                className="absolute right-4 top-4 p-2 bg-white/80 hover:bg-white rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${STATUS_LABELS[previewSurvey.status].color}`}>
                {STATUS_LABELS[previewSurvey.status].label}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-text-primary mb-2">{previewSurvey.title}</h2>
              <p className="text-text-secondary mb-4">{previewSurvey.description}</p>

              {/* Author */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-light">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: previewSurvey.themeColor }}
                >
                  {previewSurvey.authorName[0]}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{previewSurvey.authorName}</p>
                  <p className="text-sm text-text-tertiary">{formatDate(previewSurvey.createdAt)}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-text-primary">{previewSurvey.questions.length}</p>
                  <p className="text-sm text-text-tertiary">질문 수</p>
                </div>
                <div className="bg-secondary-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-text-primary">{previewSurvey.responseCount.toLocaleString()}</p>
                  <p className="text-sm text-text-tertiary">참여자 수</p>
                </div>
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {previewSurvey.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-primary-50 text-primary-600 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    if (isLoggedIn) {
                      navigate(`/responseform?id=${previewSurvey.id}`);
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="flex-1 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
                >
                  설문 참여하기
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-6 py-3 bg-secondary-100 text-text-secondary font-medium rounded-xl hover:bg-secondary-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default SurveyDashboard;
