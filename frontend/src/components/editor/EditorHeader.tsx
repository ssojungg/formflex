import React from 'react';
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
}

function EditorHeader({
  survey,
  setSurvey,
  devicePreview,
  setDevicePreview,
  onSave,
  isEditMode,
  isMobile,
}: EditorHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card flex-shrink-0">
      {/* Left - Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/myform')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          type="text"
          value={survey.title || ''}
          onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="새 설문조사"
          className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-40 md:w-auto"
        />
      </div>

      {/* Center - Device Preview Toggle (Desktop Only) */}
      {!isMobile && (
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setDevicePreview('desktop')}
            className={`p-2 rounded-md transition-colors ${
              devicePreview === 'desktop' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
            }`}
            aria-label="데스크톱 미리보기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </button>
          <button
            onClick={() => setDevicePreview('tablet')}
            className={`p-2 rounded-md transition-colors ${
              devicePreview === 'tablet' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
            }`}
            aria-label="태블릿 미리보기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </button>
          <button
            onClick={() => setDevicePreview('mobile')}
            className={`p-2 rounded-md transition-colors ${
              devicePreview === 'mobile' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
            }`}
            aria-label="모바일 미리보기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {}}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
        >
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
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
          </svg>
          AI로 생성
        </button>

        <button
          onClick={() => {}}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
        >
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
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          저장
        </button>

        <button
          onClick={() => navigate(`/preview/${survey.userId}`)}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
        >
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
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          미리보기
        </button>

        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
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
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          {isMobile ? '' : isEditMode ? '수정하기' : '배포하기'}
        </button>
      </div>
    </header>
  );
}

export default EditorHeader;
