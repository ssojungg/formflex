import { restFetcher } from '../queryClient';

export const getIdAPI = async (id: number) => {
  const response = await restFetcher({
    method: 'GET',
    path: `/users/${id}`,
  });
  return response;
};

export const patchPasswordAPI = async (id: number, password: string) => {
  const response = await restFetcher({
    method: 'PATCH',
    path: `/users`,
    body: {
      userId: id,
      password,
    },
  });
  return response;
};

export const patchProfileAPI = async (id: number, updates: { name?: string; password?: string }) => {
  const response = await restFetcher({
    method: 'PATCH',
    path: `/users`,
    body: {
      userId: id,
      ...updates,
    },
  });
  return response;
};
