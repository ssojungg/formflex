import { Scrollbars } from 'react-custom-scrollbars-2';
import typeIcon from '../../../assets/type.svg';
import { QuestionData } from '../../../types/questionData';
import t from '../../../assets/t.svg';

interface SubjectQuestionProps {
  index: number;
  question: QuestionData;
}

function SubjectQuestion({ index, question }: SubjectQuestionProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[1.25rem] bg-white border border-primary-500"
      style={{ boxShadow: '0 0 0.25rem 0.25rem rgba(145,141,202,0.25)' }}
    >
      <div className="flex flex-col items-center justify-center w-[50rem]">
        <div className="flex justify-between w-full mt-4">
          <div className="flex items-center ml-4">
            <button type="button" className="items-center focus:outline-none">
              <img src={typeIcon} alt="Type" className="w-5 h-5" />
            </button>
            <span className="ml-2 font-medium text-left text-darkGray">주관식</span>
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <span className="text-[2rem] font-semibold text-center text-black -translate-y-4">Q{index}.</span>
        </div>

        <div className="flex justify-center items-center w-[37.5rem] h-8 ">
          <p className="text-base text-black">{question.content}</p>
        </div>

        {question.imageUrl && (
          <div className="mt-4">
            <img
              src={question.imageUrl}
              alt="Preview"
              className="rounded-[0.625rem] border-2 border-solid border-gray max-w-[45rem] max-h-[45rem]"
            />
          </div>
        )}
        <Scrollbars style={{ minHeight: 200, marginBottom: 15 }}>
          <div className="w-full px-12 pt-6 pb-3 max-h-[22.5rem]">
            {question.answers && question.answers.length > 0 ? (
              question.answers?.map((answer) => (
                <div key={answer.answerId}>
                  <div className="flex items-center">
                    <img src={t} alt="t" className="w-3 h-3" />
                    <p className="pl-4 text-xs leading-3 text-black">{answer.content}</p>
                  </div>

                  <div className="h-[0.5px] bg-darkGray my-2" />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center pt-5">
                <p className="text-base text-gray">설문 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </Scrollbars>
      </div>
    </div>
  );
}
export default SubjectQuestion;
