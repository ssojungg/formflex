import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Survey } from '../types/survey';
import { useAuthStore } from '../store/AuthStore';
import { getAllSurveyAPI, getMySurveyAPI, getMyResponseAPI } from '../api/getForm';

type PathType = 'allForm' | 'myForm' | 'myResponse';

const QUERY_FN_MAP = {
  allForm: getAllSurveyAPI,
  myForm: getMySurveyAPI,
  myResponse: getMyResponseAPI,
};

const useInfiniteList = (path: PathType) => {
  const userId = useAuthStore((state) => state.userId ?? undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('');

  const result = useInfiniteQuery({
    queryKey: [path + '_infinite', userId, searchTerm, sort],
    queryFn: ({ pageParam }) =>
      QUERY_FN_MAP[path]({
        userId: userId as number,
        currentPage: pageParam as number,
        title: searchTerm,
        sort,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const currentPage = allPages.length;
      const totalPages = lastPage.totalPages ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!userId,
    refetchInterval: path === 'allForm' ? 30_000 : 60_000,
    refetchIntervalInBackground: false,
  });

  const surveys: Survey[] = (result.data?.pages ?? []).flatMap(
    (page: any) => page.surveys ?? page.sortedList ?? [],
  );

  const totalPages: number =
    result.data?.pages?.[result.data.pages.length - 1]?.totalPages ?? 0;

  const totalCount: number =
    result.data?.pages?.[0]?.totalCount ?? surveys.length;

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  return {
    surveys,
    totalPages,
    totalCount,
    isPending: result.isPending,
    isFetchingNextPage: result.isFetchingNextPage,
    hasNextPage: result.hasNextPage ?? false,
    fetchNextPage: result.fetchNextPage,
    searchTerm,
    setSearchTerm,
    handleSearchChange,
    handleSortChange,
  };
};

export default useInfiniteList;
