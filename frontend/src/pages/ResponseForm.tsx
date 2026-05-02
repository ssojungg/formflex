import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Alert from '../components/common/Alert';
import { QuestionDataForm, ResponseSubmit } from '../types/questionData';
import { responseformAPI, responseSubmitAPI } from '../api/responseform';
import { useAuthStore } from '../store/AuthStore';
import Loading from '../components/common/Loading';
import { formatDeadlineDate } from '../utils/formatDeadlineDate';

// Icons
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const fontClasses: { [key: string]: string } = {
  pretendard: 'font-pretendardFont',
  tmoney: 'font-tMoney',
  nps: 'font-npsFont',
  omyu: 'font-omyuFont',
  seolleim: 'font-seolleimFont',
};

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ResponseForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const isViewPage = location.pathname.includes('/view');
  const [searchParams] = useSearchParams();
  const surveyId = Number(searchParams.get('id'));
  const myId = useAuthStore((state) => state.userId);
  const myName = useAuthStore((state) => state.userName);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [responseSubmit, setResponseSubmit] = useState<ResponseSubmit>({
    userId: 0,
    questions: [],
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [expandedDropdowns, setExpandedDropdowns] = useState<{ [key: number]: boolean }>({});

  const fontClasses: { [key: string]: string } = {
    pretendard: 'font-pretendardFont',
    tmoney: 'font-tMoney',
    nps: 'font-npsFont',
    omyu: 'font-omyuFont',
    seolleim: 'font-seolleimFont',
  };

  const {
    data: surveyData,
    isLoading,
    isError,
  } = useQuery<QuestionDataForm, AxiosError>({
    queryKey: ['surveyData', surveyId],
    queryFn: () => responseformAPI(surveyId),
    enabled: !!surveyId && !isNaN(surveyId),
  });

  useEffect(() => {
    if (surveyData) {
      setResponseSubmit({
        userId: myId ?? 0,
        questions: surveyData.questions.map((q) => ({
          questionId: q.questionId,
          objContent: [],
          subContent: '',
        })),
      });
    }
  }, [surveyData, myId]);

  const mutationOptions: UseMutationOptions<ResponseSubmit, Error, ResponseSubmit> = {
    mutationFn: (data) => responseSubmitAPI(surveyId, data),
    onSuccess: () => {
      // Invalidate queries so dashboard & my-responses update immediately without refresh
      queryClient.invalidateQueries({ queryKey: ['allForm'] });
      queryClient.invalidateQueries({ queryKey: ['myResponse'] });
      queryClient.invalidateQueries({ queryKey: ['surveyData', surveyId] });
      setShowSuccess(true);
    },
    onError: () => setShowError(true),
  };

  const mutation = useMutation(mutationOptions);

  // Check ownership by userId (after backend fix) OR by userName as fallback
  const isSurveyOwner =
    (!!myId && !!surveyData?.userId && myId === surveyData.userId) ||
    (!!myName && !!surveyData?.userName && myName === surveyData.userName);

    if (isEveryQuestionAnswered) {
      await mutation.mutateAsync(responseSubmit);
    } else {
      setShowError(true);
    }
  };

  const handleOptionSelect = (choiceId: number, questionId: number) => {
    setResponseSubmit((prev) => ({
      userId: myId ?? 0,
      questions: prev.questions.map((q) =>
        q.questionId === questionId ? { ...q, objContent: [choiceId] } : q,
      ),
    }));
  };

  const handleCheckBoxSelect = (newSelectedOptions: number[], questionId: number) => {
    setResponseSubmit((prev) => ({
      userId: myId ?? 0,
      questions: prev.questions.map((q) =>
        q.questionId === questionId ? { ...q, objContent: newSelectedOptions } : q,
      ),
    }));
  };

  const handleSubChange = (userResponse: string, questionId: number) => {
    setResponseSubmit((prev) => ({
      userId: myId ?? 0,
      questions: prev.questions.map((q) =>
        q.questionId === questionId ? { ...q, subContent: userResponse } : q,
      ),
    }));
  };

  if (isLoading) return <Loading />;

  if (isError || !surveyData) {
    return (
      <Alert
        type="error"
        message="설문지를 불러오지 못하였습니다."
        buttonText="확인"
        buttonClick={() => navigate('/surveys')}
      />
    );
  }

  // Determine where to return after completing/exiting the survey
  const returnPath = (() => {
    if (activeItem === 'myforms') return '/myform';
    return '/surveys'; // covers 'surveys', old 'all', and all other cases → always return to survey dashboard
  })();

  if (showSuccess) {
    return (
      <Alert
        type="success"
        message="제출에 성공하였습니다."
        buttonText="확인"
        buttonClick={() => navigate(returnPath)}
      />
    );
  }

  if (showError) {
    return (
      <Alert
        type="error"
        message="모든 질문에 응답해주세요."
        buttonText="확인"
        buttonClick={() => setShowError(false)}
      />
    );
  }

  // Handle option select for single choice / dropdown
  const handleOptionSelect = (choiceId: number, questionId: number) => {
    const updatedQuestions = responseSubmit.questions.map((question) => {
      if (question.questionId === questionId) {
        return { ...question, objContent: [choiceId] };
      }
      return question;
    });
    setResponseSubmit({
      userId: myId ?? 0,
      questions: updatedQuestions,
    });
  };

  // Handle checkbox selection
  const handleCheckBoxSelect = (choiceId: number, questionId: number) => {
    const updatedQuestions = responseSubmit.questions.map((question) => {
      if (question.questionId === questionId) {
        const currentSelection = question.objContent || [];
        const newSelection = currentSelection.includes(choiceId)
          ? currentSelection.filter((id) => id !== choiceId)
          : [...currentSelection, choiceId];
        return { ...question, objContent: newSelection };
      }
      return question;
    });
    setResponseSubmit({
      userId: myId ?? 0,
      questions: updatedQuestions,
    });
  };

  // Handle text input
  const handleSubChange = (userResponse: string, questionId: number) => {
    const updatedQuestions = responseSubmit.questions.map((question) => {
      if (question.questionId === questionId) {
        return { ...question, subContent: userResponse };
      }
      return question;
    });
    setResponseSubmit({
      userId: myId ?? 0,
      questions: updatedQuestions,
    });
  };

  const themeColor = surveyData.color || '#6366f1';
  const progress = surveyData.questions.length > 0 
    ? ((currentQuestionIndex + 1) / surveyData.questions.length) * 100 
    : 0;

  return (
    <div className={`${fontClasses[surveyData.font] || fontClasses.pretendard} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100`}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div 
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: themeColor }}
        />
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Survey Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6"
        >
          {/* Cover Image */}
          {surveyData.mainImageUrl && (
            <div className="h-48 sm:h-56 overflow-hidden">
              <img
                src={surveyData.mainImageUrl}
                alt="Survey Cover"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Header Bar */}
          <div 
            className="h-2"
            style={{ backgroundColor: themeColor }}
          />
          
          {/* Survey Info */}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {surveyData.title}
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {surveyData.description}
            </p>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: themeColor }}
                >
                  {surveyData.userName?.[0] || 'U'}
                </div>
                <span>{surveyData.userName}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>마감: {formatDeadlineDate(surveyData.deadline)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Questions */}
        <div className="space-y-4">
          {surveyData.questions.map((question, index) => {
            const questionResponse = responseSubmit.questions.find(q => q.questionId === question.questionId);
            const isAnswered = questionResponse && (
              (questionResponse.objContent && questionResponse.objContent.length > 0) ||
              (questionResponse.subContent && questionResponse.subContent.trim() !== '')
            );

            return (
              <motion.div
                key={question.questionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all ${
                  isAnswered ? 'ring-2' : ''
                }`}
                style={{ 
                  ringColor: isAnswered ? themeColor : 'transparent',
                  borderColor: isAnswered ? themeColor : 'transparent'
                }}
              >
                {/* Question Header */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: themeColor }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {question.content}
                        {question.essential && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h3>
                      {question.type !== 'SUBJECTIVE_QUESTION' && (
                        <p className="text-sm text-gray-500">
                          {question.type === 'CHECKBOX' ? '여러 개 선택 가능' : '하나만 선택'}
                        </p>
                      )}
                    </div>
                    {isAnswered && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: themeColor }}
                      >
                        <CheckIcon />
                      </div>
                    )}
                  </div>

                  {/* Answer Area */}
                  <div className="mt-5">
                    {/* Multiple Choice */}
                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2">
                        {question.choices?.map((choice) => {
                          const isSelected = questionResponse?.objContent?.includes(choice.choiceId);
                          return (
                            <button
                              key={choice.choiceId}
                              onClick={() => !isViewPage && handleOptionSelect(choice.choiceId, question.questionId)}
                              disabled={isViewPage}
                              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected 
                                  ? 'border-current bg-opacity-10' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ 
                                borderColor: isSelected ? themeColor : undefined,
                                backgroundColor: isSelected ? `${themeColor}10` : undefined
                              }}
                            >
                              <div 
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                  isSelected ? 'border-current' : 'border-gray-300'
                                }`}
                                style={{ borderColor: isSelected ? themeColor : undefined }}
                              >
                                {isSelected && (
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: themeColor }}
                                  />
                                )}
                              </div>
                              <span className={`text-sm ${isSelected ? 'font-medium' : 'text-gray-700'}`}>
                                {choice.option}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Checkbox */}
                    {question.type === 'CHECKBOX' && (
                      <div className="space-y-2">
                        {question.choices?.map((choice) => {
                          const isSelected = questionResponse?.objContent?.includes(choice.choiceId);
                          return (
                            <button
                              key={choice.choiceId}
                              onClick={() => !isViewPage && handleCheckBoxSelect(choice.choiceId, question.questionId)}
                              disabled={isViewPage}
                              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected 
                                  ? 'border-current' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ 
                                borderColor: isSelected ? themeColor : undefined,
                                backgroundColor: isSelected ? `${themeColor}10` : undefined
                              }}
                            >
                              <div 
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                  isSelected ? 'border-current' : 'border-gray-300'
                                }`}
                                style={{ 
                                  borderColor: isSelected ? themeColor : undefined,
                                  backgroundColor: isSelected ? themeColor : undefined
                                }}
                              >
                                {isSelected && <CheckIcon />}
                              </div>
                              <span className={`text-sm ${isSelected ? 'font-medium' : 'text-gray-700'}`}>
                                {choice.option}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Dropdown */}
                    {question.type === 'DROPDOWN' && (
                      <div className="relative">
                        <button
                          onClick={() => setExpandedDropdowns(prev => ({
                            ...prev,
                            [question.questionId]: !prev[question.questionId]
                          }))}
                          disabled={isViewPage}
                          className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all text-left"
                        >
                          <span className={questionResponse?.objContent?.length ? 'text-gray-900' : 'text-gray-400'}>
                            {questionResponse?.objContent?.length
                              ? question.choices?.find(c => c.choiceId === questionResponse.objContent[0])?.option
                              : '선택하세요'
                            }
                          </span>
                          <ChevronDownIcon />
                        </button>
                        
                        <AnimatePresence>
                          {expandedDropdowns[question.questionId] && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
                            >
                              {question.choices?.map((choice) => {
                                const isSelected = questionResponse?.objContent?.includes(choice.choiceId);
                                return (
                                  <button
                                    key={choice.choiceId}
                                    onClick={() => {
                                      handleOptionSelect(choice.choiceId, question.questionId);
                                      setExpandedDropdowns(prev => ({ ...prev, [question.questionId]: false }));
                                    }}
                                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                                      isSelected ? 'bg-gray-50' : ''
                                    }`}
                                  >
                                    {isSelected && (
                                      <div style={{ color: themeColor }}>
                                        <CheckIcon />
                                      </div>
                                    )}
                                    <span className={`text-sm ${isSelected ? 'font-medium' : 'text-gray-700'}`}>
                                      {choice.option}
                                    </span>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Subjective (Text) */}
                    {question.type === 'SUBJECTIVE_QUESTION' && (
                      <textarea
                        value={questionResponse?.subContent || ''}
                        onChange={(e) => !isViewPage && handleSubChange(e.target.value, question.questionId)}
                        disabled={isViewPage}
                        placeholder="답변을 입력하세요..."
                        rows={4}
                        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-current focus:outline-none transition-colors resize-none text-sm"
                        style={{ 
                          borderColor: questionResponse?.subContent ? themeColor : undefined 
                        }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Submit Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          {!isViewPage && (
            <button
              onClick={handleSubmit}
              className="flex-1 py-4 px-6 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: themeColor }}
            >
              제출하기
            </button>
          )}
          <button
            onClick={() => navigate('/surveys')}
            className="flex-1 sm:flex-none py-4 px-6 bg-white text-gray-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-200"
          >
            나가기
          </button>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Powered by FormFlex</p>
        </div>
      </div>
    </div>
  );
}

export default ResponseForm;
