'use client';

import React from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  availability: 'all' | 'free' | 'premium';
  createdAt: string;
  completedTasks?: number;
  totalTasks?: number;
}

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Catégories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
              </div>
            </div>
            <div className="absolute bottom-3 right-4 text-sm text-gray-500">
              {category.completedTasks || 0}/{category.totalTasks || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;