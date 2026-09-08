import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function AboutCta() {
  return (
    <div className="bg-gray-50 py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Upgrade Your Style?
            </h2>
            <p className="text-purple-200 text-sm sm:text-base">
              Browse our latest arrivals and experience premium Ghanaian fashion delivered right to your doorstep.
            </p>
            <div className="pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-purple-950 font-bold px-8 py-4 rounded-xl shadow-md hover:bg-purple-50 transition"
              >
                <span>Shop the Collection</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}