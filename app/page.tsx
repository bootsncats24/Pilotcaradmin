import Hero from '@/components/sections/Hero';
import FounderStory from '@/components/sections/FounderStory';
import Features from '@/components/sections/Features';
import UseCases from '@/components/sections/UseCases';
import CommunityRoadmap from '@/components/sections/CommunityRoadmap';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';

export default function Home() {
  return (
    <>
      <Hero />
      <FounderStory />
      <Features />
      <UseCases />
      <CommunityRoadmap />
      <FAQ />
      <CTA />
    </>
  );
}
