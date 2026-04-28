import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import usePaginationSurveyList from '../hooks/usePaginationSurveyList';
import { useAuthStore } from '../store/AuthStore';
import { useResponsive } from '../hooks/useResponsive';
import { getIdAPI, patchProfileAPI } from '../api/myprofile';
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

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

type Tab = 'created' | 'participated' | 'settings';

function surveyIsActive(deadline: string, open?: boolean): boolean {
  if (open === false) return false;
  if (deadline && new Date(deadline) < new Date()) return false;
  return true;
}

function MyPage() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { userId, setUserId, setLoginStatus, userName, userEmail, setUserName } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('created');

  // Profile edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordConfirm, setEditPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Fetched profile
  const [profileName, setProfileName] = useState(userName || '');
  const [profileEmail, setProfileEmail] = useState(userEmail || '');

  const { data: myFormsData, isPending: formsLoading } = usePaginationSurveyList('myForm');
  const { data: myResponsesData } = usePaginationSurveyList('myResponse');

  // Fetch real user profile on mount
  useEffect(() => {
    if (userId) {
      getIdAPI(userId).then((data) => {
        if (data?.name) { setProfileName(data.name); setUserName(data.name); }
        if (data?.email) setProfileEmail(data.email);
      }).catch(() => {});
    }
  }, [userId]);

  // Sync from authStore
  useEffect(() => {
    if (userName && !profileName) setProfileName(userName);
    if (userEmail && !profileEmail) setProfileEmail(userEmail);
  }, [userName, userEmail]);

  const patchMutation = useMutation({
    mutationFn: (updates: { name?: string; password?: string }) =>
      patchProfileAPI(userId as number, updates),
    onSuccess: (_data, variables) => {
      if (variables.name) { setProfileName(variables.name); setUserName(variables.name); }
      setEditSuccess(true);
      setEditError('');
      setTimeout(() => { setShowEditModal(false); setEditSuccess(false); }, 1200);
    },
    onError: () => setEditError('저장에 실패했습니다. 다시 시도해주세요.'),
  });

  const handleOpenEdit = () => {
    setEditName(profileName);
    setEditPassword('');
    setEditPasswordConfirm('');
    setEditError('');
    setEditSuccess(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const updates: { name?: string; password?: string } = {};
    if (editName.trim() && editName.trim() !== profileName) {
      updates.name = editName.trim();
    }
    if (editPassword) {
      if (editPassword !== editPasswordConfirm) {
        setEditError('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (editPassword.length < 6) {
        setEditError('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      updates.password = editPassword;
    }
    if (Object.keys(updates).length === 0) {
      setEditError('변경된 내용이 없습니다.');
      return;
    }
    patchMutation.mutate(updates);
  };

  const handleLogout = () => {
    setUserId(null);
    setLoginStatus(false);
    navigate('/', { replace: true });
  };

  const tabs = [
    { id: 'created' as Tab, label: '내가 만든 설문', icon: DocumentIcon, count: myFormsData?.surveys?.length || 0 },
    { id: 'participated' as Tab, label: '내가 참여한 설문', icon: CheckCircleIcon, count: myResponsesData?.surveys?.length || 0 },
    { id: 'settings' as Tab, label: '계정 설정', icon: SettingsIcon },
  ];

  const displayInitial = profileName
    ? profileName.charAt(0).toUpperCase()
    : profileEmail
    ? profileEmail.charAt(0).toUpperCase()
    : 'U';

  return (
    <div className="min-h-full bg-background-secondary">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {displayInitial}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-text-primary truncate">
                {profileName || profileEmail || '사용자'}
              </h1>
              <p className="text-text-tertiary truncate">{profileEmail}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-text-tertiary">
                  가입 ID: {userId}
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenEdit}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary-50 flex items-center gap-2 flex-shrink-0"
            >
              <EditIcon />
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
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
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
                  <span className={isMobile ? 'hidden' : ''}>{tab.label}</span>
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
                  {formsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : myFormsData?.surveys?.length ? (
                    myFormsData.surveys.map((survey) => {
                      const isActive = surveyIsActive(survey.deadline, survey.open);
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
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary-400">
                                <DocumentIcon />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-text-primary truncate">{survey.title}</h3>
                              <span className={`shrink-0 px-2 py-0.5 text-xs rounded ${
                                isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-secondary-100 text-secondary-600'
                              }`}>
                                {isActive ? '진행중' : '종료'}
                              </span>
                            </div>
                            <p className="text-sm text-text-tertiary">
                              응답 {survey.attendCount || 0}명 · 마감일 {survey.deadline ? new Date(survey.deadline).toLocaleDateString('ko-KR') : '없음'}
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
                              onClick={() => navigate(`/responseform?id=${survey.surveyId}`)}
                              className="p-2 text-secondary-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg"
                              title="설문 보기"
                            >
                              <EyeIcon />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-400">
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
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary-400">
                              <CheckCircleIcon />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-text-primary truncate mb-1">{survey.title}</h3>
                          <p className="text-sm text-text-tertiary">
                            응답 {survey.attendCount || 0}명
                          </p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary-400 flex-shrink-0">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-400">
                        <CheckCircleIcon />
                      </div>
                      <p className="text-text-secondary mb-4">아직 참여한 설문이 없습니다</p>
                      <button
                        onClick={() => navigate('/surveys')}
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

                  {/* Account */}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">계정</h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-secondary-50"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-text-primary">프로필 편집</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 text-text-tertiary hover:text-text-primary hover:bg-secondary-50 rounded-lg"
                  >
                    <CloseIcon />
                  </button>
                </div>

                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                    {editName ? editName.charAt(0).toUpperCase() : displayInitial}
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">이름</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">이메일</label>
                    <input
                      type="email"
                      value={profileEmail}
                      disabled
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-secondary-50 text-text-tertiary text-sm"
                    />
                    <p className="text-xs text-text-tertiary mt-1">이메일은 변경할 수 없습니다</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      새 비밀번호 <span className="text-text-tertiary font-normal">(변경 시에만 입력)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="새 비밀번호 (6자 이상)"
                        className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {editPassword && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">비밀번호 확인</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editPasswordConfirm}
                        onChange={(e) => setEditPasswordConfirm(e.target.value)}
                        placeholder="비밀번호를 다시 입력하세요"
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Error / Success */}
                {editError && (
                  <p className="mt-3 text-sm text-red-500">{editError}</p>
                )}
                {editSuccess && (
                  <p className="mt-3 text-sm text-green-600 font-medium">저장되었습니다!</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-secondary-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={patchMutation.isPending}
                    className="flex-1 py-2.5 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                  >
                    {patchMutation.isPending ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyPage;
