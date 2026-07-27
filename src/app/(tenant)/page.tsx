import { getCurrentTemple } from '@/lib/tenant';
import { getTempleWaterTransparency } from '@/lib/transparency';
import { TempleHero } from '@/components/temple/TempleHero';
import { TempleStory } from '@/components/temple/TempleStory';
import { AbbottSection } from '@/components/temple/AbbottSection';
import { TimelineSection } from '@/components/temple/TimelineSection';
import { FeaturesSection } from '@/components/temple/FeaturesSection';
import { VisitSection } from '@/components/temple/VisitSection';
import { FengShuiNav } from '@/components/temple/FengShuiNav';
import { WaterDonateSection } from '@/components/temple/WaterDonateSection';
import { WaterTransparencySection } from '@/components/temple/WaterTransparencySection';
import { TempleVideosSection } from '@/components/temple/TempleVideosSection';
import { MapsReviewsSection } from '@/components/temple/MapsReviewsSection';

export default async function HomePage() {
  const temple = await getCurrentTemple();
  if (!temple) return null;

  const transparency = await getTempleWaterTransparency(temple.id);

  return (
    <main className="overflow-x-hidden">
      <TempleHero temple={temple} />
      <TempleStory temple={temple} />
      <AbbottSection temple={temple} />
      <TempleVideosSection temple={temple} />
      <TimelineSection temple={temple} />
      <FeaturesSection temple={temple} />
      <FengShuiNav temple={temple} />
      <WaterTransparencySection temple={temple} data={transparency} />
      <VisitSection temple={temple} />
      <MapsReviewsSection temple={temple} />
      <WaterDonateSection temple={temple} />
    </main>
  );
}
