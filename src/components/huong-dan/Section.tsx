import type { ReactNode } from 'react';

export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-fog/70 pt-12 pb-4 first:border-t-0 first:pt-0 animate-rise"
    >
      <h2 className="font-display text-2xl md:text-3xl text-ink tracking-tight">
        {title}
      </h2>
      {lead ? (
        <p className="mt-3 max-w-2xl text-base text-muted leading-relaxed">
          {lead}
        </p>
      ) : null}
      <div className="mt-6 space-y-4 text-sm md:text-[0.95rem] text-ink/90 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export function FlowSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={step} className="flex gap-3">
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: 'var(--primary-color, #7A1F1F)' }}
          >
            {i + 1}
          </span>
          <span className="text-muted pt-1">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-muted">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gilt" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
