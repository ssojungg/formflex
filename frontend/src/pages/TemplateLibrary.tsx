import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyStore, Template } from '../store/SurveyStore';
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

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'customer', label: '고객 만족' },
  { id: 'market', label: '시장 조사' },
  { id: 'ux', label: 'UX 리서치' },
  { id: 'employee', label: '직원 설문' },
  { id: 'event', label: '이벤트' },
  { id: 'education', label: '교육' },
  { id: 'health', label: '헬스케어' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
  { value: 'usage', label: '사용순' },
];

function TemplateLibrary() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const templates = useSurveyStore((state) => state.templates);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const mySurveys = useSurveyStore((state) => state.mySurveys);
  const likedTemplates = useSurveyStore((state) => state.likedTemplates);
  const savedTemplates = useSurveyStore((state) => state.savedTemplates);
  const toggleLikeTemplate = useSurveyStore((state) => state.toggleLikeTemplate);
  const toggleSaveTemplate = useSurveyStore((state) => state.toggleSaveTemplate);
  const copyTemplate = useSurveyStore((state) => state.copyTemplate);
  const publishAsTemplate = useSurveyStore((state) => state.publishAsTemplate);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedSurveyForShare, setSelectedSurveyForShare] = useState<string | null>(null);
  const [shareCategory, setShareCategory] = useState('고객 만족');
  const [shareTitle, setShareTitle] = useState('');
  const [shareDescription, setShareDescription] = useState('');

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = templates.filter((template) => {
      const matchesCategory = selectedCategory === 'all' || 
        template.category === CATEGORIES.find((c) => c.id === selectedCategory)?.label;
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.hashtags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
    
    // Sort
    switch (sortOption) {
      case 'popular':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'usage':
        result.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'latest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return result;
  }, [templates, selectedCategory, searchTerm, sortOption]);

  // Featured templates (top 4 by likes)
  const featuredTemplates = useMemo(() => {
    return [...templates].sort((a, b) => b.likes - a.likes).slice(0, 4);
  }, [templates]);

  const handleCopyTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const newSurvey = copyTemplate(templateId);
    navigate(`/create?id=${newSurvey.id}`);
  };

  const handleShareClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setShowShareModal(true);
  };

  const handleShareTemplate = () => {
    if (!selectedSurveyForShare) return;
    publishAsTemplate(selectedSurveyForShare, shareCategory);
    setShowShareModal(false);
    setSelectedSurveyForShare(null);
    setShareTitle('');
    setShareDescription('');
  };

  return (
    <div className="min-h-full bg-background-secondary">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">템플릿 라이브러리</h1>
            <p className="text-text-tertiary mt-1">커뮤니티에서 공유한 설문 템플릿을 활용해보세요</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-tertiary">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="템플릿 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-light rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            
            {/* Share Template Button */}
            <button
              onClick={handleShareClick}
              className="px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              + 템플릿 공유하기
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-text-secondary hover:bg-secondary-50 border border-border-light'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-text-secondary">{filteredTemplates.length}개 템플릿</p>
          <div className="flex items-center gap-2">
            <SortIcon />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-sm border-none bg-transparent text-text-secondary focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Templates */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-500"><StarIcon /></span>
            <h2 className="text-lg font-semibold text-text-primary">Featured Templates</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl overflow-hidden cursor-pointer group hover:shadow-card-hover transition-all"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-primary-100 to-primary-200">
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold bg-primary-500 text-white rounded">
                    FEATURED
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveTemplate(template.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${
                      savedTemplates.includes(template.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/80 text-text-secondary hover:bg-white'
                    }`}
                  >
                    <BookmarkIcon filled={savedTemplates.includes(template.id)} />
                  </button>
                  
                  {/* Copy Button */}
                  <button
                    onClick={(e) => handleCopyTemplate(template.id, e)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-white text-primary-600 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md"
                  >
                    <CopyIcon />
                    복사하기
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-text-primary mb-1 truncate">{template.title}</h3>
                  <p className="text-sm text-text-tertiary mb-3 line-clamp-2">{template.description}</p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">
                      {template.authorName[0]}
                    </div>
                    <span className="text-sm text-text-secondary">{template.authorName}</span>
                    {template.authorVerified && (
                      <span className="text-blue-500"><CheckIcon /></span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <DocumentIcon />
                        {template.questionCount}문항
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon />
                        {template.estimatedTime}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeTemplate(template.id);
                      }}
                      className={`flex items-center gap-1 transition-colors ${
                        likedTemplates.includes(template.id) ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <HeartIcon filled={likedTemplates.includes(template.id)} />
                      {template.likes}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* All Templates */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">모든 템플릿</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 6) * 0.05 }}
                className="bg-white rounded-xl overflow-hidden cursor-pointer group hover:shadow-card-hover transition-all"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-secondary-100 to-secondary-200 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveTemplate(template.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${
                      savedTemplates.includes(template.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/80 text-text-secondary hover:bg-white'
                    }`}
                  >
                    <BookmarkIcon filled={savedTemplates.includes(template.id)} />
                  </button>
                  
                  {/* Copy Button */}
                  <button
                    onClick={(e) => handleCopyTemplate(template.id, e)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-white text-primary-600 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md"
                  >
                    <CopyIcon />
                    복사하기
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs bg-secondary-100 text-text-secondary rounded">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="font-medium text-text-primary mb-1 truncate">{template.title}</h3>
                  <p className="text-sm text-text-tertiary mb-3 truncate">{template.description}</p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center text-xs font-medium text-secondary-600">
                      {template.authorName[0]}
                    </div>
                    <span className="text-sm text-text-secondary">{template.authorName}</span>
                    {template.authorVerified && (
                      <span className="text-blue-500"><CheckIcon /></span>
                    )}
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.hashtags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-primary-600">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-text-tertiary pt-3 border-t border-border-light">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <DocumentIcon />
                        {template.questionCount}문항
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon />
                        {template.estimatedTime}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeTemplate(template.id);
                      }}
                      className={`flex items-center gap-1 transition-colors ${
                        likedTemplates.includes(template.id) ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <HeartIcon filled={likedTemplates.includes(template.id)} />
                      {template.likes}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">템플릿이 없습니다</h3>
            <p className="text-text-tertiary">다른 카테고리를 선택하거나 직접 템플릿을 공유해보세요</p>
          </div>
        )}

        {/* Share Template Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={() => setShowShareModal(false)} 
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-border-light">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">템플릿 공유하기</h3>
                    <p className="text-sm text-text-tertiary mt-1">내 설문을 커뮤니티와 공유하세요</p>
                  </div>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="p-6">
                  {/* My Surveys to Share */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      공유할 설문 선택
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border-light rounded-xl p-2">
                      {mySurveys.length === 0 ? (
                        <p className="text-center text-text-tertiary py-4">
                          공유할 설문이 없습니다. 먼저 설문을 만들어주세요.
                        </p>
                      ) : (
                        mySurveys.map((survey) => (
                          <div
                            key={survey.id}
                            onClick={() => {
                              setSelectedSurveyForShare(survey.id);
                              setShareTitle(survey.title);
                              setShareDescription(survey.description);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedSurveyForShare === survey.id
                                ? 'bg-primary-50 border border-primary-300'
                                : 'hover:bg-secondary-50 border border-transparent'
                            }`}
                          >
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                              <DocumentIcon />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text-primary truncate">{survey.title}</p>
                              <p className="text-xs text-text-tertiary">{survey.questions.length}문항</p>
                            </div>
                            {selectedSurveyForShare === survey.id && (
                              <span className="text-primary-500"><CheckIcon /></span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-primary mb-2">카테고리</label>
                    <select
                      value={shareCategory}
                      onChange={(e) => setShareCategory(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-500"
                    >
                      {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                        <option key={cat.id} value={cat.label}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border-light bg-secondary-50">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-secondary-200 rounded-xl transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleShareTemplate}
                    disabled={!selectedSurveyForShare}
                    className="px-6 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    공유하기
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Required Modal */}
        {showLoginModal && (
          <Alert
            type="login"
            title="로그인이 필요합니다"
            message="템플릿을 복사하거나 공유하려면 로그인이 필요합니다."
            buttonText="로그인하기"
            buttonClick={() => navigate('/login')}
            secondaryButtonText="회원가입"
            secondaryButtonClick={() => navigate('/signup')}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default TemplateLibrary;
