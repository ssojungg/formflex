import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import Alert from '../components/common/Alert';
import ResponseMultipleChoice from '../components/responsetype/ResponseMultipleChoice';
import ResponseSubjective from '../components/responsetype/ResponseSubjective';
import ResponseCheckBox from '../components/responsetype/ResponseCheckBox';
import ResponseDropDown from '../components/responsetype/ResponseDropDown';
import { QuestionDataForm, ResponseSubmit } from '../types/questionData';
import { responseformAPI, responseSubmitAPI } from '../api/responseform';
import { useAuthStore } from '../store/AuthStore';
import Loading from '../components/common/Loading';
import { formatDeadlineDate } from '../utils/formatDeadlineDate';
import { useNavbarStore } from '../store/NavbarStore';

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
  const activeItem = useNavbarStore((state) => state.activeItem);
  const [responseSubmit, setResponseSubmit] = useState<ResponseSubmit>({ userId: 0, questions: [] });
  const queryClient = useQueryClient();

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

  const answeredCount = responseSubmit.questions.filter(
    (q) => (Array.isArray(q.objContent) && q.objContent.length > 0) || (q.subContent && q.subContent.trim() !== ''),
  ).length;
  const totalCount = responseSubmit.questions.length;
  const progress = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  const handleSubmit = async () => {
    const allAnswered = responseSubmit.questions.every(
      (q) =>
        (Array.isArray(q.objContent) && q.objContent.length > 0) ||
        (q.subContent && q.subContent.trim() !== ''),
    );
    if (allAnswered) {
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
        buttonClick={() => navigate('/all')}
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
        message="모든 질문에 답변해주세요."
        buttonText="확인"
        buttonClick={() => setShowError(false)}
      />
    );
  }

  const accentColor = surveyData.color || '#6366f1';

  return (
    <div
      className={`${fontClasses[surveyData.font] || fontClasses.pretendard} min-h-screen`}
      style={{ backgroundColor: `${accentColor}08` }}
    >
      {/* Progress Bar (sticky top) */}
      {!isViewPage && (
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
              {answeredCount} / {totalCount}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Cover Image */}
        {surveyData.mainImageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={surveyData.mainImageUrl}
              alt="설문 커버"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5 border border-gray-100">
          {/* Color accent bar */}
          <div className="h-2 w-full" style={{ backgroundColor: accentColor }} />

          <div className="px-7 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
              {surveyData.title}
            </h1>
            {surveyData.description && (
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{surveyData.description}</p>
            )}

            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <UserIcon />
                <span>{surveyData.userName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <CalendarIcon />
                <span>생성일 {formatDeadlineDate(surveyData.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <CalendarIcon />
                <span>마감일 {formatDeadlineDate(surveyData.deadline)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {surveyData.questions.map((question, index) => {
            const props = {
              index: index + 1,
              question,
              color: accentColor,
              buttonStyle: surveyData.buttonStyle,
              isViewPage,
            };

            switch (question.type) {
              case 'MULTIPLE_CHOICE':
                return (
                  <ResponseMultipleChoice
                    key={question.questionId}
                    {...props}
                    onOptionSelect={(id) => handleOptionSelect(id, question.questionId)}
                  />
                );
              case 'SUBJECTIVE_QUESTION':
                return (
                  <ResponseSubjective
                    key={question.questionId}
                    {...props}
                    onSubChange={(res) => handleSubChange(res, question.questionId)}
                  />
                );
              case 'CHECKBOX':
                return (
                  <ResponseCheckBox
                    key={question.questionId}
                    {...props}
                    onOptionSelect={(opts) => handleCheckBoxSelect(opts, question.questionId)}
                  />
                );
              case 'DROPDOWN':
                return (
                  <ResponseDropDown
                    key={question.questionId}
                    {...props}
                    onOptionSelect={(id) => handleOptionSelect(id, question.questionId)}
                  />
                );
              default:
                return null;
            }
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center gap-3">
          {!isViewPage && (
            isSurveyOwner ? (
              <div className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-center bg-gray-100 text-gray-400 border border-gray-200">
                본인이 만든 설문에는 응답할 수 없습니다
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white
                           transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                style={{ backgroundColor: accentColor }}
              >
                제출하기
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            className="py-3.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200
                       hover:bg-gray-50 transition-colors"
            style={{ width: isViewPage ? '100%' : '30%' }}
          >
            나가기
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6 mb-4">Powered by FormFlex</p>
      </div>
    </div>
  );
}

export default ResponseForm;
