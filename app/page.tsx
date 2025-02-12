'use client';

import HeroSection from './components/HeroSection';
import FeatureSection from './components/FeatureSection';
import PricingSection from './components/PricingSection';
import FooterSection from './components/FooterSection';

export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <HeroSection />
      <FeatureSection />
      <section className="bg-[#1FAD92] py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Essayez gratuitement maintenant, créez votre compte</h2>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-white text-[#1FAD92] font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all"
          >
            S'enregistrer
          </button>
        </div>
      </section>
      <PricingSection />
      <FooterSection />
    </main>
  );
}
