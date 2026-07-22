import { api } from '../queryClient';
import { restFetcher } from '../queryClient';

export const getQuestionResultAPI = async (surveyId: number) => {
  const response = await restFetcher({
    method: 'GET',
    path: `/surveys/${surveyId}/results`,
  });
  return response;
};

export const getAnswerResultAPI = async (surveyId: number) => {
  const response = await restFetcher({
    method: 'GET',
    path: `/surveys/${surveyId}/list`,
  });
  return response;
};

export const getExcelDownloadAPI = async (surveyId: number) => {
  const response = await api.get(`/surveys/downloadExcel/${surveyId}`, {
    responseType: 'blob',
  });
  return response;
};

export const sendReportEmailAPI = async (surveyId: number, email: string, pdfBlob: Blob, surveyTitle: string) => {
  // PDF를 백엔드로 직접 multipart 업로드 → 백엔드가 그대로 메일 첨부.
  // (기존 브라우저→S3 presigned PUT 방식은 버킷 CORS 설정에 의존해 실패가 잦았음)
  const form = new FormData();
  form.append('email', email);
  form.append('surveyTitle', surveyTitle);
  form.append('pdf', pdfBlob, 'report.pdf');

  const response = await api.post(`/surveys/${surveyId}/report-email`, form);
  return response.data;
};
