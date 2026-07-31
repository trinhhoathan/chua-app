import { getCurrentTemple } from '@/lib/tenant';
import { getTempleWaterTransparency } from '@/lib/transparency';
import { getUpcomingTempleEvents } from '@/lib/temple-events';
import { getPublicChantingSchedules } from '@/app/actions/chanting';
import { TempleHero } from '@/components/temple/TempleHero';
import { TempleStory } from '@/components/temple/TempleStory';
import { AbbottSection } from '@/components/temple/AbbottSection';
import { TimelineSection } from '@/components/temple/TimelineSection';
import { FeaturesSection } from '@/components/temple/FeaturesSection';
import { ExtraSections } from '@/components/temple/ExtraSections';
import { EventsSection } from '@/components/temple/EventsSection';
import { LiveChantingSection } from '@/components/temple/LiveChantingSection';
import { DevoteeJoinSection } from '@/components/temple/DevoteeJoinSection';
import { FengShuiNav } from '@/components/temple/FengShuiNav';
import { PhatHocNav } from '@/components/temple/PhatHocNav';
import { WaterMeritsStory } from '@/components/temple/WaterMeritsStory';
import { WaterTransparencySection } from '@/components/temple/WaterTransparencySection';
import { TempleVideosSection } from '@/components/temple/TempleVideosSection';
import { MapsReviewsSection } from '@/components/temple/MapsReviewsSection';
import { GallerySection } from '@/components/temple/GallerySection';

export default async function HomePage() {
  const temple = await getCurrentTemple();
  if (!temple) return null;

  const [transparency, events, chanting] = await Promise.all([
    getTempleWaterTransparency(temple.id),
    getUpcomingTempleEvents(temple.id),
    getPublicChantingSchedules(temple.id, 'home'),
  ]);

  return (
    <main className="overflow-x-hidden">
      <TempleHero temple={temple} />
      <EventsSection temple={temple} events={events} />
      <LiveChantingSection
        templeId={temple.id}
        templeName={temple.name}
        primaryColor={temple.primary_color}
        schedules={chanting}
        scope="home"
      />
      <AbbottSection temple={temple} />
      <TempleStory temple={temple} />
      <TimelineSection temple={temple} />
      <FeaturesSection temple={temple} />
      <ExtraSections temple={temple} />
      <TempleVideosSection temple={temple} />
      <GallerySection temple={temple} />
      <MapsReviewsSection temple={temple} />
      <FengShuiNav temple={temple} />
      <PhatHocNav temple={temple} />
      <WaterMeritsStory temple={temple} />
      <WaterTransparencySection temple={temple} data={transparency} />
      <DevoteeJoinSection temple={temple} />
    </main>
  );
}
