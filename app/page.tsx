import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import UseCases from '@/components/sections/UseCases';
import SocialProof from '@/components/sections/SocialProof';
import Testimonials from '@/components/sections/Testimonials';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <UseCases />
      <SocialProof />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
