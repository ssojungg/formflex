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
  const formData = new FormData();
  formData.append('email', email);
  formData.append('surveyTitle', surveyTitle);
  formData.append('pdf', pdfBlob, 'report.pdf');
  const response = await api.post(`/surveys/${surveyId}/report-email`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
