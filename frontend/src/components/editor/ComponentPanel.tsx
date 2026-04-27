import React, { useRef } from 'react';
import { EditableSurvey } from '../../types/editableSurvey';

interface ComponentPanelProps {
  activeTab: 'components' | 'style';
  setActiveTab: React.Dispatch<React.SetStateAction<'components' | 'style'>>;
  addQuestion: (type: 'MULTIPLE_CHOICE' | 'SUBJECTIVE_QUESTION' | 'CHECKBOX' | 'DROPDOWN') => void;
  survey: EditableSurvey;
  setSurvey: React.Dispatch<React.SetStateAction<EditableSurvey>>;
  onCoverImageUpload: (file: File) => void;
}

const INPUT_COMPONENTS = [
  { type: 'SUBJECTIVE_QUESTION' as const, icon: 'T', label: '단답형', description: '짧은 텍스트 응답' },
  { type: 'SUBJECTIVE_QUESTION' as const, icon: 'mail', label: '이메일', description: '이메일 주소 입력' },
  { type: 'SUBJECTIVE_QUESTION' as const, icon: 'lines', label: '장문형', description: '긴 텍스트 응답' },
  { type: 'SUBJECTIVE_QUESTION' as const, icon: '#', label: '숫자 입력', description: '숫자만 입력' },
];

const SELECT_COMPONENTS = [
  { type: 'MULTIPLE_CHOICE' as const, icon: 'radio', label: '단일 선택', description: '하나만 선택' },
  { type: 'CHECKBOX' as const, icon: 'check', label: '복수 선택', description: '여러 개 선택' },
  { type: 'DROPDOWN' as const, icon: 'dropdown', label: '드롭다운', description: '목록에서 선택' },
  { type: 'MULTIPLE_CHOICE' as const, icon: 'star', label: '별점', description: '1~5점 평가' },
];

const OTHER_COMPONENTS = [
  { icon: 'calendar', label: '날짜 선택', description: '날짜 입력' },
  { icon: 'divider', label: '섹션 구분선', description: '섹션 분리' },
];

const COLORS = [
  '#6B8E6B', '#8FAE8F', '#A3C9A3', '#7BA37B',
  '#5C7A5C', '#4A6B4A', '#3D5C3D', '#2E4D2E',
];

const FONTS = [
  { id: 'pretendard', name: '프리텐다드' },
  { id: 'tmoney', name: '티머니 둥근바람' },
  { id: 'nps', name: '국민연금체' },
  { id: 'omyu', name: '오뮤 다예쁨체' },
];

function ComponentPanel({
  activeTab,
  setActiveTab,
  addQuestion,
  survey,
  setSurvey,
  onCoverImageUpload,
}: ComponentPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'T':
        return <span className="text-lg font-bold">T</span>;
      case 'mail':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
      case 'lines':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="15" y2="18" />
          </svg>
        );
      case '#':
        return <span className="text-lg font-bold">#</span>;
      case 'radio':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        );
      case 'check':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      case 'dropdown':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        );
      case 'star':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'divider':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'components'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          컴포넌트
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          스타일
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'components' ? (
          <div className="space-y-6">
            {/* Input Components */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">입력</h3>
              <div className="space-y-2">
                {INPUT_COMPONENTS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => addQuestion(item.type)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      {renderIcon(item.icon)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Components */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">선택형</h3>
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">이미지 추가 가능</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                질문 추가 후 카드를 클릭하면 상단에 이미지 버튼이 나타납니다.
              </p>
              <div className="space-y-2">
                {SELECT_COMPONENTS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => addQuestion(item.type)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      {renderIcon(item.icon)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Other Components */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">기타</h3>
              <div className="space-y-2">
                {OTHER_COMPONENTS.map((item, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      {renderIcon(item.icon)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-medium text-primary mb-1">이미지 추가 방법</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    선택형 질문 카드를 클릭하면 상단에 이미지 버튼이 나타납니다. AI 생성 또는 PC에서 직접 업로드할 수 있어요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cover Image */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">커버 이미지</h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center bg-muted/30"
              >
                {survey.mainImageUrl ? (
                  <img
                    src={survey.mainImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground mb-2">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <p className="text-xs text-muted-foreground">클릭하여 이미지 업로드</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onCoverImageUpload(file);
                }}
              />
            </div>

            {/* Theme Color */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">테마 색상</h3>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSurvey((prev) => ({ ...prev, color }))}
                    className={`w-full aspect-square rounded-lg transition-all ${
                      survey.color === color ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">글꼴</h3>
              <div className="space-y-2">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSurvey((prev) => ({ ...prev, font: font.id }))}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                      survey.font === font.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className={`text-sm font-${font.id}`}>{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Button Style */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">버튼 스타일</h3>
              <div className="flex gap-2">
                {(['angled', 'smooth', 'round'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSurvey((prev) => ({ ...prev, buttonStyle: style }))}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      survey.buttonStyle === style
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div
                      className={`w-full h-6 bg-primary ${
                        style === 'angled' ? 'rounded-none' : style === 'smooth' ? 'rounded-md' : 'rounded-full'
                      }`}
                    />
                    <p className="text-xs text-center mt-2 text-muted-foreground">
                      {style === 'angled' ? '각지게' : style === 'smooth' ? '부드럽게' : '둥글게'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComponentPanel;
