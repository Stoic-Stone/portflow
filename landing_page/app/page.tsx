import HeroSection from '@/components/sections/hero';
import StatsSection from '@/components/sections/stats';
import FeaturesSection from '@/components/sections/features';
import AdvantagesSection from '@/components/sections/advantages';
import TestimonialsSection from '@/components/sections/testimonials';
import CtaSection from '@/components/sections/cta';

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <AdvantagesSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}