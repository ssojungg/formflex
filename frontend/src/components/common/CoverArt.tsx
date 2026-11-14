type Palette = { bg: string; accent: string; soft: string };

const PALETTES: Record<string, Palette> = {
  customer: { bg: '#FFF5E9', accent: '#F08A24', soft: '#FFE2C2' },
  market: { bg: '#EAF7EF', accent: '#16A34A', soft: '#CDEFD9' },
  ux: { bg: '#EEF5FF', accent: '#3182F6', soft: '#D3E5FD' },
  employee: { bg: '#E8F6F8', accent: '#0E9AA7', soft: '#C8EBEF' },
  event: { bg: '#FDEEF1', accent: '#E5484D', soft: '#F9D3D9' },
  education: { bg: '#FFF8E1', accent: '#C98A00', soft: '#FBE7A8' },
  health: { bg: '#EAF6F2', accent: '#0F9D7A', soft: '#CBEBE0' },
};

const CATEGORY_KEYS: Record<string, string> = {
  '고객 만족': 'customer',
  '시장 조사': 'market',
  'UX 리서치': 'ux',
  '직원 설문': 'employee',
  이벤트: 'event',
  교육: 'education',
  헬스케어: 'health',
};

const KEYWORDS: [RegExp, string][] = [
  [/UX|사용성|인터뷰|앱|웹/i, 'ux'],
  [/직원|조직|HR|팀|근무|사내/i, 'employee'],
  [/컨퍼런스|행사|이벤트|세션|축제|모임/i, 'event'],
  [/신제품|시장|브랜드|구매|출시/i, 'market'],
  [/교육|강의|수업|학습|학생|과목/i, 'education'],
  [/건강|헬스|병원|운동|수면/i, 'health'],
  [/만족|고객|서비스|후기|피드백/i, 'customer'],
];

const LABELS: Record<string, string> = Object.fromEntries(Object.entries(CATEGORY_KEYS).map(([k, v]) => [v, k]));

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

function resolveKey(title: string, category?: string) {
  if (category && CATEGORY_KEYS[category]) return CATEGORY_KEYS[category];
  const match = KEYWORDS.find(([re]) => re.test(title));
  if (match) return match[1];
  const keys = Object.keys(PALETTES);
  return keys[hash(title) % keys.length];
}

interface CoverArtProps {
  title: string;
  category?: string;
  className?: string;
  compact?: boolean;
}

export function CoverArt({ title, category, className = '', compact = false }: CoverArtProps) {
  const key = resolveKey(title, category);
  const p = PALETTES[key];

  if (compact) {
    return (
      <div
        aria-hidden
        className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}
        style={{
          backgroundColor: p.bg,
          backgroundImage: `radial-gradient(${p.soft} 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      >
        <div className="w-6 h-7 rounded-[4px] bg-white shadow-[0_2px_6px_-2px_rgba(25,31,40,0.2)] p-1 flex flex-col gap-[3px]">
          <span className="h-[3px] w-3/4 rounded-full" style={{ backgroundColor: p.accent }} />
          <span className="h-[3px] rounded-full bg-secondary-200" />
          <span className="h-[3px] w-2/3 rounded-full bg-secondary-200" />
        </div>
      </div>
    );
  }
  const h = hash(title);
  const flip = h % 2 === 0;
  const tilt = ((h >>> 3) % 3) + 2;
  const selected = (h >>> 5) % 3;
  const bars = [0, 1, 2].map((i) => 35 + ((h >>> (i * 4 + 7)) % 60));
  const label = category || LABELS[key];

  return (
    <div
      aria-hidden
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        backgroundColor: p.bg,
        backgroundImage: `radial-gradient(${p.soft} 1px, transparent 1px)`,
        backgroundSize: '14px 14px',
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: '70%',
          aspectRatio: '1',
          top: '-30%',
          [flip ? 'right' : 'left']: '-18%',
          background: `radial-gradient(circle, ${p.soft} 0%, transparent 70%)`,
        }}
      />

      {/* Results card */}
      <div
        className="absolute bottom-[14%] w-[30%] rounded-lg bg-white p-[3%] shadow-[0_6px_18px_-6px_rgba(25,31,40,0.18)]"
        style={{ [flip ? 'left' : 'right']: '8%', transform: `rotate(${flip ? -tilt : tilt}deg)` }}
      >
        <div className="flex items-end gap-[8%] h-10">
          {bars.map((b, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="flex-1 rounded-t-[3px]"
              style={{ height: `${b}%`, backgroundColor: i === selected ? p.accent : p.soft }}
            />
          ))}
        </div>
      </div>

      {/* Mini form card */}
      <div
        className="absolute top-[16%] w-[58%] rounded-xl bg-white p-[4%] shadow-[0_10px_28px_-10px_rgba(25,31,40,0.22)]"
        style={{ [flip ? 'right' : 'left']: '9%', transform: `rotate(${flip ? tilt - 1 : 1 - tilt}deg)` }}
      >
        {label && (
          <span
            className="inline-block rounded-full px-1.5 py-[1px] text-[9px] font-semibold leading-[14px]"
            style={{ backgroundColor: p.bg, color: p.accent }}
          >
            {label}
          </span>
        )}
        <p className="mt-1 text-[10.5px] font-semibold leading-[1.35] text-secondary-900 line-clamp-2 break-keep">{title}</p>
        <div className="mt-2 space-y-[5px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0 border"
                style={i === selected ? { backgroundColor: p.accent, borderColor: p.accent } : { borderColor: '#D1D6DB' }}
              />
              <span className="h-[5px] rounded-full bg-secondary-100" style={{ width: `${55 + ((h >>> (i + 2)) % 35)}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoverArt;
