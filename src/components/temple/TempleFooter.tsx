import Link from 'next/link';
import type { Temple } from '@/types/database';
import { isSimStoreEnabled } from '@/lib/sim/warehouse';

interface Props {
  temple: Temple;
}

export function TempleFooter({ temple }: Props) {
  const simStore = isSimStoreEnabled(temple);

  return (
    <footer className="bg-ink text-white/55 py-10 px-6 md:px-12">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="font-display text-xl text-white">{temple.name}</p>
          {temple.temple_alt_name ? (
            <p className="mt-1 text-sm">{temple.temple_alt_name}</p>
          ) : null}
          {simStore ? (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <Link href="/sim" className="text-white/70 hover:text-white">
                Kho sim phong thủy
              </Link>
              <Link
                href="/phong-thuy/boi-sim"
                className="text-white/70 hover:text-white"
              >
                Bói sim
              </Link>
            </div>
          ) : null}
        </div>
        {temple.address ? (
          <p className="text-xs">{temple.address}</p>
        ) : null}
      </div>
    </footer>
  );
}
