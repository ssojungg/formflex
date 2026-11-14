import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Alert from '../components/common/Alert';
import { ApiResponseError } from '../types/apiResponseError';
import { SignupForm } from '../types/auth';
import { checkEmailAPI, singupAPI } from '../api/signup';
import logo from '../assets/logo.svg';

function Signup() {
  const navigate = useNavigate();
  const [signupInfo, setSignupInfo] = useState<SignupForm>({ name: '', email: '', password: '' });
  const [isCheckedEmail, setIsCheckedEmail] = useState<boolean>(false);
  const [isCheckEmailErrorMessage, setIsCheckEmailErrorMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: checkEmailMutation } = useMutation({
    mutationFn: checkEmailAPI,
    onSuccess: (data) => {
      if (data.exists) {
        setIsCheckEmailErrorMessage('이미 사용 중인 이메일입니다.');
        setIsCheckedEmail(false);
      } else {
        setIsCheckEmailErrorMessage('');
        setIsCheckedEmail(true);
      }
    },
    onError: (error: AxiosError) => {
      const err = error as AxiosError<ApiResponseError>;
      setIsCheckEmailErrorMessage(err.response?.data?.message || '이메일 중복 확인에 실패했습니다. 다시 시도해주세요.');
      setIsCheckedEmail(false);
    },
  });

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCheckEmailClick = () => {
    if (!isValidEmail(signupInfo.email)) {
      setIsCheckEmailErrorMessage('유효한 이메일 형식이 아닙니다.');
      setIsCheckedEmail(false);
      return;
    }
    checkEmailMutation(signupInfo.email);
  };

  const [showSignupError, setShowSignupError] = useState(false);

  const {
    mutate: signupMutation,
    isSuccess,
  } = useMutation({
    mutationFn: singupAPI,
    onError: (error: AxiosError) => {
      const err = error as AxiosError<ApiResponseError>;
      setErrorMessage(err.response?.data?.message || '회원가입에 실패했습니다.');
      setShowSignupError(true);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupInfo({ ...signupInfo, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      setIsCheckedEmail(false);
      setIsCheckEmailErrorMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCheckedEmail) {
      setIsCheckEmailErrorMessage('이메일 중복 확인이 필요합니다.');
      return;
    }
    signupMutation(signupInfo);
  };

  const isSignupButtonEnabled = isCheckedEmail && signupInfo.name !== '' && signupInfo.password !== '';

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
            <h1 className="text-[28px] font-bold tracking-[-0.025em] text-secondary-900">회원가입</h1>
            <p className="mt-2 text-secondary-600">계정을 만들고 첫 설문을 시작해보세요.</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1.5">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={signupInfo.name}
                onChange={handleInputChange}
                required
                placeholder="홍길동"
                className="w-full h-12 px-4 bg-secondary-50 border border-secondary-200 rounded-xl text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-colors"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1.5">
                이메일
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={signupInfo.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@example.com"
                  className={`w-full h-12 px-4 pr-24 bg-secondary-50 border rounded-xl text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:bg-white focus:ring-4 transition-colors ${
                    isCheckedEmail
                      ? 'border-success focus:border-success focus:ring-success/10'
                      : isCheckEmailErrorMessage
                        ? 'border-error focus:border-error focus:ring-error/10'
                        : 'border-secondary-200 focus:border-primary-500 focus:ring-primary-500/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleCheckEmailClick}
                  disabled={isCheckedEmail || signupInfo.email === ''}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isCheckedEmail
                      ? 'bg-emerald-50 text-emerald-600 cursor-default'
                      : signupInfo.email === ''
                        ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                        : 'bg-secondary-900 text-white hover:bg-secondary-800'
                  }`}
                >
                  {isCheckedEmail ? '확인됨' : '중복확인'}
                </button>
              </div>
              {isCheckEmailErrorMessage && (
                <p className="mt-1.5 text-sm text-error">{isCheckEmailErrorMessage}</p>
              )}
              {isCheckedEmail && (
                <p className="mt-1.5 text-sm text-emerald-600">사용 가능한 이메일입니다.</p>
              )}
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
                  value={signupInfo.password}
                  onChange={handleInputChange}
                  required
                  placeholder="8자 이상 입력하세요"
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

            {/* Terms */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-0.5 w-4 h-4 rounded border-secondary-300 accent-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-secondary-600">
                <span className="text-secondary-800 font-medium underline underline-offset-2 cursor-pointer">이용약관</span> 및{' '}
                <span className="text-secondary-800 font-medium underline underline-offset-2 cursor-pointer">개인정보처리방침</span>에 동의합니다.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isSignupButtonEnabled}
              className={`w-full h-12 mt-2 rounded-xl font-semibold transition-colors ${
                isSignupButtonEnabled
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
              }`}
            >
              회원가입
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-secondary-200" />
            <span className="text-xs text-secondary-400">또는</span>
            <div className="flex-1 h-px bg-secondary-200" />
          </div>

          {/* Google Signup */}
          <button className="w-full h-12 rounded-xl font-medium border border-secondary-200 bg-white text-secondary-800 hover:bg-secondary-50 transition-colors flex items-center justify-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 계속하기
          </button>

          {/* Login Link */}
          <p className="text-center mt-8 text-sm text-secondary-600">
            이미 계정이 있으신가요?{' '}
            <button onClick={() => navigate('/login')} className="text-primary-500 hover:text-primary-600 font-semibold">
              로그인
            </button>
          </p>

          {isSuccess && (
            <Alert
              type="success"
              message="회원가입이 완료되었습니다."
              buttonText="확인"
              buttonClick={() => navigate('/login')}
            />
          )}
          {showSignupError && <Alert type="error" message={errorMessage} buttonText="확인" onClose={() => setShowSignupError(false)} />}
        </div>
      </div>
    </div>
  );
}

export default Signup;
