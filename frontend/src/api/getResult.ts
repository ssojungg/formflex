import axios from 'axios';
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
