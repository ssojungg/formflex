import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Survey } from '../../types/survey';
import { calculateRemainingDays } from '../../utils/calculateRemainingDays';
import { useAuthStore } from '../../store/AuthStore';
import noImage from '../../assets/noImage.png';
import SurveyCoverMenu from '../survey/SurveyCoverMenu';
import Alert from '../common/Alert';

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

const PercentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

interface FormCardProps {
  survey: Survey;
  index: number;
}

export function FormCard({ survey, index }: FormCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const myId = useAuthStore((state) => state.userId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { textLabel, textColor } = calculateRemainingDays(survey.deadline);
  const isActive = new Date(survey.deadline) > new Date();
  const isMyFormPage = location.pathname.includes('/myform');
  const surveyIdCode = `D-${survey.surveyId}`;

  // Mock completion rate (since it's not in the API)
  const completionRate = Math.floor(Math.random() * 30) + 70;

  const handleCardClick = () => {
    if (location.pathname.includes('/all')) {
      if (textLabel === '마감') {
        setErrorMessage('마감된 설문입니다.');
        return;
      }
      if (survey.isAttended) {
        setErrorMessage('이미 참여한 설문입니다.');
        return;
      }
      navigate(`/responseform?id=${survey.surveyId}`);
    } else if (location.pathname.includes('/myform')) {
      navigate(`/view?id=${survey.surveyId}`);
    } else if (location.pathname.includes('/myresponses')) {
      navigate(`/myanswer?userId=${myId}&surveyId=${survey.surveyId}`);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  // Generate category tag based on title (mock data)
  const getCategory = () => {
    const title = survey.title.toLowerCase();
    if (title.includes('고객') || title.includes('만족')) return '고객 만족';
    if (title.includes('시장')) return '시장 조사';
    if (title.includes('직원') || title.includes('내부')) return '내부 조사';
    if (title.includes('이벤트')) return '이벤트';
    if (title.includes('마케팅') || title.includes('브랜드')) return '마케팅';
    return '일반';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (index + 1) * 0.05 }}
        className="card overflow-hidden cursor-pointer group hover:shadow-card-hover transition-all duration-300"
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
          {survey.mainImageUrl ? (
            <img
              src={survey.mainImageUrl}
              alt={survey.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = noImage;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-20 bg-white/30 rounded-lg flex items-center justify-center">
                <div className="space-y-2">
                  <div className="h-2 w-16 bg-white/50 rounded" />
                  <div className="h-2 w-12 bg-white/50 rounded" />
                  <div className="h-2 w-14 bg-white/50 rounded" />
                </div>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-md
            ${isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {isActive ? 'Active' : 'Closed'}
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 right-3 px-2 py-1 text-xs font-medium rounded-md 
                        bg-black/60 text-white backdrop-blur-sm">
            {getCategory()}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-text-primary truncate">
                  {survey.title}
                </h3>
                {isMyFormPage && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary-100 text-primary-600 rounded">
                    내 설문
                  </span>
                )}
              </div>
            </div>
            
            {/* More Button */}
            <button
              onClick={handleMenuClick}
              className="p-1.5 rounded-lg hover:bg-secondary-100 text-secondary-400 hover:text-text-primary transition-colors"
            >
              <MoreIcon />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-1.5">
              <DocumentIcon />
              <span>{surveyIdCode}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UsersIcon />
              <span>{survey.attendCount?.toLocaleString() || 0}</span>
            </div>
            {isMyFormPage && (
              <div className="flex items-center gap-1.5">
                <PercentIcon />
                <span>{completionRate}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        {isMenuOpen && (
          <div onClick={(e) => e.stopPropagation()}>
            <SurveyCoverMenu
              surveyId={survey.surveyId}
              open={survey.open}
              attendCount={survey.attendCount || 0}
              isDropdownOpen={isMenuOpen}
              setIsDropdownOpen={setIsMenuOpen}
            />
          </div>
        )}
      </motion.div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          buttonText="확인"
          buttonClick={() => setErrorMessage('')}
        />
      )}
    </>
  );
}

export default FormCard;
