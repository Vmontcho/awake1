'use client';

import { CheckIcon } from '@heroicons/react/24/solid';

interface PricingPlanProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  isPremium?: boolean;
}

const PricingPlan: React.FC<PricingPlanProps> = ({ title, price, period, features, buttonText, isPremium = false }) => (
  <div className={`bg-white p-8 rounded-2xl shadow-lg ${isPremium ? 'border-2 border-[#1FAD92]' : ''}`}>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-4xl font-bold mb-8">
      {price}
      {period && <span className="text-lg font-normal">{period}</span>}
    </p>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <CheckIcon className="w-5 h-5 text-[#1FAD92] mr-2" />
          {feature}
        </li>
      ))}
    </ul>
    <button className="w-full bg-[#1FAD92] text-white font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all">
      {buttonText}
    </button>
  </div>
);

export default function PricingSection() {
  const plans = [
    {
      title: "Free",
      price: "0 Fcfa",
      features: [
        "2 categories",
        "Create unlimited tasks",
        "Notifications"
      ],
      buttonText: "Choisir Free"
    },
    {
      title: "Premium",
      price: "10 000 Fcfa",
      period: "/mois",
      features: [
        "All categories",
        "Create unlimited tasks",
        "Create gifts",
        "Notifications"
      ],
      buttonText: "Choisir Premium",
      isPremium: true
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <PricingPlan key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}