import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getExcelDownloadAPI } from '../../../api/getResult';
import Alert from '../../common/Alert';
import Loading from '../../common/Loading';
import { ListData } from '../../../types/answerData';
import { formatDeadlineDate } from '../../../utils/formatDeadlineDate';

interface ResponseProps {
  list: ListData;
}

interface Row {
  id: number;
  날짜: string;
  [key: string]: string | number;
}

function Response({ list }: ResponseProps) {
  const [searchParams] = useSearchParams();
  const surveyId = Number(searchParams.get('id'));

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const columns: GridColDef[] = [{ field: '날짜', headerName: '날짜', width: 150 }];

  list.head.forEach((question, index) => {
    columns.push({
      field: `Q${index + 1}`,
      headerName: `Q${index + 1}. ${question}`,
      width: 200,
    });
  });

  const rows = list.rows.map((row, index) => {
    const newRow: Row = { id: index + 1, 날짜: formatDeadlineDate(row.createdAt) };

    row.responses.forEach((response, i) => {
      newRow[`Q${i + 1}`] = response;
    });

    return newRow;
  });

  const handleDownload = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await getExcelDownloadAPI(surveyId);

      // 엑셀 파일 다운로드
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `survey_answers_${surveyId}.xlsx`);

      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
      link.remove();
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      {list.rows && list.rows.length > 0 ? (
        <div>
          <button
            type="button"
            className="absolute top-[8.25rem] right-[7.5rem] w-[6.25rem] h-9 leading-4 bg-primary-600 rounded-[0.625rem] text-base text-white cltext-base focus:outline-none hover:bg-[#1A3F80] transition duration-300 ease-in-out"
            onClick={handleDownload}
          >
            저장하기
          </button>

          <div className="max-w-[60rem] max-h-[41rem] pt-4">
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[10]}
              // checkboxSelection
              disableRowSelectionOnClick
              disableColumnFilter
            />
          </div>
        </div>
      ) : (
        <p className="text-base text-gray">설문 결과가 없습니다.</p>
      )}
      {error && <Alert type="error" message="엑셀 파일 다운로드에 실패했습니다." buttonText="확인" />}
    </div>
  );
}

export default Response;
