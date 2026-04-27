import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePaginationSurveyList from '../hooks/usePaginationSurveyList';
import { useResponsive } from '../hooks/useResponsive';
import noImage from '../assets/noImage.png';

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
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
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

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 5h10" />
    <path d="M11 9h7" />
    <path d="M11 13h4" />
    <path d="M3 17l3 3 3-3" />
    <path d="M6 18V4" />
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
  { value: 'attendCount', label: '응답순' },
];

// Mock featured templates
const FEATURED_TEMPLATES = [
  {
    id: 1,
    title: '고객 만족도 (CSAT)',
    description: '고객 경험을 측정하고 개선 포인트를 찾기 위한 표준 CSAT 설문지',
    author: '김민준',
    verified: true,
    questions: 10,
    time: '3분',
    likes: 342,
    category: '고객 만족',
    featured: true,
  },
  {
    id: 2,
    title: 'NPS 추천 지수 조사',
    description: '순추천 고객 지수를 측정하여 충성도를 파악하는 설문',
    author: '이수진',
    verified: true,
    questions: 5,
    time: '1분',
    likes: 218,
    category: '고객 만족',
    featured: true,
  },
  {
    id: 3,
    title: '신제품 시장 조사',
    description: '신제품 출시 전 시장 반응과 소비자 니즈를 파악하는 설문',
    author: '박서연',
    verified: true,
    questions: 15,
    time: '5분',
    likes: 156,
    category: '시장 조사',
    featured: true,
  },
  {
    id: 4,
    title: '이벤트 피드백 수집',
    description: '행사 또는 웨비나 참가자의 만족도와 개선사항을 수집',
    author: '강민서',
    verified: true,
    questions: 8,
    time: '2분',
    likes: 203,
    category: '이벤트',
    featured: true,
  },
];

function AllForm() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedTemplates, setLikedTemplates] = useState<number[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<number[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

  const { data, currentPage, handlePageChange, refetch } = usePaginationSurveyList('allForm');

  const toggleLike = (id: number) => {
    setLikedTemplates(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSave = (id: number) => {
    setSavedTemplates(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Combine API data with mock data for display
  const allTemplates = [
    ...FEATURED_TEMPLATES.filter(t => !t.featured),
    ...(data?.surveys?.map((survey, index) => ({
      id: survey.surveyId,
      title: survey.title,
      description: '설문 템플릿입니다.',
      author: '익명',
      verified: Math.random() > 0.5,
      questions: Math.floor(Math.random() * 15) + 5,
      time: `${Math.floor(Math.random() * 6) + 2}분`,
      likes: survey.attendCount || Math.floor(Math.random() * 100),
      category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1].label,
      image: survey.mainImageUrl,
      featured: false,
    })) || []),
  ];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === CATEGORIES.find(c => c.id === selectedCategory)?.label;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-full bg-background-secondary">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-text-primary">템플릿 라이브러리</h1>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-secondary-400">
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
              onClick={() => setShowShareModal(true)}
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
            <StarIcon />
            <h2 className="text-lg font-semibold text-text-primary">Featured Templates</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_TEMPLATES.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl overflow-hidden cursor-pointer group hover:shadow-card-hover transition-all"
                onClick={() => navigate(`/responseform?id=${template.id}`)}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-primary-100 to-primary-200">
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold bg-primary-500 text-white rounded">
                    FEATURED
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(template.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${
                      savedTemplates.includes(template.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/80 text-text-secondary hover:bg-white'
                    }`}
                  >
                    <BookmarkIcon filled={savedTemplates.includes(template.id)} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-text-primary mb-1 truncate">{template.title}</h3>
                  <p className="text-sm text-text-tertiary mb-3 truncate-2">{template.description}</p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">
                      {template.author[0]}
                    </div>
                    <span className="text-sm text-text-secondary">{template.author}</span>
                    {template.verified && (
                      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <DocumentIcon />
                        {template.questions}문항
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon />
                        {template.time}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(template.id);
                      }}
                      className={`flex items-center gap-1 transition-colors ${
                        likedTemplates.includes(template.id) ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <HeartIcon filled={likedTemplates.includes(template.id)} />
                      {template.likes + (likedTemplates.includes(template.id) ? 1 : 0)}
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
                onClick={() => navigate(`/responseform?id=${template.id}`)}
              >
                {/* Image */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-secondary-100 to-secondary-200 overflow-hidden">
                  {(template as any).image ? (
                    <img
                      src={(template as any).image}
                      alt={template.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = noImage;
                      }}
                    />
                  ) : null}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(template.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${
                      savedTemplates.includes(template.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/80 text-text-secondary hover:bg-white'
                    }`}
                  >
                    <BookmarkIcon filled={savedTemplates.includes(template.id)} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-text-primary mb-1 truncate">{template.title}</h3>
                  <p className="text-sm text-text-tertiary mb-3 truncate">{template.description}</p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center text-xs font-medium text-secondary-600">
                      {template.author?.[0] || 'A'}
                    </div>
                    <span className="text-sm text-text-secondary">{template.author}</span>
                    {template.verified && (
                      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <DocumentIcon />
                        {template.questions}문항
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon />
                        {template.time}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(template.id);
                      }}
                      className={`flex items-center gap-1 transition-colors ${
                        likedTemplates.includes(template.id) ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <HeartIcon filled={likedTemplates.includes(template.id)} />
                      {template.likes + (likedTemplates.includes(template.id) ? 1 : 0)}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {data?.totalPages && data.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary-50 disabled:opacity-50"
                >
                  이전
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-primary-500 text-white'
                        : 'hover:bg-secondary-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.totalPages}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary-50 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share Template Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
            <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-border-light">
                <h3 className="text-lg font-semibold text-text-primary">템플릿 공유하기</h3>
                <p className="text-sm text-text-tertiary mt-1">내 설문을 드래그하거나 직접 입력해서 공유하세요</p>
              </div>

              <div className="p-6">
                {/* Drop Zone */}
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-6">
                  <p className="text-text-tertiary">아래 목록에서 설문을 드래그하거나 클릭하세요</p>
                </div>

                {/* My Surveys */}
                <div className="space-y-2 max-h-48 overflow-y-auto mb-6">
                  {data?.surveys?.slice(0, 3).map((survey) => (
                    <div key={survey.surveyId} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary-50">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <DocumentIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">{survey.title}</p>
                        <p className="text-xs text-text-tertiary">{survey.attendCount || 0}명 응답</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Template Info Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">제목 *</label>
                    <input
                      type="text"
                      placeholder="예: 고객 만족도 조사 v2"
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">설명 *</label>
                    <textarea
                      placeholder="이 템플릿이 어떤 용도인지 설명해주세요"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">카테고리</label>
                      <select className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary-500">
                        {CATEGORIES.slice(1).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">문항 수</label>
                      <input
                        type="number"
                        placeholder="5"
                        className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">태그 (쉼표로 구분)</label>
                    <input
                      type="text"
                      placeholder="예: 고객만족, CSAT, 서비스"
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border-light flex justify-end gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-6 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-secondary-50"
                >
                  취소
                </button>
                <button className="px-6 py-2.5 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                  공유하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllForm;
