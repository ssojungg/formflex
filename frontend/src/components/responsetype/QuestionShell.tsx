interface QuestionShellProps {
  index: number;
  color: string;
  typeLabel: string;
  content: string;
  imageUrl?: string;
  overflowVisible?: boolean;
  children: React.ReactNode;
}

export const tint = (color: string, percent: number) => `color-mix(in srgb, ${color} ${percent}%, white)`;

function QuestionShell({
  index,
  color,
  typeLabel,
  content,
  imageUrl,
  overflowVisible = false,
  children,
}: QuestionShellProps) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-200 ${overflowVisible ? '' : 'overflow-hidden'}`}>
      <div className="flex items-start gap-3 px-5 sm:px-7 pt-6 pb-4">
        <span
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold tabular-nums"
          style={{ backgroundColor: tint(color, 12), color }}
        >
          {index}
        </span>
        <div className="flex-1 min-w-0 pt-0.5">
          <h2 className="text-[16px] sm:text-[17px] font-semibold leading-snug text-gray-900 break-keep">{content}</h2>
          <p className="mt-1 text-xs text-gray-500">{typeLabel}</p>
        </div>
      </div>
      {imageUrl && (
        <div className="px-5 sm:px-7 pb-4 sm:pl-[68px]">
          <img
            src={imageUrl}
            alt="질문 이미지"
            className="rounded-xl max-w-full max-h-64 object-contain border border-gray-100"
          />
        </div>
      )}
      <div className="px-5 sm:px-7 pb-6 sm:pl-[68px]">{children}</div>
    </section>
  );
}

export default QuestionShell;
