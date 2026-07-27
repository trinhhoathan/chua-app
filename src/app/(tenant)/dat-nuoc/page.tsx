import { getCurrentTemple } from '@/lib/tenant';
import { WaterMeritsStory } from '@/components/temple/WaterMeritsStory';

export default async function DatNuocPage() {
  const temple = await getCurrentTemple();
  if (!temple) return null;

  return (
    <main className="pt-14">
      <WaterMeritsStory temple={temple} compact />
    </main>
  );
}
