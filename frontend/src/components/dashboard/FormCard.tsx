import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Survey } from '../../types/survey';
import { calculateRemainingDays } from '../../utils/calculateRemainingDays';
import { useAuthStore } from '../../store/AuthStore';
import noImage from '../../assets/noImage.png';
import SurveyCoverMenu from '../survey/SurveyCoverMenu';
import Alert from '../common/Alert';
import CoverArt from '../common/CoverArt';

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
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

  const { textLabel } = calculateRemainingDays(survey.deadline);
  const isActive = new Date(survey.deadline) > new Date();
  const isMyFormPage = location.pathname.includes('/myform');

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (index + 1) * 0.05 }}
        className="bg-white rounded-2xl border border-secondary-200 overflow-hidden cursor-pointer group hover:border-secondary-300 hover:shadow-card-hover transition-[border-color,box-shadow] duration-200"
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div className="relative aspect-[16/10] bg-secondary-50 border-b border-secondary-100 overflow-hidden">
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
            <CoverArt title={survey.title} className="transition-transform duration-500 group-hover:scale-[1.03]" />
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-white/90 text-xs font-medium text-secondary-800 backdrop-blur">
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-secondary-300'}`} />
            {isActive ? '진행중' : '종료'}
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
          <div className="flex items-center gap-4 text-[13px] text-text-secondary">
            <div className="flex items-center gap-1.5 tabular-nums">
              <UsersIcon />
              <span>{(survey.attendCount || 0).toLocaleString()}명 응답</span>
            </div>
            <span className="tabular-nums">{textLabel === '마감' ? '마감됨' : `마감 ${textLabel.replace(' - ', '-')}`}</span>
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
