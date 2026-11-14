import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, MotionConfig, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import logo from '../assets/logo.svg';
import CoverArt from '../components/common/CoverArt';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function Reveal({
  children,
  delay = 0,
  className,
  immediate = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  immediate?: boolean;
}) {
  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={immediate ? target : undefined}
      whileInView={immediate ? undefined : target}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-medium tracking-[0.12em] text-secondary-500">{children}</p>;
}

const ArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const steps = [
  {
    title: '주제만 적으면 질문이 나와요',
    description:
      '‘카페 신메뉴 반응’처럼 한 줄만 쓰면 AI가 질문과 보기를 채워 줘요. 마음에 안 드는 문항은 지우거나 고쳐 쓰면 됩니다.',
  },
  {
    title: '우리 설문답게 다듬기',
    description:
      '질문 순서는 끌어서 바꾸고, 테마 색과 글꼴도 직접 고를 수 있어요. 질문에 넣을 이미지는 검색해서 바로 붙이면 돼요.',
  },
  {
    title: '링크로 보내고, 결과는 바로 확인',
    description:
      '응답은 들어오는 대로 질문별로 집계돼요. 원본은 엑셀로 받고, 요약은 PDF로 저장하거나 메일로 보낼 수 있어요.',
  },
];

const features = [
  { label: 'AI 생성', title: '주제로 질문 초안 만들기', description: '질문 유형과 보기까지 한 번에 채워 줘요.' },
  { label: '편집', title: '끌어서 순서 바꾸기', description: '질문 카드를 잡고 원하는 자리에 놓으면 끝이에요.' },
  { label: '질문 유형', title: '단답부터 평점·날짜까지', description: '객관식, 복수 선택, 드롭다운, 이메일도 고를 수 있어요.' },
  { label: '마감', title: '마감일 정해 두기', description: '정한 날짜가 지나면 설문이 종료 상태로 바뀌어요.' },
  { label: '분석', title: '질문별 자동 집계', description: '선택지 분포와 주관식 키워드를 한 화면에서 봐요.' },
  { label: '내보내기', title: '엑셀 · PDF 리포트', description: '원본은 엑셀로, 요약은 PDF로 받거나 메일로 보내요.' },
];

const templateCategories = [
  { category: '고객 만족', question: '오늘 서비스는 얼마나 만족스러우셨나요?' },
  { category: '시장 조사', question: '이 제품이 출시되면 구매할 의향이 있나요?' },
  { category: 'UX 리서치', question: '원하는 메뉴를 찾기까지 어렵지 않았나요?' },
  { category: '직원 설문', question: '요즘 팀 분위기를 한 단어로 표현한다면?' },
];

const mockQuestions = [
  { label: '주 1회 이상', value: 42 },
  { label: '월 2~3회', value: 31 },
  { label: '월 1회 이하', value: 18 },
  { label: '처음 주문', value: 9 },
];

const TREND = [4, 6, 5, 9, 8, 13, 11, 16, 15, 21, 19, 24];

function trendPath(width: number, height: number) {
  const max = Math.max(...TREND);
  const stepX = width / (TREND.length - 1);
  const pts = TREND.map((v, i) => [i * stepX, height - (v / max) * (height - 8) - 4]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i += 1) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return { line: d, area: `${d} L ${width} ${height} L 0 ${height} Z` };
}

function DashboardMock() {
  const { line, area } = trendPath(560, 150);
  return (
    <div className="flex bg-white text-left">
      {/* Mini sidebar */}
      <div className="hidden md:flex w-44 shrink-0 flex-col gap-1 border-r border-secondary-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <img src={logo} alt="" className="w-5 h-5" />
          <span className="text-[13px] font-bold">FormFlex</span>
        </div>
        {['설문 탐색', '템플릿', '분석', '내 설문'].map((item) => (
          <div
            key={item}
            className={`px-2.5 py-1.5 rounded-md text-[12px] ${item === '분석' ? 'bg-secondary-100 font-semibold text-secondary-900' : 'text-secondary-500'}`}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="flex-1 min-w-0 p-4 sm:p-6 bg-secondary-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] text-secondary-500">설문 분석</p>
            <p className="text-[15px] font-bold tracking-tight">카페 신메뉴 만족도 조사</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            진행중
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-secondary-100 rounded-xl border border-secondary-200 overflow-hidden mb-4 [&>*]:bg-white">
          {[
            { k: '총 응답', v: '128', d: '+14' },
            { k: '오늘', v: '14', d: '+5' },
            { k: '질문', v: '6', d: null },
            { k: '주관식 응답', v: '41', d: null },
          ].map((s) => (
            <div key={s.k} className="px-3.5 py-3">
              <p className="text-[11px] text-secondary-500">{s.k}</p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-lg font-bold tabular-nums">{s.v}</span>
                {s.d && <span className="text-[10.5px] font-semibold text-emerald-600">{s.d}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-5 gap-3">
          <div className="sm:col-span-3 bg-white rounded-xl border border-secondary-200 p-4">
            <p className="text-[12px] font-semibold mb-3">일자별 응답</p>
            <svg viewBox="0 0 560 150" className="w-full h-28 sm:h-36" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mockArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3182f6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#3182f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d={area}
                fill="url(#mockArea)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
              <motion.path
                d={line}
                fill="none"
                stroke="#3182f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
              />
            </svg>
          </div>
          <div className="sm:col-span-2 bg-white rounded-xl border border-secondary-200 p-4">
            <p className="text-[12px] font-semibold mb-3">Q1 · 얼마나 자주 주문하세요?</p>
            <div className="space-y-2.5">
              {mockQuestions.map((r, i) => (
                <div key={r.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-secondary-600">{r.label}</span>
                    <span className="font-semibold tabular-nums">{r.value}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${i === 0 ? 'bg-primary-500' : 'bg-primary-200'}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${r.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.5 + i * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.25'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  return (
    <div ref={ref} className="[perspective:1400px]">
      <motion.div
        style={{ rotateX, scale, transformOrigin: 'center top' }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
        className="rounded-2xl sm:rounded-[20px] border border-secondary-200 bg-white p-1.5 sm:p-2 shadow-[0_24px_80px_-24px_rgba(25,31,40,0.25)]"
      >
        <div className="rounded-xl sm:rounded-[14px] overflow-hidden border border-secondary-100">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function Start() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ lerp: 0.1 });
    lenisRef.current = lenis;
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const go = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(`#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView();
    }
  };

  const navLinks = [
    { label: '작동 방식', href: 'how' },
    { label: '기능', href: 'features' },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white text-secondary-900">
        {/* Navigation */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md transition-[border-color] ${
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
                  {navLinks.map((l) => (
                    <a
                      key={l.href}
                      href={`#${l.href}`}
                      onClick={(e) => scrollToSection(e, l.href)}
                      className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    >
                      {l.label}
                    </a>
                  ))}
                  <button onClick={() => navigate('/templates')} className="text-secondary-600 hover:text-secondary-900 transition-colors">
                    템플릿
                  </button>
                  <button onClick={() => navigate('/surveys')} className="text-secondary-600 hover:text-secondary-900 transition-colors">
                    설문 둘러보기
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
                  className="px-4 py-2 text-[15px] bg-secondary-900 text-white font-semibold rounded-lg hover:bg-secondary-800 transition-colors"
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
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={`#${l.href}`}
                    onClick={(e) => scrollToSection(e, l.href)}
                    className="py-3 text-[15px] text-secondary-700"
                  >
                    {l.label}
                  </a>
                ))}
                <button onClick={() => go('/templates')} className="py-3 text-[15px] text-secondary-700 text-left">
                  템플릿
                </button>
                <button onClick={() => go('/surveys')} className="py-3 text-[15px] text-secondary-700 text-left">
                  설문 둘러보기
                </button>
                <button onClick={() => go('/login')} className="py-3 text-[15px] text-secondary-700 text-left">
                  로그인
                </button>
                <button
                  onClick={() => go('/signup')}
                  className="mt-3 w-full py-3 bg-secondary-900 text-white font-semibold rounded-lg hover:bg-secondary-800 transition-colors"
                >
                  무료로 시작하기
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero */}
        <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-5 sm:px-8 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d1d6db_1px,transparent_1px)] [background-size:22px_22px]
                       [mask-image:radial-gradient(ellipse_70%_55%_at_50%_30%,black_20%,transparent_75%)]"
          />
          <div className="relative max-w-6xl mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <Reveal immediate>
                <h1 className="text-[42px] leading-[1.18] sm:text-6xl lg:text-[72px] lg:leading-[1.1] font-bold tracking-[-0.035em]">
                  설문은 쉽게,
                  <br />
                  결과는 바로.
                </h1>
              </Reveal>
              <Reveal immediate delay={0.08}>
                <p className="mt-6 text-[17px] lg:text-xl text-secondary-600 leading-relaxed max-w-xl mx-auto">
                  주제를 적으면 질문 초안이 나오고, 응답은 들어오는 대로 차트가 돼요. 링크 하나 보내면 준비 끝.
                </p>
              </Reveal>
              <Reveal immediate delay={0.16} className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-3.5 bg-primary-500 text-white text-base font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                >
                  무료로 시작하기
                </button>
                <button
                  onClick={() => navigate('/surveys')}
                  className="group inline-flex items-center justify-center gap-1.5 px-5 py-3.5 text-base font-semibold text-secondary-800 bg-white border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
                >
                  공개 설문 둘러보기
                  <span className="transition-transform group-hover:translate-x-0.5">
                    <ArrowRight />
                  </span>
                </button>
              </Reveal>
              <Reveal immediate delay={0.24}>
                <p className="mt-5 text-sm text-secondary-500">공개 설문과 템플릿은 가입하지 않아도 볼 수 있어요.</p>
              </Reveal>
            </div>

            <div className="mt-16 lg:mt-20">
              <ScrollFrame>
                <DashboardMock />
              </ScrollFrame>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 py-20 lg:py-32 px-5 sm:px-8 border-t border-secondary-100">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] gap-12 lg:gap-16">
            <Reveal className="lg:sticky lg:top-28 self-start">
              <Eyebrow>작동 방식</Eyebrow>
              <h2 className="mt-4 text-[32px] lg:text-[44px] leading-[1.2] font-bold tracking-[-0.03em]">
                만들고, 보내고,
                <br />
                읽는 것까지
              </h2>
              <p className="mt-5 text-[16px] text-secondary-600 leading-relaxed max-w-sm">
                설문 만드는 도구, 응답 모으는 도구, 정리하는 엑셀을 따로 열 필요가 없어요.
              </p>
            </Reveal>

            <ol className="border-t border-secondary-200">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.06}>
                  <li className="grid grid-cols-[48px_minmax(0,1fr)] sm:grid-cols-[88px_minmax(0,1fr)] py-9 border-b border-secondary-200">
                    <span className="text-[15px] font-semibold text-primary-500 tabular-nums pt-0.5">0{i + 1}</span>
                    <div>
                      <h3 className="text-xl lg:text-[22px] font-bold tracking-tight">{s.title}</h3>
                      <p className="mt-3 text-[15px] lg:text-base text-secondary-600 leading-[1.75] max-w-xl">{s.description}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 py-20 lg:py-28 px-5 sm:px-8 bg-secondary-50 border-y border-secondary-100">
          <div className="max-w-6xl mx-auto">
            <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <Eyebrow>기능</Eyebrow>
                <h2 className="mt-4 text-[30px] lg:text-[40px] leading-[1.25] font-bold tracking-[-0.03em]">
                  설문에 필요한 것만 담았어요
                </h2>
              </div>
              <p className="text-sm text-secondary-500">AI 생성 · 질문 편집 · 집계 · 내보내기</p>
            </Reveal>

            <Reveal delay={0.1} className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-secondary-200 border border-secondary-200 rounded-2xl overflow-hidden">
              {features.map((f) => (
                <div key={f.title} className="bg-white p-7 lg:p-8 transition-colors hover:bg-secondary-50/60">
                  <p className="text-[13px] font-semibold tracking-[0.06em] text-primary-500">{f.label}</p>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[15px] text-secondary-600 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Templates */}
        <section className="py-20 lg:py-28 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <Eyebrow>템플릿</Eyebrow>
                <h2 className="mt-4 text-[30px] lg:text-[40px] leading-[1.25] font-bold tracking-[-0.03em]">
                  자주 쓰는 설문은 템플릿으로
                </h2>
              </div>
              <button
                onClick={() => navigate('/templates')}
                className="group inline-flex items-center gap-1.5 self-start sm:self-auto text-[15px] font-semibold text-secondary-800 hover:text-secondary-900"
              >
                템플릿 전체 보기
                <span className="transition-transform group-hover:translate-x-0.5">
                  <ArrowRight />
                </span>
              </button>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templateCategories.map((t, i) => (
                <Reveal key={t.category} delay={i * 0.07}>
                  <button
                    onClick={() => navigate('/templates')}
                    className="group w-full text-left rounded-2xl border border-secondary-200 bg-white p-4 transition-[border-color,box-shadow,transform] hover:border-secondary-300 hover:shadow-card-hover hover:-translate-y-0.5"
                  >
                    <div className="aspect-[16/11] rounded-xl overflow-hidden border border-secondary-100">
                      <CoverArt
                        title={t.question}
                        category={t.category}
                        className="transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <p className="mt-4 text-[13px] text-secondary-500">{t.category}</p>
                    <p className="mt-1 text-[15px] font-semibold leading-snug text-secondary-900">{t.question}</p>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 sm:px-8 pb-20 lg:pb-28">
          <Reveal className="max-w-6xl mx-auto rounded-3xl bg-secondary-900 px-8 py-14 lg:px-16 lg:py-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <h2 className="text-[28px] lg:text-[40px] leading-[1.25] font-bold tracking-[-0.03em] text-white">
                첫 설문, 지금 만들어 보세요
              </h2>
              <p className="mt-3 text-[16px] text-secondary-400">가입하고 바로 시작할 수 있어요. 설문 개수 제한은 없어요.</p>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="self-start md:self-auto px-6 py-3.5 bg-white text-secondary-900 text-base font-semibold rounded-xl hover:bg-secondary-100 transition-colors"
            >
              무료로 시작하기
            </button>
          </Reveal>
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
    </MotionConfig>
  );
}

export default Start;
