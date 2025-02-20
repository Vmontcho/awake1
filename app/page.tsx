import Image from "next/image";

import HeroSection from './components/HeroSection';
import FeatureSection from './components/FeatureSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1FAD92] to-white">
      <HeroSection />
      <FeatureSection />
    </div>
  );
}
