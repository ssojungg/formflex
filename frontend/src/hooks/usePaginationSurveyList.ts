import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { SurveyCoverType } from '../types/survey';
import { useAuthStore } from '../store/AuthStore';
import { getAllSurveyAPI, getMySurveyAPI, getMyResponseAPI } from '../api/getForm';

type PathType = 'allForm' | 'myForm' | 'myResponse';

const QUERY_FN_MAP = {
  allForm: getAllSurveyAPI,
  myForm: getMySurveyAPI,
  myResponse: getMyResponseAPI,
};

const usePaginationSurveyList = (path: PathType) => {
  const userId = useAuthStore((state) => state.userId ?? undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>(''); // 검색어 상태 추가
  const [sort, setSort] = useState(''); // 정렬 상태 추가

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term); // 검색어 변경 핸들러
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const queryFn = QUERY_FN_MAP[path];

  const { data, isError, isPending, refetch } = useQuery<SurveyCoverType, AxiosError>({
    queryKey: [path, currentPage, userId, searchTerm, sort],
    queryFn: () => queryFn({ userId: userId as number, currentPage, title: searchTerm, sort }),
    select: (responseData) => {
      return {
        surveys: responseData.sortedList ?? responseData.surveys,
        totalPages: responseData.totalPages,
      };
    },
    placeholderData: keepPreviousData,
    // Auto-refresh: allForm every 30s (shows others' new responses), myForm/myResponse every 60s
    refetchInterval: path === 'allForm' ? 30_000 : 60_000,
    refetchIntervalInBackground: false, // only poll when tab is focused
    meta: { errorMessage: '설문지 목록을 불러오는 중 오류가 발생했습니다.' },
  });
  return {
    data,
    currentPage,
    handlePageChange,
    handleSearchChange,
    isError,
    isPending,
    searchTerm,
    setSearchTerm,
    // sort,
    handleSortChange,
    refetch,
  };
};

export default usePaginationSurveyList;
