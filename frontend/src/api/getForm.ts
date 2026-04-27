import { restFetcher } from '../queryClient';

const LIMIT = 9;

interface AllSurveyResponse {
  userId: number;
  currentPage: number;
}

export const getAllSurveyAPI = async ({
  userId,
  currentPage,
  title,
  sort,
}: AllSurveyResponse & { title?: string; sort?: string }) => {
  const params: any = { page: currentPage, limit: LIMIT };
  if (title) params.title = title;
  if (sort === 'attendCount') {
    params.attendCount = true;
  } else if (sort === 'deadline') {
    params.deadline = true;
  } else if (sort === 'oldest') {
    params.oldest = true;
  }
  const response = await restFetcher({
    method: 'GET',
    path: `/surveys/${userId}/all`,
    params,
  });
  return response;
};

export const getMySurveyAPI = async ({
  userId,
  currentPage,
  title,
  sort,
}: AllSurveyResponse & { title?: string; sort?: string }) => {
  const params: any = { page: currentPage, limit: LIMIT };
  if (title) params.title = title;
  if (sort === 'attendCount') {
    params.attendCount = true;
  } else if (sort === 'deadline') {
    params.deadline = true;
  } else if (sort === 'oldest') {
    params.oldest = true;
  }
  const response = await restFetcher({
    method: 'GET',
    path: `/surveys/${userId}/forms`,
    params,
  });
  return response;
};

export const getMyResponseAPI = async ({
  userId,
  currentPage,
  title,
  sort,
}: AllSurveyResponse & { title?: string; sort?: string }) => {
  const params: any = { page: currentPage, limit: LIMIT };
  if (title) params.title = title;
  if (sort === 'attendCount') {
    params.attendCount = true; // 참여자 순 정렬
  } else if (sort === 'deadline') {
    params.deadline = true; // 마감일 순 정렬
  }
  const response = await restFetcher({
    method: 'GET',
    path: `/surveys/${userId}/join`,
    params,
  });
  return response;
};
