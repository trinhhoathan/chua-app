import type { Verdict } from '@/lib/fengshui/rules';

const LABEL: Record<Verdict, string> = {
  good: 'Nên',
  caution: 'Cân nhắc',
  bad: 'Tránh',
};

const CLASS: Record<Verdict, string> = {
  good: 'bg-jade text-white',
  caution: 'bg-gilt text-ink',
  bad: 'bg-lacquer text-white',
};

export function VerdictBadge({
  verdict,
  className = '',
}: {
  verdict: Verdict;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[0.65rem] tracking-widest uppercase ${CLASS[verdict]} ${className}`}
    >
      {LABEL[verdict]}
    </span>
  );
}
