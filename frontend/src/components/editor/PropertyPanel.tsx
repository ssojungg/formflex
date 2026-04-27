import React, { useState } from 'react';
import { EditableSurvey, EditableQuestions, EditableObjectiveQuestion } from '../../types/editableSurvey';

interface PropertyPanelProps {
  survey: EditableSurvey;
  setSurvey: React.Dispatch<React.SetStateAction<EditableSurvey>>;
  selectedQuestionIndex: number | null;
  updateQuestion: (questionId: number, updatedData: EditableQuestions) => void;
}

function PropertyPanel({
  survey,
  setSurvey,
  selectedQuestionIndex,
  updateQuestion,
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'ai'>('properties');

  const selectedQuestion = selectedQuestionIndex !== null ? survey.questions[selectedQuestionIndex] : null;

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return '단일 선택';
      case 'CHECKBOX':
        return '복수 선택';
      case 'DROPDOWN':
        return '드롭다운';
      case 'SUBJECTIVE_QUESTION':
        return '텍스트 입력';
      default:
        return type;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'properties'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          속성
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'ai'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          AI 질문
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' ? (
          selectedQuestion ? (
            <div className="space-y-6">
              {/* Question Type Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  PROPERTIES
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                  {getQuestionTypeLabel(selectedQuestion.type)}
                </span>
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">레이블</label>
                <input
                  type="text"
                  value={selectedQuestion.content}
                  onChange={(e) => {
                    if (selectedQuestionIndex !== null) {
                      updateQuestion(selectedQuestionIndex, {
                        ...selectedQuestion,
                        content: e.target.value,
                      });
                    }
                  }}
                  placeholder="질문 입력"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Placeholder (for text questions) */}
              {selectedQuestion.type === 'SUBJECTIVE_QUESTION' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">플레이스홀더</label>
                  <input
                    type="text"
                    placeholder="답변 입력 안내 문구"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}

              {/* Required Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">필수</label>
                <button
                  className="relative w-11 h-6 bg-primary rounded-full transition-colors"
                  onClick={() => {}}
                >
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                </button>
              </div>

              {/* Options (for choice questions) */}
              {selectedQuestion.type !== 'SUBJECTIVE_QUESTION' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">옵션 목록</label>
                  <div className="space-y-2">
                    {(selectedQuestion as EditableObjectiveQuestion).choices?.map((choice, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-5 text-xs text-muted-foreground">{index + 1}.</span>
                        <input
                          type="text"
                          value={choice.option}
                          onChange={(e) => {
                            if (selectedQuestionIndex !== null) {
                              const objectiveQuestion = selectedQuestion as EditableObjectiveQuestion;
                              const newChoices = [...objectiveQuestion.choices];
                              newChoices[index] = { option: e.target.value };
                              updateQuestion(selectedQuestionIndex, {
                                ...selectedQuestion,
                                choices: newChoices,
                              } as EditableQuestions);
                            }
                          }}
                          placeholder={`옵션 ${index + 1}`}
                          className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (selectedQuestionIndex !== null) {
                        const objectiveQuestion = selectedQuestion as EditableObjectiveQuestion;
                        const newChoices = [...objectiveQuestion.choices, { option: '' }];
                        updateQuestion(selectedQuestionIndex, {
                          ...selectedQuestion,
                          choices: newChoices,
                        } as EditableQuestions);
                      }
                    }}
                    className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    옵션 추가
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">질문을 선택하세요</h3>
              <p className="text-xs text-muted-foreground">
                미리보기에서 질문을 클릭하면<br />속성을 편집할 수 있습니다
              </p>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">AI로 질문 생성</h3>
              <p className="text-xs text-muted-foreground mb-4">
                설문 주제를 입력하면 AI가 적절한 질문을 추천해드립니다.
              </p>
              <textarea
                placeholder="예: 고객 만족도 조사를 위한 질문을 만들어주세요"
                rows={4}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <button className="mt-3 w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                질문 생성하기
              </button>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">추천 질문</h4>
              <div className="space-y-2">
                {[
                  '전반적인 서비스 만족도는 어떠셨나요?',
                  '다음에도 저희 서비스를 이용하시겠습니까?',
                  '개선이 필요한 부분이 있다면 알려주세요.',
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full p-3 text-left text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Survey Settings (Always visible at bottom) */}
      <div className="border-t border-border p-4 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">설문 설정</h3>
        
        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">마감일</label>
          <input
            type="date"
            value={survey.deadline}
            onChange={(e) => setSurvey((prev) => ({ ...prev, deadline: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Public/Private Toggle */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">공개 설정</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSurvey((prev) => ({ ...prev, open: true }))}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                survey.open
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                전체 공개
              </div>
            </button>
            <button
              onClick={() => setSurvey((prev) => ({ ...prev, open: false }))}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                !survey.open
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                비공개
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyPanel;
