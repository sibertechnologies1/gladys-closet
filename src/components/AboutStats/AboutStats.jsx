import React from 'react';

export default function AboutStats() {
  const stats = [
    { label: 'Happy Customers', value: '5,000+' },
    { label: 'Curated Products', value: '1,200+' },
    { label: 'Delivery Rate', value: '99.8%' },
    { label: 'Years of Excellence', value: '5+' },
  ];

  return (
    <div className="bg-purple-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-black text-purple-200">
                {stat.value}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-purple-300">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}