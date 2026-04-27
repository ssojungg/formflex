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
  { type: 'SUBJECTIVE_QUESTION' as const, icon: 'text', label: '단답형' },
  { type: 'SUBJECTIVE_QUESTION' as const, icon: 'mail', label: '이메일' },
  { type: 'SUBJECTIVE_QUESTION' as const, icon: 'paragraph', label: '장문형' },
  { type: 'SUBJECTIVE_QUESTION' as const, icon: 'hash', label: '숫자 입력' },
];

const SELECT_COMPONENTS = [
  { type: 'MULTIPLE_CHOICE' as const, icon: 'radio', label: '단일 선택', hasImage: true },
  { type: 'CHECKBOX' as const, icon: 'checkbox', label: '복수 선택', hasImage: true },
  { type: 'DROPDOWN' as const, icon: 'chevron', label: '드롭다운', hasImage: false },
  { type: 'MULTIPLE_CHOICE' as const, icon: 'star', label: '별점', hasImage: false },
];

const OTHER_COMPONENTS = [
  { icon: 'calendar', label: '날짜 선택' },
  { icon: 'minus', label: '섹션 구분선' },
];

const THEME_COLORS = [
  { color: '#6B8E6B', name: 'Sage' },
  { color: '#5C7A5C', name: 'Forest' },
  { color: '#8FAE8F', name: 'Mint' },
  { color: '#7BA37B', name: 'Moss' },
  { color: '#4A6B4A', name: 'Deep Green' },
];

const FONTS = [
  { id: 'pretendard', name: '프리텐다드', preview: 'Aa' },
  { id: 'tmoney', name: '티머니 둥근바람', preview: 'Aa' },
  { id: 'nps', name: '국민연금체', preview: 'Aa' },
  { id: 'omyu', name: '오뮤 다예쁨체', preview: 'Aa' },
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

  const renderIcon = (icon: string, className = 'w-4 h-4') => {
    const iconMap: Record<string, React.ReactNode> = {
      text: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7V4h16v3" />
          <path d="M9 20h6" />
          <path d="M12 4v16" />
        </svg>
      ),
      mail: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
      paragraph: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="15" y2="18" />
        </svg>
      ),
      hash: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      ),
      radio: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      ),
      checkbox: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      chevron: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      ),
      star: (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      calendar: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      minus: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
      image: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
      lightbulb: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      ),
    };
    return iconMap[icon] || null;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tab Header */}
      <div className="flex border-b border-border-light">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 py-3.5 text-sm font-medium transition-all relative ${
            activeTab === 'components'
              ? 'text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          컴포넌트
          {activeTab === 'components' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3.5 text-sm font-medium transition-all relative ${
            activeTab === 'style'
              ? 'text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          스타일
          {activeTab === 'style' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'components' ? (
          <div className="space-y-6">
            {/* Input Components */}
            <div>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">입력</h3>
              <div className="space-y-1">
                {INPUT_COMPONENTS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => addQuestion(item.type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-secondary active:bg-surface-tertiary transition-colors text-left group"
                  >
                    <span className="text-text-tertiary group-hover:text-primary transition-colors">
                      {renderIcon(item.icon)}
                    </span>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Components */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">선택형</h3>
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                  이미지 추가 가능
                </span>
              </div>
              <p className="text-xs text-text-tertiary mb-3 leading-relaxed">
                질문 추가 후 카드를 클릭하면 상단에 이미지 버튼이 나타납니다.
              </p>
              <div className="space-y-1">
                {SELECT_COMPONENTS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => addQuestion(item.type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-secondary active:bg-surface-tertiary transition-colors text-left group"
                  >
                    <span className="text-text-tertiary group-hover:text-primary transition-colors">
                      {renderIcon(item.icon)}
                    </span>
                    <span className="flex-1 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      {item.label}
                    </span>
                    {item.hasImage && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        이미지
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Other Components */}
            <div>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">기타</h3>
              <div className="space-y-1">
                {OTHER_COMPONENTS.map((item, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-secondary transition-colors text-left group opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <span className="text-text-tertiary">
                      {renderIcon(item.icon)}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tip Card */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary">{renderIcon('lightbulb', 'w-4 h-4')}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary mb-1">이미지 추가 방법</p>
                  <p className="text-xs text-text-tertiary leading-relaxed">
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
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">커버 이미지</h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-border-light hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 bg-surface-secondary"
              >
                {survey.mainImageUrl ? (
                  <img
                    src={survey.mainImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <>
                    <span className="text-text-tertiary">{renderIcon('image', 'w-8 h-8')}</span>
                    <span className="text-sm text-text-tertiary">클릭하여 이미지 업로드</span>
                  </>
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
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">테마 색상</h3>
              <div className="flex flex-wrap gap-2">
                {THEME_COLORS.map(({ color }) => (
                  <button
                    key={color}
                    onClick={() => setSurvey((prev) => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-xl transition-all hover:scale-105 ${
                      survey.color === color 
                        ? 'ring-2 ring-offset-2 ring-primary shadow-md' 
                        : 'hover:shadow-md'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">글꼴</h3>
              <div className="space-y-2">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSurvey((prev) => ({ ...prev, font: font.id }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      survey.font === font.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border-light hover:border-primary/30'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-sm font-medium text-text-secondary font-${font.id}`}>
                      {font.preview}
                    </span>
                    <span className="text-sm font-medium text-text-primary">{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Button Style */}
            <div>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">버튼 스타일</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['angled', 'smooth', 'round'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSurvey((prev) => ({ ...prev, buttonStyle: style }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      survey.buttonStyle === style
                        ? 'border-primary bg-primary/5'
                        : 'border-border-light hover:border-primary/30'
                    }`}
                  >
                    <div
                      className={`w-full h-6 bg-primary ${
                        style === 'angled' ? 'rounded-none' : style === 'smooth' ? 'rounded-md' : 'rounded-full'
                      }`}
                    />
                    <p className="text-xs text-center mt-2 text-text-tertiary">
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
