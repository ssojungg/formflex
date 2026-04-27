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
        return 'max-w-[768px]';
      default:
        return 'max-w-[900px]';
    }
  };

  const renderQuestionPreview = (question: EditableQuestions, index: number) => {
    const isSelected = selectedQuestionIndex === index;
    const objectiveQuestion = question as EditableObjectiveQuestion;

    return (
      <div
        key={index}
        onClick={() => setSelectedQuestionIndex(index)}
        className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-transparent hover:border-primary/30 bg-card'
        }`}
      >
        {/* Question Actions */}
        {isSelected && (
          <div className="absolute -top-3 right-2 flex items-center gap-1 bg-card rounded-md shadow-sm border border-border p-1">
            <label className="p-1.5 hover:bg-muted rounded cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(index, question, e)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyQuestion(index);
              }}
              className="p-1.5 hover:bg-muted rounded transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteQuestion(index);
              }}
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}

        {/* Question Image */}
        {question.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={question.imageUrl} alt="Question" className="w-full h-32 object-cover" />
          </div>
        )}

        {/* Drag Handle */}
        <div className="flex items-start gap-3">
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>

          <div className="flex-1">
            {/* Question Content */}
            <input
              type="text"
              value={question.content}
              onChange={(e) => updateQuestion(index, { ...question, content: e.target.value })}
              placeholder="질문을 입력하세요"
              className="w-full text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
            />

            {/* Question Options */}
            <div className="mt-3 space-y-2">
              {question.type === 'SUBJECTIVE_QUESTION' ? (
                <div className="py-2 px-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
                  답변을 입력하세요
                </div>
              ) : (
                <>
                  {objectiveQuestion.choices?.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center gap-2">
                      {question.type === 'MULTIPLE_CHOICE' && (
                        <div className="w-4 h-4 rounded-full border-2 border-border" />
                      )}
                      {question.type === 'CHECKBOX' && (
                        <div className="w-4 h-4 rounded border-2 border-border" />
                      )}
                      {question.type === 'DROPDOWN' && (
                        <span className="text-xs text-muted-foreground w-4">{choiceIndex + 1}.</span>
                      )}
                      <input
                        type="text"
                        value={choice.option}
                        onChange={(e) => {
                          const newChoices = [...objectiveQuestion.choices];
                          newChoices[choiceIndex] = { option: e.target.value };
                          updateQuestion(index, { ...question, choices: newChoices } as EditableQuestions);
                        }}
                        placeholder={`옵션 ${choiceIndex + 1}`}
                        className="flex-1 py-1.5 px-2 text-sm bg-muted/50 rounded-md border-none focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {objectiveQuestion.choices.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newChoices = objectiveQuestion.choices.filter((_, i) => i !== choiceIndex);
                            updateQuestion(index, { ...question, choices: newChoices } as EditableQuestions);
                          }}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newChoices = [...objectiveQuestion.choices, { option: '' }];
                      updateQuestion(index, { ...question, choices: newChoices } as EditableQuestions);
                    }}
                    className="flex items-center gap-2 py-1.5 px-2 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    옵션 추가
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      {/* Preview Header */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="rounded border-border" defaultChecked />
          데스크탑 미리보기
        </label>
        <span className="flex items-center gap-1 text-xs text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          실시간 반영
        </span>
      </div>

      {/* Preview Container */}
      <div className={`mx-auto ${getPreviewWidth()} transition-all duration-300`}>
        {/* Form Card */}
        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          {/* Cover Image */}
          <div
            className="h-40 md:h-48"
            style={{
              background: survey.mainImageUrl
                ? `url(${survey.mainImageUrl}) center/cover`
                : `linear-gradient(135deg, ${survey.color}40 0%, ${survey.color}20 100%)`,
            }}
          />

          {/* Form Content */}
          <div className="p-4 md:p-6">
            {/* Title */}
            <input
              type="text"
              value={survey.title}
              onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="새 설문조사"
              className="w-full text-xl md:text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
            />

            {/* Description */}
            <textarea
              value={survey.description}
              onChange={(e) => setSurvey((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="설문조사에 대한 간단한 설명을 입력하세요"
              rows={2}
              className="w-full mt-2 text-sm text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-0 resize-none placeholder:text-muted-foreground"
            />

            {/* Questions */}
            <div className="mt-6 space-y-4">
              {survey.questions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    왼쪽 패널에서 컴포넌트를 추가하세요
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
