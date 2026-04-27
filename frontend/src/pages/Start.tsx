import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.svg';

// Feature icons as simple SVG components
const AIIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const TemplateIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

function Start() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <AIIcon />,
      title: 'AI 설문 자동 생성',
      description: '프롬프트만 입력하면 AI가 질문 구조를 자동으로 생성해드립니다.',
    },
    {
      icon: <ChartIcon />,
      title: '실시간 분석 대시보드',
      description: '응답 데이터를 다양한 차트와 그래프로 시각화하여 인사이트를 얻으세요.',
    },
    {
      icon: <ShareIcon />,
      title: '간편한 공유',
      description: '링크 하나로 설문을 공유하고, 응답자 N명 달성 시 자동 리포트를 받아보세요.',
    },
    {
      icon: <TemplateIcon />,
      title: '템플릿 라이브러리',
      description: '다른 사용자들이 공유한 템플릿을 검색하고 바로 사용해보세요.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="FormFlex" className="w-8 h-8 lg:w-10 lg:h-10" />
              <span className="text-xl lg:text-2xl font-bold text-secondary-900">FormFlex</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                기능
              </a>
              <button
                onClick={() => navigate('/all')}
                className="text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                템플릿
              </button>
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-secondary-700 hover:text-secondary-900 font-medium transition-colors"
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-5 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
              >
                무료로 시작하기
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-secondary-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu - Full screen overlay */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Menu Panel */}
              <div className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-2xl transform transition-transform duration-300 ease-out">
                <div className="flex items-center justify-between p-4 border-b border-secondary-100">
                  <span className="font-semibold text-secondary-900">메뉴</span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-secondary-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col p-4 gap-2">
                  <a 
                    href="#features" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-xl"
                  >
                    기능
                  </a>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/surveys');
                    }}
                    className="px-4 py-3 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-xl text-left"
                  >
                    설문 둘러보기
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/templates');
                    }}
                    className="px-4 py-3 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-xl text-left"
                  >
                    템플릿
                  </button>
                  <hr className="my-2 border-secondary-100" />
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="px-4 py-3 text-secondary-700 font-medium hover:bg-secondary-50 rounded-xl text-left"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/signup');
                    }}
                    className="mt-2 w-full py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    무료로 시작하기
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              AI 기반 설문 플랫폼
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight mb-6">
              설문을 만들고, 분석하고,
              <br />
              <span className="text-primary-500">공유하세요</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-secondary-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              FormFlex로 몇 분 만에 전문적인 설문을 만들고, 실시간으로 응답을 분석하세요. AI가 설문 작성을 도와드립니다.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 bg-primary-500 text-white font-semibold rounded-2xl hover:bg-primary-600 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                무료로 시작하기
              </button>
              <button
                onClick={() => navigate('/surveys')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-secondary-700 font-semibold rounded-2xl border border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50 transition-all"
              >
                설문 둘러보기
              </button>
            </div>

            {/* Trust Badge */}
            <p className="mt-8 text-sm text-secondary-500">
              신용카드 없이 시작 가능 · 무제한 설문 생성
            </p>
          </div>

          {/* Hero Image / Preview */}
          <div className="mt-16 lg:mt-20 relative">
            <div className="bg-gradient-to-br from-primary-100 via-primary-50 to-white rounded-3xl lg:rounded-[2rem] p-4 lg:p-8 shadow-2xl shadow-primary-500/10">
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-card overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary-50 border-b border-secondary-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="max-w-xs mx-auto bg-white rounded-lg px-4 py-1.5 text-sm text-secondary-400 border border-secondary-200">
                      formflex.io/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard Preview */}
                <div className="p-6 lg:p-8 bg-background-secondary min-h-[300px] lg:min-h-[400px]">
                  <div className="flex gap-6">
                    {/* Sidebar Preview */}
                    <div className="hidden lg:block w-60 bg-secondary-900 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg" />
                        <span className="text-white font-semibold">FormFlex</span>
                      </div>
                      <div className="space-y-2">
                        {['대시보드', '템플릿 라이브러리', '분석', '내 정보'].map((item, i) => (
                          <div
                            key={item}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              i === 0 ? 'bg-primary-500 text-white' : 'text-secondary-400'
                            }`}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main Content Preview */}
                    <div className="flex-1 space-y-4">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                        {[
                          { label: '전체 설문', value: '24', change: '+12.5%' },
                          { label: '총 응답 수', value: '18,432', change: '+28.4%' },
                          { label: '평균 완료율', value: '74.3%', change: '+3.2pp' },
                          { label: '활성 설문', value: '8', change: '+2' },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-white rounded-xl p-3 lg:p-4">
                            <p className="text-xs lg:text-sm text-secondary-500">{stat.label}</p>
                            <p className="text-lg lg:text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                            <p className="text-xs text-primary-500 mt-1">{stat.change}</p>
                          </div>
                        ))}
                      </div>

                      {/* Form Cards Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-white rounded-xl overflow-hidden">
                            <div className="h-20 lg:h-28 bg-gradient-to-br from-primary-200 to-primary-100" />
                            <div className="p-3 lg:p-4">
                              <div className="h-3 bg-secondary-200 rounded w-3/4 mb-2" />
                              <div className="h-2 bg-secondary-100 rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              설문 조사의 모든 것을 한 곳에서
            </h2>
            <p className="text-lg text-secondary-600">
              복잡한 설문 도구는 그만. FormFlex로 쉽고 빠르게 인사이트를 얻으세요.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 lg:p-8 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">3단계로 완성하는 설문</h2>
            <p className="text-lg text-secondary-600">복잡한 과정 없이 간단하게 시작하세요.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: '설문 작성',
                description: '직접 작성하거나 AI에게 맡기세요. 다양한 질문 유형과 이미지 첨부를 지원합니다.',
              },
              {
                step: '02',
                title: '공유 & 수집',
                description: '링크 하나로 간편하게 공유하고 응답을 실시간으로 수집하세요.',
              },
              {
                step: '03',
                title: '분석 & 리포트',
                description: '자동 생성된 차트와 통계로 인사이트를 얻고 PDF로 내보내세요.',
              },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex">
                  <div className="w-16 h-16 bg-primary-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full">
                      <div className="h-0.5 bg-primary-200 w-full" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{item.title}</h3>
                <p className="text-secondary-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 lg:p-16 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">지금 바로 시작하세요</h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              무료로 시작하고 필요할 때 업그레이드하세요. 복잡한 설정 없이 바로 설문을 만들 수 있습니다.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-2xl hover:bg-primary-50 transition-colors"
            >
              무료로 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="FormFlex" className="w-8 h-8" />
              <span className="text-xl font-bold text-secondary-900">FormFlex</span>
            </div>
            <p className="text-secondary-500 text-sm">2024 FormFlex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Start;
