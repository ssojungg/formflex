import React from 'react';
import { createBrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import Start from './pages/Start';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainLayout from './layout/MainLayout';
import All from './pages/AllForm';
import MyForm from './pages/MyForm';
import MyResponse from './pages/MyResponse';
import Create from './pages/Create';
import ResultPage from './pages/ResultPage';
import MyAnswer from './pages/MyAnswer';
import MyPage from './pages/MyPage';
import ResponseForm from './pages/ResponseForm';
import { useAuthStore } from './store/AuthStore';
import Alert from './components/common/Alert';
import RouteChangeTracker from './utils/RouteChangeTracker';

interface RouterElement {
  id: number;
  path: string;
  element?: React.ReactNode;
  withAuth?: boolean; // 인증이 필요한 페이지 여부
  isNavbar?: boolean; // Navbar가 포함된 페이지
}

const routerData: RouterElement[] = [
  { id: 1, path: '/', element: <Start />, withAuth: false },
  { id: 2, path: '/login', element: <Login />, withAuth: false },
  { id: 3, path: '/signup', element: <Signup />, withAuth: false },
  { id: 4, path: '/all', element: <All />, withAuth: true, isNavbar: true },
  { id: 5, path: '/myform', element: <MyForm />, withAuth: true, isNavbar: true },
  { id: 6, path: '/myresponses', element: <MyResponse />, withAuth: true, isNavbar: true },
  { id: 7, path: '/create', element: <Create />, withAuth: true, isNavbar: true },
  { id: 8, path: '/result', element: <ResultPage />, withAuth: true, isNavbar: true }, // 설문 id
  { id: 9, path: '/responseform', element: <ResponseForm />, withAuth: true, isNavbar: true }, // 설문 하기
  { id: 10, path: '/myanswer', element: <MyAnswer />, withAuth: true, isNavbar: true },
  { id: 11, path: '/edit', element: <Create />, withAuth: true, isNavbar: true }, // 설문 편집
  { id: 12, path: '/view', element: <ResponseForm />, withAuth: true, isNavbar: true }, // 설문 보기
  { id: 13, path: '/mypage', element: <MyPage />, withAuth: true, isNavbar: true }, // 마이페이지
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const location = useLocation();
  const navigate = useNavigate();

  RouteChangeTracker();

  if (!isLoggedIn) {
    return (
      <Alert
        type="error"
        message="로그인이 필요한 페이지입니다."
        buttonText="확인"
        buttonClick={() => navigate('/login', { state: { from: location }, replace: true })}
      />
    );
  }

  return children;
}

const Router = createBrowserRouter(
  routerData.map((route) => {
    const routeElement = route.isNavbar ? <MainLayout>{route.element}</MainLayout> : route.element;

    if (route.withAuth) {
      return {
        path: route.path,
        element: <ProtectedRoute>{routeElement}</ProtectedRoute>,
      };
    }

    return {
      path: route.path,
      element: routeElement,
    };
  }),
);

export default Router;
