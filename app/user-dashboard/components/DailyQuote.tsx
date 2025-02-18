'use client';

export default function DailyQuote() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Citation du jour</h2>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 italic">"Le seul moyen de faire du bon travail est d'aimer ce que vous faites."</p>
        <p className="text-xs text-gray-500 mt-2">- Steve Jobs</p>
      </div>
    </div>
  );
}