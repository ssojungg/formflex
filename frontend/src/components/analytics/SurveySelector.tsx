import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMySurveyAPI } from '../../api/getForm';
import { useAuthStore } from '../../store/AuthStore';

interface SurveySelectorProps {
  selectedId: number;
  onSelect: (id: number) => void;
}

function SurveySelector({ selectedId, onSelect }: SurveySelectorProps) {
  const userId = useAuthStore((state) => state.userId);

  const { data } = useQuery({
    queryKey: ['myForm', userId],
    queryFn: () => getMySurveyAPI({ userId: userId as number, currentPage: 1 }),
    enabled: !!userId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary text-primary';
      case 'closed':
        return 'bg-muted-foreground text-muted-foreground';
      default:
        return 'bg-muted-foreground text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'closed':
        return '종료';
      default:
        return '초안';
    }
  };

  // Mock surveys for demo
  const mockSurveys = [
    { id: 1, title: '새 설문조사', status: 'active', questions: 14, responses: 0 },
    { id: 2, title: '2024 고객 만족도 조사', status: 'active', questions: 10, responses: 1284 },
    { id: 3, title: '신제품 출시 전 시장 조사', status: 'active', questions: 15, responses: 876 },
    { id: 4, title: '직원 만족도 설문 2024', status: 'active', questions: 12, responses: 243 },
    { id: 5, title: 'UX 리서치 - 앱 개편안', status: 'draft', questions: 8, responses: 0 },
    { id: 6, title: '브랜드 인지도 설문', status: 'closed', questions: 20, responses: 2451 },
    { id: 7, title: '이벤트 참가자 피드백', status: 'closed', questions: 6, responses: 534 },
    { id: 8, title: '서비스 NPS 조사', status: 'active', questions: 5, responses: 1102 },
    { id: 9, title: '온보딩 경험 개선 조사', status: 'draft', questions: 7, responses: 0 },
  ];

  const surveys = data?.surveys || mockSurveys;

  return (
    <div className="py-2">
      {surveys.map((survey: any) => (
        <button
          key={survey.id}
          onClick={() => onSelect(survey.id)}
          className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted ${
            selectedId === survey.id ? 'bg-primary/5 border-l-2 border-primary' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {survey.title}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(survey.status || 'active')}`} />
                <span className="text-xs text-muted-foreground">
                  {getStatusLabel(survey.status || 'active')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {survey.responses || 0}명
                </span>
              </div>
            </div>
            {selectedId === survey.id && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary flex-shrink-0"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export default SurveySelector;
