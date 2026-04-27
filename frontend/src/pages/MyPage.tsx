import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import usePaginationSurveyList from '../hooks/usePaginationSurveyList';
import { useAuthStore } from '../store/AuthStore';
import { useResponsive } from '../hooks/useResponsive';
import noImage from '../assets/noImage.png';

// Icons
const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
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

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

type Tab = 'created' | 'participated' | 'settings';

function MyPage() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { userId, setUserId, setLoginStatus } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('created');

  const { data: myFormsData } = usePaginationSurveyList('myForm');
  const { data: myResponsesData } = usePaginationSurveyList('myResponse');

  const tabs = [
    { id: 'created' as Tab, label: '내가 만든 설문', icon: DocumentIcon, count: myFormsData?.surveys?.length || 0 },
    { id: 'participated' as Tab, label: '내가 참여한 설문', icon: CheckCircleIcon, count: myResponsesData?.surveys?.length || 0 },
    { id: 'settings' as Tab, label: '계정 설정', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    setUserId(null);
    setLoginStatus(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-full bg-background-secondary">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              J
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary">Jin Soo Park</h1>
              <p className="text-text-tertiary">jinsoo@example.com</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-600 rounded-full">
                  Pro Plan
                </span>
                <span className="text-sm text-text-tertiary">가입일: 2024년 1월</span>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary-50">
              프로필 편집
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border-light">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{myFormsData?.surveys?.length || 0}</p>
              <p className="text-sm text-text-tertiary">생성한 설문</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{myResponsesData?.surveys?.length || 0}</p>
              <p className="text-sm text-text-tertiary">참여한 설문</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">
                {myFormsData?.surveys?.reduce((acc, s) => acc + (s.attendCount || 0), 0) || 0}
              </p>
              <p className="text-sm text-text-tertiary">총 응답 수</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="flex border-b border-border-light">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-500 border-b-2 border-primary-500 bg-primary-50/50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-secondary-50'
                  }`}
                >
                  <Icon />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'created' && (
                <motion.div
                  key="created"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {myFormsData?.surveys?.length ? (
                    myFormsData.surveys.map((survey) => {
                      const isActive = new Date(survey.deadline) > new Date();
                      return (
                        <div
                          key={survey.surveyId}
                          className="flex items-center gap-4 p-4 border border-border-light rounded-xl hover:bg-secondary-50 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden flex-shrink-0">
                            {survey.mainImageUrl ? (
                              <img
                                src={survey.mainImageUrl}
                                alt={survey.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = noImage; }}
                              />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-text-primary truncate">{survey.title}</h3>
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                isActive ? 'bg-green-100 text-green-700' : 'bg-secondary-100 text-secondary-600'
                              }`}>
                                {isActive ? '진행중' : '종료'}
                              </span>
                            </div>
                            <p className="text-sm text-text-tertiary">
                              응답 {survey.attendCount || 0}명 · 마감일 {new Date(survey.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/result?id=${survey.surveyId}`)}
                              className="p-2 text-secondary-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg"
                              title="분석"
                            >
                              <ChartIcon />
                            </button>
                            <button
                              onClick={() => navigate(`/edit?id=${survey.surveyId}`)}
                              className="p-2 text-secondary-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg"
                              title="수정"
                            >
                              <EditIcon />
                            </button>
                            <button
                              className="p-2 text-secondary-500 hover:text-error hover:bg-red-50 rounded-lg"
                              title="삭제"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                        <DocumentIcon />
                      </div>
                      <p className="text-text-secondary mb-4">아직 생성한 설문이 없습니다</p>
                      <button
                        onClick={() => navigate('/create')}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                      >
                        첫 설문 만들기
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'participated' && (
                <motion.div
                  key="participated"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {myResponsesData?.surveys?.length ? (
                    myResponsesData.surveys.map((survey) => (
                      <div
                        key={survey.surveyId}
                        onClick={() => navigate(`/myanswer?userId=${userId}&surveyId=${survey.surveyId}`)}
                        className="flex items-center gap-4 p-4 border border-border-light rounded-xl hover:bg-secondary-50 transition-colors cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-secondary-100 to-secondary-200 overflow-hidden flex-shrink-0">
                          {survey.mainImageUrl ? (
                            <img
                              src={survey.mainImageUrl}
                              alt={survey.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = noImage; }}
                            />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-text-primary truncate mb-1">{survey.title}</h3>
                          <p className="text-sm text-text-tertiary">
                            {survey.userName || '익명'} · 참여일 {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary-400">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon />
                      </div>
                      <p className="text-text-secondary mb-4">아직 참여한 설문이 없습니다</p>
                      <button
                        onClick={() => navigate('/all')}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                      >
                        설문 둘러보기
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl"
                >
                  {/* Profile Settings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">프로필 설정</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">이름</label>
                        <input
                          type="text"
                          defaultValue="Jin Soo Park"
                          className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">이메일</label>
                        <input
                          type="email"
                          defaultValue="jinsoo@example.com"
                          disabled
                          className="w-full px-4 py-2.5 border border-border rounded-lg bg-secondary-50 text-text-tertiary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">알림 설정</h3>
                    <div className="space-y-4">
                      {[
                        { label: '새 응답 알림', desc: '설문에 새로운 응답이 있을 때 알림을 받습니다' },
                        { label: '목표 달성 알림', desc: '설정한 응답 수에 도달하면 알림을 받습니다' },
                        { label: '마케팅 이메일', desc: 'FormFlex의 새로운 기능과 업데이트 소식을 받습니다' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-4 border border-border-light rounded-lg">
                          <div>
                            <p className="font-medium text-text-primary">{item.label}</p>
                            <p className="text-sm text-text-tertiary">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">계정</h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-secondary-50"
                      >
                        로그아웃
                      </button>
                      <button className="w-full py-3 text-sm font-medium text-error border border-error/30 rounded-lg hover:bg-error/5">
                        계정 삭제
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
