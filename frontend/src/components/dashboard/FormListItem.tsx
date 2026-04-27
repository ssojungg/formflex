import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Survey } from '../../types/survey';
import { useAuthStore } from '../../store/AuthStore';
import SurveyCoverMenu from '../survey/SurveyCoverMenu';
import Alert from '../common/Alert';

const DocumentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

interface FormListItemProps {
  survey: Survey;
}

export function FormListItem({ survey }: FormListItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const myId = useAuthStore((state) => state.userId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isActive = new Date(survey.deadline) > new Date();
  const isMyFormPage = location.pathname.includes('/myform');
  const completionRate = Math.floor(Math.random() * 30) + 70;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '-').replace('.', '');
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

  const handleRowClick = () => {
    if (location.pathname.includes('/all')) {
      if (!isActive) {
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
      <div
        onClick={handleRowClick}
        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-secondary-50 cursor-pointer transition-colors items-center relative"
      >
        {/* Title Column */}
        <div className="col-span-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-500 flex items-center justify-center flex-shrink-0">
            <DocumentIcon />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary truncate">
                {survey.title}
              </span>
              {isMyFormPage && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary-100 text-primary-600 rounded flex-shrink-0">
                  내 설문
                </span>
              )}
            </div>
            <span className="text-xs text-text-secondary">{getCategory()}</span>
          </div>
        </div>

        {/* Status Column */}
        <div className="col-span-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
            ${isActive 
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-red-50 text-red-600'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-red-500'}`} />
            {isActive ? 'Active' : 'Closed'}
          </span>
        </div>

        {/* Response Count Column */}
        <div className="col-span-2 text-text-primary">
          {(survey.attendCount || 0).toLocaleString()}
        </div>

        {/* Completion Rate Column */}
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden max-w-[100px]">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-sm text-text-secondary">{completionRate}%</span>
          </div>
        </div>

        {/* Date Column */}
        <div className="col-span-1 flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {formatDate(survey.updatedAt || survey.createdAt)}
          </span>
          
          <button
            onClick={handleMenuClick}
            className="p-1.5 rounded-lg hover:bg-secondary-200 text-secondary-400 hover:text-text-primary transition-colors"
          >
            <MoreIcon />
          </button>
        </div>

        {/* Menu */}
        {isMenuOpen && (
          <div onClick={(e) => e.stopPropagation()} className="absolute right-6 top-full z-10">
            <SurveyCoverMenu
              surveyId={survey.surveyId}
              open={survey.open}
              attendCount={survey.attendCount || 0}
              isDropdownOpen={isMenuOpen}
              setIsDropdownOpen={setIsMenuOpen}
            />
          </div>
        )}
      </div>

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

export default FormListItem;
