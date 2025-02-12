'use client';

import Image from 'next/image';

interface FeatureProps {
  title: string;
  description: string;
  imagePath: string;
  buttonText: string;
  imageAlt: string;
  reversed?: boolean;
}

const Feature: React.FC<FeatureProps> = ({ title, description, imagePath, buttonText, imageAlt, reversed = false }) => (
  <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 py-20`}>
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{title}</h2>
      <p className="text-lg text-gray-600 mb-8">{description}</p>
      <button
        onClick={() => window.location.href = '/login'}
        className="bg-[#1FAD92] text-white font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all"
      >
        {buttonText}
      </button>
    </div>
    <div className="flex-1">
      <Image
        src={imagePath}
        alt={imageAlt}
        width={500}
        height={400}
        priority
        loading="eager"
        className="rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
        aria-hidden="false"
      />
    </div>
  </div>
);

export default function FeatureSection() {
  const features = [
    {
      title: "Ecrivez votre objectif, vos taches SMART sont générés",
      description: "Transformez vos objectifs en actions concrètes avec notre assistant intelligent qui génère des tâches SMART personnalisées pour votre réussite.",
      imagePath: "/AI task assistant.webp",
      buttonText: "Essayer maintenant",
      imageAlt: "Smart Tasks Feature"
    },
    {
      title: "Des paroles quotidiennes pour vous encourager",
      description: "Recevez des messages inspirants et motivants chaque jour pour maintenir votre élan et rester concentré sur vos objectifs.",
      imagePath: "/daily-quote.webp",
      buttonText: "Essayer",
      imageAlt: "Daily Quotes Feature",
      reversed: true
    },
    {
      title: "Des cadeaux pour vous encourager",
      description: "Célébrez vos succès avec notre système de récompenses personnalisées qui vous motive à atteindre vos objectifs.",
      imagePath: "/gift-tab.webp",
      buttonText: "Je me connecte",
      imageAlt: "Rewards Feature"
    }
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4">
      {features.map((feature, index) => (
        <Feature key={index} {...feature} />
      ))}
    </div>
  );
}