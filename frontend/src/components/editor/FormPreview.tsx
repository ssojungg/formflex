import React from 'react';
import { EditableSurvey, EditableQuestions, EditableObjectiveQuestion } from '../../types/editableSurvey';

interface FormPreviewProps {
  survey: EditableSurvey;
  setSurvey: React.Dispatch<React.SetStateAction<EditableSurvey>>;
  selectedQuestionIndex: number | null;
  setSelectedQuestionIndex: React.Dispatch<React.SetStateAction<number | null>>;
  updateQuestion: (questionId: number, updatedData: EditableQuestions) => void;
  copyQuestion: (index: number) => void;
  deleteQuestion: (index: number) => void;
  handleImageUpload: (idx: number, data: EditableQuestions, event: React.ChangeEvent<HTMLInputElement>) => void;
  devicePreview: 'desktop' | 'tablet' | 'mobile';
}

function FormPreview({
  survey,
  setSurvey,
  selectedQuestionIndex,
  setSelectedQuestionIndex,
  updateQuestion,
  copyQuestion,
  deleteQuestion,
  handleImageUpload,
  devicePreview,
}: FormPreviewProps) {
  const getPreviewWidth = () => {
    switch (devicePreview) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[600px]';
      default:
        return 'max-w-[720px]';
    }
  };

  const renderQuestionPreview = (question: EditableQuestions, index: number) => {
    const isSelected = selectedQuestionIndex === index;
    const objectiveQuestion = question as EditableObjectiveQuestion;

    return (
      <div
        key={index}
        onClick={() => setSelectedQuestionIndex(index)}
        className={`group relative p-5 rounded-xl border-2 transition-all cursor-pointer ${
          isSelected
            ? 'border-primary bg-white shadow-sm'
            : 'border-transparent hover:border-border-light bg-white hover:shadow-sm'
        }`}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full" />
        )}

        {/* Question Actions - Only visible when selected */}
        {isSelected && (
          <div className="absolute -top-3 right-3 flex items-center gap-1 bg-white rounded-lg shadow-md border border-border-light p-1 z-10">
            <label className="p-1.5 hover:bg-surface-secondary rounded-md cursor-pointer transition-colors group/btn">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(index, question, e)}
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary group-hover/btn:text-primary transition-colors">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyQuestion(index);
              }}
              className="p-1.5 hover:bg-surface-secondary rounded-md transition-colors group/btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary group-hover/btn:text-primary transition-colors">
                <rect width="14" height="14" x="8" y="8" rx="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteQuestion(index);
              }}
              className="p-1.5 hover:bg-status-error/10 rounded-md transition-colors group/btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary group-hover/btn:text-status-error transition-colors">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}

        {/* Question Image */}
        {question.imageUrl && (
          <div className="mb-4 -mx-5 -mt-5 rounded-t-xl overflow-hidden">
            <img src={question.imageUrl} alt="Question" className="w-full h-40 object-cover" />
          </div>
        )}

        {/* Drag Handle & Question Content */}
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {/* Question Label */}
            <input
              type="text"
              value={question.content}
              onChange={(e) => updateQuestion(index, { ...question, content: e.target.value })}
              placeholder="질문을 입력하세요"
              className="w-full text-base font-medium bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-text-tertiary text-text-primary"
            />

            {/* Question Input Preview */}
            <div className="mt-4">
              {question.type === 'SUBJECTIVE_QUESTION' ? (
                <div className="py-2.5 px-3 rounded-lg bg-surface-secondary border border-border-light text-sm text-text-tertiary">
                  답변을 입력하세요
                </div>
              ) : (
                <div className="space-y-2">
                  {objectiveQuestion.choices?.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center gap-3 group/option">
                      {/* Radio/Checkbox Icon */}
                      {question.type === 'MULTIPLE_CHOICE' && (
                        <div className="w-5 h-5 rounded-full border-2 border-border-medium flex-shrink-0" />
                      )}
                      {question.type === 'CHECKBOX' && (
                        <div className="w-5 h-5 rounded border-2 border-border-medium flex-shrink-0" />
                      )}
                      {question.type === 'DROPDOWN' && (
                        <span className="text-xs text-text-tertiary w-5 text-center flex-shrink-0">
                          {choiceIndex + 1}.
                        </span>
                      )}
                      
                      {/* Option Input */}
                      <input
                        type="text"
                        value={choice.option}
                        onChange={(e) => {
                          const newChoices = [...objectiveQuestion.choices];
                          newChoices[choiceIndex] = { option: e.target.value };
                          updateQuestion(index, { ...question, choices: newChoices } as EditableQuestions);
                        }}
                        placeholder={`옵션 ${choiceIndex + 1}`}
                        className="flex-1 py-2 px-3 text-sm bg-surface-secondary rounded-lg border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-colors text-text-secondary placeholder:text-text-tertiary"
                      />
                      
                      {/* Delete Option */}
                      {objectiveQuestion.choices.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newChoices = objectiveQuestion.choices.filter((_, i) => i !== choiceIndex);
                            updateQuestion(index, { ...question, choices: newChoices } as EditableQuestions);
                          }}
                          className="p-1.5 opacity-0 group-hover/option:opacity-100 hover:bg-surface-secondary rounded-md transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Option Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newChoices = [...objectiveQuestion.choices, { option: '' }];
                      updateQuestion(index, { ...question, choices: newChoices } as EditableQuestions);
                    }}
                    className="flex items-center gap-2 py-2 px-3 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
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
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-secondary p-4 md:p-6 lg:p-8">
      {/* Preview Header */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-text-tertiary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span>데스크탑 미리보기</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          실시간 반영
        </div>
      </div>

      {/* Preview Container */}
      <div className={`mx-auto ${getPreviewWidth()} transition-all duration-300`}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Image */}
          <div
            className="h-32 md:h-48 relative"
            style={{
              background: survey.mainImageUrl
                ? `url(${survey.mainImageUrl}) center/cover`
                : `linear-gradient(135deg, ${survey.color}30 0%, ${survey.color}50 50%, ${survey.color}30 100%)`,
            }}
          >
            {/* Decorative pattern overlay */}
            {!survey.mainImageUrl && (
              <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke={survey.color} strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-4 md:p-8">
            {/* Title & Description Card */}
            <div className="bg-white rounded-xl shadow-sm border border-border-light p-5 mb-6 -mt-12 md:-mt-16 relative z-10">
              <input
                type="text"
                value={survey.title}
                onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="새 설문조사"
                className="w-full text-xl md:text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-text-tertiary text-text-primary"
              />
              <textarea
                value={survey.description}
                onChange={(e) => setSurvey((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="설문조사에 대한 간단한 설명을 입력하세요"
                rows={2}
                className="w-full mt-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0 resize-none placeholder:text-text-tertiary text-text-secondary leading-relaxed"
              />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {survey.questions.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-secondary flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <p className="text-text-secondary font-medium mb-1">아직 질문이 없습니다</p>
                  <p className="text-sm text-text-tertiary">
                    왼쪽 패널에서 컴포넌트를 추가하거나<br />
                    AI로 자동 생성해보세요
                  </p>
                </div>
              ) : (
                survey.questions.map((question, index) => renderQuestionPreview(question, index))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormPreview;
