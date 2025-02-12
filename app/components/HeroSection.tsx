'use client';

import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-[#1FAD92] to-white py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <Image
            src="/awakening-logo.png"
            alt="Awakening Logo"
            width={150}
            height={150}
            className="mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Organisez votre vie</h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-3xl mx-auto">
            Un life planner pour mieux organiser votre vie avec un assistant intelligent pour generer des taches à partir d'objectifs SMART, des cadeaux à s'offrir et une interface agreable et mobile.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-white text-[#1FAD92] font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all"
          >
            Commencer
          </button>
        </div>
      </div>
    </section>
  );
}