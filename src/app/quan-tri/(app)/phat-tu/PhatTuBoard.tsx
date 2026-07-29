'use client';

import { useState } from 'react';
import type { Devotee } from '@/types/database';
import { DevoteeForm } from './DevoteeForm';
import { DevoteesTable } from './DevoteesTable';

export function PhatTuBoard({
  templeId,
  devotees,
}: {
  templeId: string;
  devotees: Devotee[];
}) {
  const [editing, setEditing] = useState<Devotee | null>(null);

  return (
    <div className="mt-8 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-8">
      <DevoteeForm
        templeId={templeId}
        editing={editing}
        onCancelEdit={() => setEditing(null)}
      />
      <DevoteesTable
        templeId={templeId}
        devotees={devotees}
        onEdit={(d) => setEditing(d)}
      />
    </div>
  );
}
