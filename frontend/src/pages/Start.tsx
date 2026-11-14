import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.svg';

const ArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const features = [
  {
    title: 'AI가 질문 초안을 잡아줘요',
    description: '주제만 입력하면 질문 구성과 응답 유형까지 한 번에 만들어져요. 마음에 들지 않는 부분만 고치면 돼요.',
  },
  {
    title: '응답은 들어오는 즉시 차트로',
    description: '객관식은 비율로, 별점은 평균으로, 주관식은 모아서. 따로 엑셀을 열 필요가 없어요.',
  },
  {
    title: '링크 하나로 공유',
    description: '설문 링크를 복사해 어디든 붙여넣으세요. 목표 응답 수에 도달하면 리포트를 받아볼 수 있어요.',
  },
  {
    title: '검증된 템플릿에서 시작',
    description: '고객 만족도, UX 리서치, 행사 신청 등 다른 사용자들이 공유한 템플릿을 그대로 가져다 쓰세요.',
  },
];

const mockQuestions = [
  { no: 1, text: '신메뉴를 얼마나 자주 주문하시나요?', type: '객관식' },
  { no: 2, text: '맛에 대한 만족도를 알려주세요', type: '별점' },
  { no: 3, text: '개선되었으면 하는 점이 있다면?', type: '주관식' },
];

const mockResults = [
  { label: '주 1회 이상', value: 42 },
  { label: '월 2~3회', value: 31 },
  { label: '월 1회 이하', value: 18 },
  { label: '처음 주문', value: 9 },
];

function ProductPreview() {
  return (
    <div className="relative">
      {/* Builder card */}
      <div className="lg:mr-14 bg-white rounded-2xl border border-secondary-200 shadow-[0_8px_32px_rgba(25,31,40,0.06)] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-secondary-100">
          <p className="text-xs font-medium text-secondary-500 mb-2">AI로 설문 만들기</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3.5 py-2.5 bg-secondary-50 rounded-lg text-sm text-secondary-800">
              카페 신메뉴 만족도 조사
            </div>
            <div className="px-3.5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-lg">생성</div>
          </div>
        </div>
        <ul className="divide-y divide-secondary-100">
          {mockQuestions.map((q) => (
            <li key={q.no} className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 flex items-center justify-center rounded-md bg-secondary-100 text-xs font-semibold text-secondary-600 tabular-nums">
                {q.no}
              </span>
              <span className="flex-1 text-sm text-secondary-800 truncate">{q.text}</span>
              <span className="text-xs text-secondary-500">{q.type}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Result card */}
      <div className="relative mt-4 lg:-mt-5 lg:ml-24 bg-white rounded-2xl border border-secondary-200 shadow-[0_12px_40px_rgba(25,31,40,0.10)] p-5">
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-sm font-semibold text-secondary-900">Q1 응답 결과</p>
          <p className="text-xs text-secondary-500 tabular-nums">128명 응답</p>
        </div>
        <div className="space-y-3">
          {mockResults.map((r, i) => (
            <div key={r.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-secondary-700">{r.label}</span>
                <span className="font-semibold text-secondary-900 tabular-nums">{r.value}%</span>
              </div>
              <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${i === 0 ? 'bg-primary-500' : 'bg-primary-200'}`}
                  style={{ width: `${r.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Start() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const go = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-white text-secondary-900">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md transition-[border-color] ${
          isScrolled ? 'border-b border-secondary-200' : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <button onClick={() => navigate('/')} className="flex items-center gap-2">
                <img src={logo} alt="" className="w-7 h-7" />
                <span className="text-[17px] font-bold tracking-tight">FormFlex</span>
              </button>
              <div className="hidden md:flex items-center gap-7 text-[15px]">
                <a href="#features" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  기능
                </a>
                <button onClick={() => navigate('/surveys')} className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  설문 둘러보기
                </button>
                <button onClick={() => navigate('/templates')} className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  템플릿
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-2 text-[15px] text-secondary-700 font-medium rounded-lg hover:bg-secondary-100 transition-colors"
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 text-[15px] bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              >
                무료로 시작하기
              </button>
            </div>

            <button
              className="md:hidden p-2 -mr-2 text-secondary-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="메뉴"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-100 bg-white px-5 pb-5 pt-2">
            <div className="flex flex-col">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-[15px] text-secondary-700"
              >
                기능
              </a>
              <button onClick={() => go('/surveys')} className="py-3 text-[15px] text-secondary-700 text-left">
                설문 둘러보기
              </button>
              <button onClick={() => go('/templates')} className="py-3 text-[15px] text-secondary-700 text-left">
                템플릿
              </button>
              <button onClick={() => go('/login')} className="py-3 text-[15px] text-secondary-700 text-left">
                로그인
              </button>
              <button
                onClick={() => go('/signup')}
                className="mt-3 w-full py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              >
                무료로 시작하기
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 lg:pt-40 pb-20 lg:pb-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-14 lg:gap-16 items-center">
          <div>
            <h1 className="text-[40px] leading-[1.2] sm:text-5xl lg:text-[56px] lg:leading-[1.18] font-bold tracking-[-0.03em]">
              설문은 쉽게,
              <br />
              결과는 바로.
            </h1>
            <p className="mt-6 text-[17px] lg:text-lg text-secondary-600 leading-relaxed max-w-md">
              AI가 질문 초안을 잡아주고, 응답이 들어오는 즉시 차트로 정리해드려요. 링크 하나만 공유하면 끝이에요.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-3.5 bg-primary-500 text-white text-base font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              >
                무료로 시작하기
              </button>
              <button
                onClick={() => navigate('/surveys')}
                className="group inline-flex items-center justify-center gap-1.5 px-5 py-3.5 text-base font-semibold text-secondary-700 rounded-xl hover:bg-secondary-100 transition-colors"
              >
                설문 둘러보기
                <span className="transition-transform group-hover:translate-x-0.5">
                  <ArrowRight />
                </span>
              </button>
            </div>
            <p className="mt-5 text-sm text-secondary-500">가입하지 않아도 공개 설문과 템플릿을 볼 수 있어요.</p>
          </div>

          <ProductPreview />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 px-5 sm:px-8 bg-secondary-50 border-y border-secondary-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[28px] lg:text-4xl font-bold tracking-[-0.025em] leading-snug max-w-xl">
            만들고, 모으고, 읽는 것까지
            <br />
            한 곳에서 끝내세요
          </h2>

          <div className="mt-14 grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {features.map((feature, i) => (
              <div key={feature.title} className="pt-6 border-t border-secondary-200">
                <p className="text-sm font-semibold text-primary-500 tabular-nums">0{i + 1}</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-2.5 text-[15px] text-secondary-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <h2 className="text-[28px] lg:text-4xl font-bold tracking-[-0.025em] leading-snug">
              첫 설문, 지금 3분이면 충분해요
            </h2>
            <p className="mt-3 text-[17px] text-secondary-600">무료로 시작하고, 설문 개수 제한 없이 만들어보세요.</p>
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="self-start md:self-auto px-6 py-3.5 bg-secondary-900 text-white text-base font-semibold rounded-xl hover:bg-secondary-800 transition-colors"
          >
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-5 sm:px-8 border-t border-secondary-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="w-6 h-6" />
            <span className="font-bold tracking-tight">FormFlex</span>
          </div>
          <p className="text-secondary-500 text-sm">© FormFlex</p>
        </div>
      </footer>
    </div>
  );
}

export default Start;
