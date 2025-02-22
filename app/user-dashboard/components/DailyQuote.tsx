'use client';

import React, { useState } from 'react';

const DailyQuote: React.FC = () => {
  const [quote] = useState({
    text: 'La vie est un défi à relever, un bonheur à mériter, une aventure à tenter.',
    author: 'Mère Teresa'
  });

  return (
    <div className="mb-8 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Citation du jour</h2>
      <div className="space-y-2">
        <p className="text-gray-600 italic">{quote.text}</p>
        <p className="text-gray-500 text-sm">- {quote.author}</p>
      </div>
    </div>
  );
};

export default DailyQuote;