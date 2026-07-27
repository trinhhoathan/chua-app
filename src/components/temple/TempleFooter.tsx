import type { Temple } from '@/types/database';

interface Props {
  temple: Temple;
}

export function TempleFooter({ temple }: Props) {
  return (
    <footer className="bg-ink text-white/55 py-10 px-6 md:px-12">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="font-display text-xl text-white">{temple.name}</p>
          {temple.temple_alt_name ? (
            <p className="mt-1 text-sm">{temple.temple_alt_name}</p>
          ) : null}
        </div>
        {temple.address ? (
          <p className="text-xs">{temple.address}</p>
        ) : null}
      </div>
    </footer>
  );
}
