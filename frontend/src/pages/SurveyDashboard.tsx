import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyStore, Survey } from '../store/SurveyStore';
import { useAuthStore } from '../store/AuthStore';
import Alert from '../components/common/Alert';

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Status badge styles
const STATUS_STYLES = {
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-700',
} as const;

const STATUS_LABELS = {
  active: 'Active',
  closed: 'Closed',
  draft: 'Draft',
} as const;

// Popular hashtags
const POPULAR_HASHTAGS = ['고객만족', '시장조사', 'HR', '이벤트', 'NPS', 'UX'];

function SurveyDashboard() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const publicSurveys = useSurveyStore((state) => state.publicSurveys);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [previewSurvey, setPreviewSurvey] = useState<Survey | null>(null);

  // Filter surveys
  const filteredSurveys = useMemo(() => {
    return publicSurveys.filter((survey) => {
      const matchesSearch = searchTerm === '' || 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesHashtag = !selectedHashtag || 
        survey.hashtags.some((tag) => tag.toLowerCase() === selectedHashtag.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
      
      return matchesSearch && matchesHashtag && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [publicSurveys, searchTerm, selectedHashtag, statusFilter]);

  const handleSurveyClick = (surveyId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigate(`/responseform?id=${surveyId}`);
  };

  const handlePreview = (e: React.MouseEvent, survey: Survey) => {
    e.stopPropagation();
    setPreviewSurvey(survey);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          {/* Search + Create Button Row */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="설문 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            
            {isLoggedIn && (
              <button
                onClick={() => navigate('/create')}
                className="flex items-center gap-2 px-4 py-3 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition-colors shrink-0"
              >
                <PlusIcon />
                <span className="hidden sm:inline">새 설문</span>
              </button>
            )}
          </div>
          
          {/* Status Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            {(['all', 'active', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '전체' : status === 'active' ? 'Active' : 'Closed'}
              </button>
            ))}
          </div>
          
          {/* Hashtags */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            {POPULAR_HASHTAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedHashtag(selectedHashtag === tag ? null : tag)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  selectedHashtag === tag
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-3 px-1">
          {filteredSurveys.length}개의 설문
          {selectedHashtag && <span className="text-indigo-600 font-medium"> (#{selectedHashtag})</span>}
        </p>

        {/* Survey Grid - Pure CSS responsive */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              onClick={() => handleSurveyClick(survey.id)}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div 
                className="h-24 sm:h-28 p-3 relative"
                style={{ 
                  background: `linear-gradient(135deg, ${survey.themeColor}20 0%, ${survey.themeColor}50 100%)` 
                }}
              >
                <span className={`inline-block px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded ${STATUS_STYLES[survey.status]}`}>
                  {STATUS_LABELS[survey.status]}
                </span>
                
                {/* Decorative lines */}
                <div className="absolute bottom-3 right-3 opacity-40">
                  <div className="flex flex-col gap-1">
                    <div className="h-0.5 w-10 rounded-full" style={{ backgroundColor: survey.themeColor }} />
                    <div className="h-0.5 w-7 rounded-full" style={{ backgroundColor: survey.themeColor }} />
                    <div className="h-0.5 w-4 rounded-full" style={{ backgroundColor: survey.themeColor }} />
                  </div>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1 mb-1">
                  {survey.title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-3">
                  {survey.description}
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium text-white"
                    style={{ backgroundColor: survey.themeColor }}
                  >
                    {survey.authorName[0]}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">{survey.authorName}</span>
                </div>
                
                {/* Tags - Fixed height area for consistent layout */}
                <div className="hidden sm:block h-6 mb-3">
                  <div className="flex flex-wrap gap-1">
                    {survey.hashtags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                    <UsersIcon />
                    {survey.responseCount.toLocaleString()}명
                  </span>
                  <button
                    onClick={(e) => handlePreview(e, survey)}
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    <EyeIcon />
                    <span className="hidden sm:inline">미리보기</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSurveys.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어나 필터를 시도해보세요</p>
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

      {/* Preview Modal */}
      <AnimatePresence>
        {previewSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setPreviewSurvey(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-auto"
            >
              {/* Header */}
              <div 
                className="h-28 p-4 relative"
                style={{ 
                  background: `linear-gradient(135deg, ${previewSurvey.themeColor}30 0%, ${previewSurvey.themeColor}60 100%)` 
                }}
              >
                <button
                  onClick={() => setPreviewSurvey(null)}
                  className="absolute right-3 top-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                >
                  <CloseIcon />
                </button>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${STATUS_STYLES[previewSurvey.status]}`}>
                  {STATUS_LABELS[previewSurvey.status]}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{previewSurvey.title}</h2>
                <p className="text-gray-600 mb-4">{previewSurvey.description}</p>

                {/* Author */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: previewSurvey.themeColor }}
                  >
                    {previewSurvey.authorName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{previewSurvey.authorName}</p>
                    <p className="text-sm text-gray-500">{formatDate(previewSurvey.createdAt)}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{previewSurvey.questions.length}</p>
                    <p className="text-sm text-gray-500">질문 수</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{previewSurvey.responseCount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">참여자</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {previewSurvey.hashtags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPreviewSurvey(null);
                      if (isLoggedIn) {
                        navigate(`/responseform?id=${previewSurvey.id}`);
                      } else {
                        setShowLoginModal(true);
                      }
                    }}
                    className="flex-1 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors"
                  >
                    설문 참여하기
                  </button>
                  <button
                    onClick={() => setPreviewSurvey(null)}
                    className="px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SurveyDashboard;
