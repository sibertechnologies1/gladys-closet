import React from 'react';
import { FiMapPin } from 'react-icons/fi';

export default function ContactMap() {
  return (
    <div className="bg-gray-50 py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
            Find Us
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            Our Location in Accra
          </h2>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm h-80 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full mb-4">
            <FiMapPin className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Gladys' Closet Boutique</h3>
          <p className="text-gray-500 text-sm max-w-md">
            Located in Accra, Ghana. We deliver directly to your doorstep across the entire Greater Accra region and offer nationwide dispatch.
          </p>
        </div>
      </div>
    </div>
  );
}