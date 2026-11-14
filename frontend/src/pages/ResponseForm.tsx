import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import Alert from '../components/common/Alert';
import ResponseMultipleChoice from '../components/responsetype/ResponseMultipleChoice';
import ResponseSubjective from '../components/responsetype/ResponseSubjective';
import ResponseCheckBox from '../components/responsetype/ResponseCheckBox';
import ResponseDropDown from '../components/responsetype/ResponseDropDown';
import ResponseRating from '../components/responsetype/ResponseRating';
import ResponseEmail from '../components/responsetype/ResponseEmail';
import ResponseDate from '../components/responsetype/ResponseDate';
import { QuestionDataForm, ResponseSubmit } from '../types/questionData';
import { responseformAPI, responseSubmitAPI } from '../api/responseform';
import { useAuthStore } from '../store/AuthStore';
import Loading from '../components/common/Loading';
import { formatDeadlineDate } from '../utils/formatDeadlineDate';
import { useNavbarStore } from '../store/NavbarStore';
import { tint } from '../components/responsetype/QuestionShell';
import logo from '../assets/logo.svg';

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
  const [errorKind, setErrorKind] = useState<'unanswered' | 'submit' | null>(null);
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
      // 응답 제출 후 새로고침 없이 대시보드 응답수가 갱신되도록 목록 캐시를 무효화한다.
      // - 키는 두 가지 형태가 공존한다: useInfiniteList는 `${path}_infinite`,
      //   usePaginationSurveyList는 `${path}` — 둘 다 무효화해야 한다.
      // - refetchType: 'all'이 핵심. 제출 시점에 대시보드는 언마운트(inactive) 상태라
      //   기본값 'active'로는 stale 표시만 되고 refetch가 일어나지 않는다.
      //   ('refetchOnMount: false'가 전역 설정이라 되돌아와도 다시 안 불러옴 → F5해야만 갱신)
      const listKeys = [
        'allForm_infinite',
        'myForm_infinite',
        'myResponse_infinite',
        'allForm',
        'myForm',
        'myResponse',
      ];
      listKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key], refetchType: 'all' }),
      );
      queryClient.invalidateQueries({ queryKey: ['surveyData', surveyId], refetchType: 'all' });
      setShowSuccess(true);
    },
    onError: () => setErrorKind('submit'),
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
      // onError가 실패 안내를 띄우므로 여기서는 거부를 삼킨다.
      await mutation.mutateAsync(responseSubmit).catch(() => {});
    } else {
      setErrorKind('unanswered');
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

  const accentColor = surveyData.color || '#3182F6';
  const fontClass = fontClasses[surveyData.font] || fontClasses.pretendard;

  if (showSuccess) {
    return (
      <div className={`${fontClass} min-h-screen bg-gray-50 flex items-center justify-center px-5`}>
        <div className="w-full max-w-sm text-center">
          <span
            className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: tint(accentColor, 14), color: accentColor }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <h1 className="mt-5 text-[24px] font-bold tracking-[-0.02em] text-gray-900">응답해 주셔서 고마워요</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-gray-500 break-keep">
            ‘{surveyData.title}’ 응답이 잘 전달됐어요.
          </p>
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            className="mt-8 w-full h-12 rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            {returnPath === '/myform' ? '내 설문으로 돌아가기' : '다른 설문 둘러보기'}
          </button>
        </div>
      </div>
    );
  }

  const deadlineText = surveyData.deadline ? formatDeadlineDate(surveyData.deadline) : '';

  return (
    <div className={`${fontClass} min-h-screen bg-gray-50`}>
      {/* Progress (sticky top) */}
      {!isViewPage && (
        <div className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-5 h-12 flex items-center gap-3">
            <p className="hidden sm:block flex-1 min-w-0 truncate text-sm font-medium text-gray-700">{surveyData.title}</p>
            <div className="flex-1 sm:flex-none sm:w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${progress}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 tabular-nums whitespace-nowrap">
              {answeredCount}/{totalCount}
            </span>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-10 space-y-3">
        {/* Header card */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {surveyData.mainImageUrl ? (
            <img src={surveyData.mainImageUrl} alt="설문 커버" className="w-full h-40 sm:h-52 object-cover" />
          ) : (
            <div className="h-1.5" style={{ backgroundColor: accentColor }} />
          )}
          <div className="px-5 sm:px-7 py-6">
            <h1 className="text-[24px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em] text-gray-900 break-keep">
              {surveyData.title}
            </h1>
            {surveyData.description && (
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600 whitespace-pre-line break-keep">
                {surveyData.description}
              </p>
            )}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <UserIcon />
                {surveyData.userName}
              </span>
              {deadlineText && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon />
                  {deadlineText} 마감
                </span>
              )}
              <span>질문 {surveyData.questions.length}개</span>
            </div>
          </div>
        </section>

        {/* Questions */}
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
              if (question.format === 'rating') {
                return (
                  <ResponseRating
                    key={question.questionId}
                    {...props}
                    onSubChange={(res) => handleSubChange(res, question.questionId)}
                  />
                );
              }
              if (question.format === 'email') {
                return (
                  <ResponseEmail
                    key={question.questionId}
                    {...props}
                    onSubChange={(res) => handleSubChange(res, question.questionId)}
                  />
                );
              }
              if (question.format === 'date') {
                return (
                  <ResponseDate
                    key={question.questionId}
                    {...props}
                    onSubChange={(res) => handleSubChange(res, question.questionId)}
                  />
                );
              }
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

        {/* Bottom actions */}
        <div className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            className={`h-12 rounded-xl border border-gray-200 bg-white text-[15px] font-medium text-gray-600 hover:bg-gray-50 transition-colors ${
              isViewPage ? 'w-full' : 'sm:w-32'
            }`}
          >
            나가기
          </button>
          {!isViewPage &&
            (isSurveyOwner ? (
              <div className="flex-1 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-sm font-medium text-gray-500">
                내가 만든 설문에는 응답할 수 없어요
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="flex-1 h-12 rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: accentColor }}
              >
                {mutation.isPending ? '보내는 중…' : '제출하기'}
              </button>
            ))}
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mx-auto !mt-10 mb-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <img src={logo} alt="" className="w-4 h-4" />
          FormFlex로 만든 설문
        </button>
      </main>

      {errorKind && (
        <Alert
          type="error"
          title={errorKind === 'unanswered' ? '아직 답하지 않은 질문이 있어요' : '제출하지 못했어요'}
          message={
            errorKind === 'unanswered'
              ? '모든 질문에 답한 뒤 다시 제출해 주세요.'
              : '잠시 후 다시 시도해 주세요. 문제가 계속되면 설문 작성자에게 알려 주세요.'
          }
          buttonText="확인"
          buttonClick={() => setErrorKind(null)}
          onClose={() => setErrorKind(null)}
        />
      )}
    </div>
  );
}

export default ResponseForm;
