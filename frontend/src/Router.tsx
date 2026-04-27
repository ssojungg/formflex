import React from 'react';
import { createBrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import Start from './pages/Start';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MainLayout from './layout/MainLayout';
import TemplateLibrary from './pages/TemplateLibrary';
import SurveyDashboard from './pages/SurveyDashboard';
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
  withAuth?: boolean;
  isNavbar?: boolean;
}

const routerData: RouterElement[] = [
  { id: 1, path: '/', element: <Start />, withAuth: false },
  { id: 2, path: '/login', element: <Login />, withAuth: false },
  { id: 3, path: '/signup', element: <Signup />, withAuth: false },
  // Survey Dashboard - ALL public surveys from ALL users (viewable without login)
  { id: 4, path: '/surveys', element: <SurveyDashboard />, withAuth: false, isNavbar: true },
  // Template Library - Community templates (viewable without login)
  { id: 5, path: '/templates', element: <TemplateLibrary />, withAuth: false, isNavbar: true },
  // My Forms - User's own surveys
  { id: 6, path: '/myform', element: <MyForm />, withAuth: true, isNavbar: true },
  { id: 7, path: '/myresponses', element: <MyResponse />, withAuth: true, isNavbar: true },
  // Create/Edit survey
  { id: 8, path: '/create', element: <Create />, withAuth: true, isNavbar: false },
  { id: 9, path: '/edit', element: <Create />, withAuth: true, isNavbar: false },
  // Analytics
  { id: 10, path: '/result', element: <ResultPage />, withAuth: true, isNavbar: true },
  // Response form
  { id: 11, path: '/responseform', element: <ResponseForm />, withAuth: false, isNavbar: false },
  { id: 12, path: '/view', element: <ResponseForm />, withAuth: true, isNavbar: true },
  // My answers & profile
  { id: 13, path: '/myanswer', element: <MyAnswer />, withAuth: true, isNavbar: true },
  { id: 14, path: '/mypage', element: <MyPage />, withAuth: true, isNavbar: true },
  // Legacy routes (redirect to new)
  { id: 15, path: '/all', element: <TemplateLibrary />, withAuth: true, isNavbar: true },
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
