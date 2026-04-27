import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditableSurvey } from '../../types/editableSurvey';

interface EditorHeaderProps {
  survey: EditableSurvey;
  setSurvey: React.Dispatch<React.SetStateAction<EditableSurvey>>;
  devicePreview: 'desktop' | 'tablet' | 'mobile';
  setDevicePreview: React.Dispatch<React.SetStateAction<'desktop' | 'tablet' | 'mobile'>>;
  onSave: () => void;
  isEditMode: boolean;
  isMobile: boolean;
  onAiGenerate?: () => void;
}

function EditorHeader({
  survey,
  setSurvey,
  devicePreview,
  setDevicePreview,
  onSave,
  isEditMode,
  isMobile,
  onAiGenerate,
}: EditorHeaderProps) {
  const navigate = useNavigate();
  const [showPublishModal, setShowPublishModal] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between h-14 md:h-16 px-3 md:px-6 border-b border-border-light bg-white flex-shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <button
            onClick={() => navigate('/myform')}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors flex-shrink-0"
            aria-label="뒤로가기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={survey.title || ''}
              onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="새 설문조사"
              className="text-base md:text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full truncate text-text-primary placeholder:text-text-tertiary"
            />
          </div>
        </div>

        {/* Center Section - Device Preview (Desktop Only) */}
        {!isMobile && (
          <div className="hidden lg:flex items-center gap-1 bg-surface-secondary rounded-lg p-1">
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-2 rounded-md transition-all ${
                devicePreview === 'desktop' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-text-tertiary hover:text-text-primary hover:bg-white'
              }`}
              aria-label="데스크톱 미리보기"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </button>
            <button
              onClick={() => setDevicePreview('tablet')}
              className={`p-2 rounded-md transition-all ${
                devicePreview === 'tablet' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-text-tertiary hover:text-text-primary hover:bg-white'
              }`}
              aria-label="태블릿 미리보기"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-2 rounded-md transition-all ${
                devicePreview === 'mobile' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-text-tertiary hover:text-text-primary hover:bg-white'
              }`}
              aria-label="모바일 미리보기"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* AI Generate Button */}
          <button
            onClick={onAiGenerate}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              <path d="M20 3v4" />
              <path d="M22 5h-4" />
            </svg>
            <span className="hidden md:inline">AI로 생성</span>
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-border-light rounded-lg hover:bg-surface-secondary transition-colors text-sm font-medium text-text-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span className="hidden md:inline">저장</span>
          </button>

          {/* Preview Button */}
          <button
            onClick={() => {}}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-border-light rounded-lg hover:bg-surface-secondary transition-colors text-sm font-medium text-text-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="hidden md:inline">미리보기</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span className="hidden sm:inline">{isEditMode ? '수정하기' : '배포하기'}</span>
          </button>
        </div>
      </header>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPublishModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center gap-3 p-5 border-b border-border-light">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">설문 배포하기</h3>
                <p className="text-sm text-text-tertiary">{survey.title || '새 설문조사'}</p>
              </div>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="ml-auto p-2 hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5">
              {/* Share Link */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">배포 링크</label>
                <div className="flex items-center gap-2 p-3 bg-surface-secondary rounded-xl border border-border-light">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary flex-shrink-0">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="flex-1 text-sm text-text-secondary truncate">
                    https://formflex.io/s/abc123xyz
                  </span>
                  <button className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                    복사
                  </button>
                </div>
              </div>

              {/* Auto Email */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">자동 이메일 발송</p>
                      <p className="text-xs text-text-tertiary mt-0.5">설정한 응답 수 달성 시 분석 결과를 이메일로 자동 발송합니다</p>
                    </div>
                  </div>
                  <button className="relative w-11 h-6 bg-primary rounded-full transition-colors flex-shrink-0">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">몇 명이 응답하면 이메일을 보낼까요?</label>
                    <div className="flex gap-2">
                      {['50명', '100명', '200명', '500명'].map((count) => (
                        <button
                          key={count}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            count === '100명'
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-text-secondary border-border-light hover:border-primary'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">이메일 주소</label>
                    <input
                      type="email"
                      placeholder="report@example.com"
                      className="w-full px-3 py-2.5 text-sm border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1.5 text-xs text-text-tertiary flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      응답 수 달성 시 분석 리포트가 이 주소로 자동 발송됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Access Settings */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">공개 설정</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSurvey((prev) => ({ ...prev, open: true }))}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      survey.open
                        ? 'border-primary bg-primary/5'
                        : 'border-border-light hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span className="font-medium text-sm text-text-primary">전체 공개</span>
                    </div>
                    <p className="text-xs text-text-tertiary">링크가 있는 누구나 참여</p>
                  </button>
                  <button
                    onClick={() => setSurvey((prev) => ({ ...prev, open: false }))}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      !survey.open
                        ? 'border-primary bg-primary/5'
                        : 'border-border-light hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <rect width="18" height="11" x="3" y="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="font-medium text-sm text-text-primary">로그인 필요</span>
                    </div>
                    <p className="text-xs text-text-tertiary">로그인한 사용자만 참여</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-border-light">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  onSave();
                }}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                지금 배포하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditorHeader;
