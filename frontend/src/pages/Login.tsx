import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { LoginForm } from '../types/auth';
import { useAuthStore } from '../store/AuthStore';
import { ApiResponseError } from '../types/apiResponseError';
import Alert from '../components/common/Alert';
import { loginAPI } from '../api/login';
import logo from '../assets/logo.svg';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserId, setLoginStatus, setUserName, setUserEmail } = useAuthStore();
  const [loginInfo, setLoginInfo] = useState<LoginForm>({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const saveRedirectPath = () => {
    const fullPath = location.state?.from?.pathname + location.state?.from?.search || '/myform';
    localStorage.setItem('redirectPath', fullPath);
  };

  if (location.state?.from) {
    saveRedirectPath();
  }

  const handleLoginSuccess = () => {
    const from = localStorage.getItem('redirectPath') || '/surveys';
    navigate(from, { replace: true });
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem('redirectPath');
    };
  }, []);

  const { mutate: loginMutation, isError } = useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      setUserId(data.id);
      setLoginStatus(true);
      if (data.name) setUserName(data.name);
      if (data.email) setUserEmail(data.email);
      handleLoginSuccess();
    },
    onError: (error: AxiosError) => {
      const err = error as AxiosError<ApiResponseError>;
      setErrorMessage(err.response?.data?.message || '로그인에 실패했습니다.');
      setShowErrorAlert(true);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation(loginInfo);
  };

  const isLoginButtonEnabled = loginInfo.email !== '' && loginInfo.password !== '';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-16 px-5 sm:px-8 flex items-center">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <img src={logo} alt="" className="w-7 h-7" />
          <span className="text-[17px] font-bold tracking-tight text-secondary-900">FormFlex</span>
        </button>
      </header>

      <div className="flex-1 flex items-start sm:items-center justify-center px-5 pt-8 pb-16 sm:py-12">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-9">
            <h1 className="text-[28px] font-bold tracking-[-0.025em] text-secondary-900">로그인</h1>
            <p className="mt-2 text-secondary-600">FormFlex 계정으로 계속하세요.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1.5">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginInfo.email}
                onChange={handleInputChange}
                required
                placeholder="name@example.com"
                className="w-full h-12 px-4 bg-secondary-50 border border-secondary-200 rounded-xl text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1.5">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={loginInfo.password}
                  onChange={handleInputChange}
                  required
                  placeholder="비밀번호를 입력하세요"
                  className="w-full h-12 px-4 pr-12 bg-secondary-50 border border-secondary-200 rounded-xl text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-secondary-300 accent-primary-500" />
                <span className="text-sm text-secondary-600">로그인 상태 유지</span>
              </label>
              <button type="button" className="text-sm text-secondary-500 hover:text-secondary-800">
                비밀번호 찾기
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isLoginButtonEnabled}
              className={`w-full h-12 mt-2 rounded-xl font-semibold transition-colors ${
                isLoginButtonEnabled
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
              }`}
            >
              로그인
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-secondary-200" />
            <span className="text-xs text-secondary-400">또는</span>
            <div className="flex-1 h-px bg-secondary-200" />
          </div>

          {/* Google Login */}
          <button className="w-full h-12 rounded-xl font-medium border border-secondary-200 bg-white text-secondary-800 hover:bg-secondary-50 transition-colors flex items-center justify-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 계속하기
          </button>

          {/* Signup Link */}
          <p className="text-center mt-8 text-sm text-secondary-600">
            계정이 없으신가요?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-primary-500 hover:text-primary-600 font-semibold"
            >
              회원가입
            </button>
          </p>

          {showErrorAlert && <Alert type="error" message={errorMessage} buttonText="확인" onClose={() => setShowErrorAlert(false)} />}
        </div>
      </div>
    </div>
  );
}

export default Login;
