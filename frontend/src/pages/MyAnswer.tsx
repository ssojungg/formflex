import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ExtendedQuestionData, QuestionDataForm } from '../types/questionData';
import { myAnswerAPI } from '../api/myanswer';
import Loading from '../components/common/Loading';
import { formatDeadlineDate } from '../utils/formatDeadlineDate';
import Alert from '../components/common/Alert';
import QuestionShell, { tint } from '../components/responsetype/QuestionShell';

const fontClasses: { [key: string]: string } = {
  pretendard: 'font-pretendardFont',
  tmoney: 'font-tMoney',
  nps: 'font-npsFont',
  omyu: 'font-omyuFont',
  seolleim: 'font-seolleimFont',
};

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: '하나만 고르는 질문',
  CHECKBOX: '여러 개 고르는 질문',
  DROPDOWN: '목록에서 고르는 질문',
  SUBJECTIVE_QUESTION: '직접 적는 질문',
};

function MyAnswer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = Number(searchParams.get('userId'));
  const surveyId = Number(searchParams.get('surveyId'));

  const {
    data: surveyData,
    isLoading,
    isError,
  } = useQuery<QuestionDataForm, AxiosError>({
    queryKey: ['surveyData', surveyId],
    queryFn: () => myAnswerAPI(userId, surveyId),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !surveyData) {
    return (
      <Alert
        type="error"
        message="응답 내용을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
        buttonText="확인"
        buttonClick={() => navigate('/myresponses')}
      />
    );
  }

  const color = surveyData.color || '#3182F6';
  const fontClass = fontClasses[surveyData.font] || fontClasses.pretendard;
  const questions = surveyData.questions as ExtendedQuestionData[];

  return (
    <div className={`${fontClass} min-h-full bg-secondary-50`}>
      <main className="max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-10 space-y-3">
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {surveyData.mainImageUrl ? (
            <img src={surveyData.mainImageUrl} alt="설문 커버" className="w-full h-40 sm:h-52 object-cover" />
          ) : (
            <div className="h-1.5" style={{ backgroundColor: color }} />
          )}
          <div className="px-5 sm:px-7 py-6">
            <span
              className="inline-flex items-center h-6 px-2 rounded-md text-xs font-medium"
              style={{ backgroundColor: tint(color, 12), color }}
            >
              내가 낸 응답
            </span>
            <h1 className="mt-3 text-[24px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em] text-gray-900 break-keep">
              {surveyData.title}
            </h1>
            {surveyData.description && (
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600 whitespace-pre-line break-keep">
                {surveyData.description}
              </p>
            )}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-gray-500">
              <span>{surveyData.userName}</span>
              {surveyData.deadline && <span>{formatDeadlineDate(surveyData.deadline)} 마감</span>}
              <span>질문 {questions.length}개</span>
            </div>
          </div>
        </section>

        {questions.map((question, index) => {
          const picked = question.objContent ?? [];
          const isSubjective = question.type === 'SUBJECTIVE_QUESTION';
          return (
            <QuestionShell
              key={question.questionId}
              index={index + 1}
              color={color}
              typeLabel={TYPE_LABEL[question.type] || ''}
              content={question.content}
              imageUrl={question.imageUrl}
            >
              {isSubjective ? (
                question.subContent?.trim() ? (
                  <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] leading-relaxed text-gray-900 whitespace-pre-line break-words">
                    {question.subContent}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">답하지 않았어요</p>
                )
              ) : (
                <div className="space-y-2">
                  {(question.choices || []).map((choice) => {
                    const isPicked = picked.includes(choice.choiceId);
                    return (
                      <div
                        key={choice.choiceId}
                        className={`flex items-center gap-3 min-h-[48px] px-4 py-3 rounded-xl border ${
                          isPicked ? '' : 'border-gray-200 bg-white'
                        }`}
                        style={isPicked ? { borderColor: color, backgroundColor: tint(color, 8) } : undefined}
                      >
                        <span
                          className={`w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center border-2 ${
                            question.type === 'CHECKBOX' ? 'rounded-[5px]' : 'rounded-full'
                          }`}
                          style={isPicked ? { borderColor: color, backgroundColor: color } : { borderColor: '#d1d6db' }}
                        >
                          {isPicked && (
                            <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
                              <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className={`text-[15px] ${isPicked ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                          {choice.option}
                        </span>
                        {isPicked && (
                          <span className="ml-auto shrink-0 text-xs font-medium" style={{ color }}>
                            내 선택
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </QuestionShell>
          );
        })}

        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate('/myresponses')}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white text-[15px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            목록으로
          </button>
        </div>
      </main>
    </div>
  );
}

export default MyAnswer;
