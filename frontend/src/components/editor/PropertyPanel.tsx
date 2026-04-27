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
  const [aiPrompt, setAiPrompt] = useState('');

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

  const suggestedQuestions = [
    '전반적인 서비스 만족도는 어떠셨나요?',
    '다음에도 저희 서비스를 이용하시겠습니까?',
    '개선이 필요한 부분이 있다면 알려주세요.',
    '친구나 동료에게 추천하시겠습니까?',
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tab Header */}
      <div className="flex border-b border-border-light">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-3.5 text-sm font-medium transition-all relative ${
            activeTab === 'properties'
              ? 'text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          속성
          {activeTab === 'properties' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3.5 text-sm font-medium transition-all relative ${
            activeTab === 'ai'
              ? 'text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          AI 질문
          {activeTab === 'ai' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' ? (
          selectedQuestion ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  PROPERTIES
                </span>
                <span className="px-2.5 py-1 text-xs font-medium bg-surface-secondary text-text-secondary rounded-lg">
                  {getQuestionTypeLabel(selectedQuestion.type)}
                </span>
              </div>

              {/* Label Input */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">레이블</label>
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
                  className="w-full px-3 py-2.5 text-sm border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Placeholder (for text questions) */}
              {selectedQuestion.type === 'SUBJECTIVE_QUESTION' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">플레이스홀더</label>
                  <input
                    type="text"
                    placeholder="답변 입력 안내 문구"
                    className="w-full px-3 py-2.5 text-sm border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              )}

              {/* Required Toggle */}
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-text-primary">필수</label>
                <button
                  className="relative w-12 h-6 bg-primary rounded-full transition-colors"
                  onClick={() => {}}
                >
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
                </button>
              </div>

              {/* Options (for choice questions) */}
              {selectedQuestion.type !== 'SUBJECTIVE_QUESTION' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">옵션 목록</label>
                  <div className="space-y-2">
                    {(selectedQuestion as EditableObjectiveQuestion).choices?.map((choice, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-surface-secondary flex items-center justify-center text-xs text-text-tertiary font-medium">
                          {index + 1}
                        </span>
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
                          className="flex-1 px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <button
                          onClick={() => {
                            if (selectedQuestionIndex !== null) {
                              const objectiveQuestion = selectedQuestion as EditableObjectiveQuestion;
                              if (objectiveQuestion.choices.length > 1) {
                                const newChoices = objectiveQuestion.choices.filter((_, i) => i !== index);
                                updateQuestion(selectedQuestionIndex, {
                                  ...selectedQuestion,
                                  choices: newChoices,
                                } as EditableQuestions);
                              }
                            }
                          }}
                          className="p-1.5 hover:bg-surface-secondary rounded-lg transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
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
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    옵션 추가
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 mb-5 rounded-2xl bg-surface-secondary flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">질문을 선택하세요</h3>
              <p className="text-sm text-text-tertiary leading-relaxed">
                미리보기에서 질문을 클릭하면<br />
                속성을 편집할 수 있습니다
              </p>
            </div>
          )
        ) : (
          /* AI Tab */
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">AI로 질문 생성</h3>
              <p className="text-xs text-text-tertiary mb-4 leading-relaxed">
                설문 주제를 입력하면 AI가 적절한 질문을 추천해드립니다.
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="예: 고객 만족도 조사를 위한 질문을 만들어주세요"
                rows={4}
                className="w-full px-4 py-3 text-sm border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
              />
              <button 
                disabled={!aiPrompt.trim()}
                className="mt-3 w-full py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                </svg>
                질문 생성하기
              </button>
            </div>

            <div className="pt-4 border-t border-border-light">
              <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">추천 질문</h4>
              <div className="space-y-2">
                {suggestedQuestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full p-3.5 text-left text-sm bg-surface-secondary hover:bg-primary/5 hover:text-primary rounded-xl transition-colors text-text-secondary leading-relaxed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Survey Settings - Fixed at bottom */}
      <div className="border-t border-border-light p-4 space-y-4 bg-white">
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">설문 설정</h3>
        
        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">마감일</label>
          <input
            type="date"
            value={survey.deadline}
            onChange={(e) => setSurvey((prev) => ({ ...prev, deadline: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Public/Private Toggle */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">공개 설정</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSurvey((prev) => ({ ...prev, open: true }))}
              className={`py-2.5 px-3 text-sm font-medium rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                survey.open
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border-light hover:border-primary/30'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              전체 공개
            </button>
            <button
              onClick={() => setSurvey((prev) => ({ ...prev, open: false }))}
              className={`py-2.5 px-3 text-sm font-medium rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                !survey.open
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border-light hover:border-primary/30'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              비공개
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyPanel;
