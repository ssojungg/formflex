import Chart from 'react-apexcharts';
import typeIcon from '../../../assets/type.svg';
import { QuestionData } from '../../../types/questionData';

interface PieChartProps {
  index: number;
  question: QuestionData;
}

const QUESTION_TYPE = {
  MULTIPLE_CHOICE: '객관식',
  CHECKBOX: '체크박스',
  DROPDOWN: '드롭다운',
};

function PieChart({ index, question }: PieChartProps) {
  const getQuestionType = (type: string): string => {
    return QUESTION_TYPE[type as keyof typeof QUESTION_TYPE];
  };

  const chartSeries = question.choices?.map((choice) => choice.count) || [];
  const total: number = chartSeries.reduce((acc, cur) => (acc as number) + (cur as number), 0) || 0;

  const chartOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
    },
    labels: question.choices?.map((choice) => choice.option),
    legend: {
      show: true,
      position: 'left',
      floating: true,
      horizontalAlign: 'right',
      fontSize: '14px',
      fontWeight: 'medium',
      itemMargin: {
        vertical: 2,
      },
      offsetX: -30,
      offsetY: 0,
      formatter(val: string) {
        if (val.length > 10) {
          return `${val.slice(0, 10)}...`;
        }
        return val;
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: 'medium',
        colors: ['white'],
      },
    },
    plotOptions: {
      pie: {
        stroke: {
          width: 0,
          curve: 'smooth',
        },
      },
    },
    colors: ['#1B64DA', '#5BA0F8', '#BBD8FD', '#D1D6DB'],
  };

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
            <span className="ml-2 font-medium text-left text-darkGray">{getQuestionType(question.type)}</span>
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

        <div className="py-6">
          {chartSeries && total > 0 && chartSeries.length > 0 ? (
            <div className="flex items-center justify-center min-w-[18.75rem] h-[180.7px]">
              <Chart
                key={`chart-${index}`}
                options={chartOptions as any}
                series={chartSeries as number[]}
                type="donut"
                width={500}
                height={180.7}
              />
            </div>
          ) : (
            <p className="text-base text-gray">설문 결과가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PieChart;
