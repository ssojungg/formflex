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
  const pdfBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });
  const response = await api.post(`/surveys/${surveyId}/report-email`, {
    email,
    surveyTitle,
    pdfBase64,
  });
  return response.data;
};
