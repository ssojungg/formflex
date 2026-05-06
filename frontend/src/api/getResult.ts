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
  // 1) presigned upload URL 발급
  const { data: { uploadUrl, s3Key } } = await api.get(`/surveys/${surveyId}/report-upload-url`);

  // 2) PDF를 S3에 직접 업로드 (Lambda 거치지 않음 → 용량 무제한)
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: pdfBlob,
  });

  // 3) s3Key만 Lambda에 전달 (수십 bytes 페이로드)
  const response = await api.post(`/surveys/${surveyId}/report-email`, {
    email,
    surveyTitle,
    s3Key,
  });
  return response.data;
};
