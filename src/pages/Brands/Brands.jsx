import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import BrandHero from '../../components/BrandHero/BrandHero';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });
      
      if (!error && data) {
        setBrands(data);
      }
      setLoading(false);
    }
    loadBrands();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50">
      <header className="w-full bg-white border-b border-slate-200">
        <Navbar />
      </header>

      {/* Full-width Hero Container */}
      <section className="w-full">
        <BrandHero />
      </section>

      {/* Continuous Right-to-Left Logo Marquee */}
      {!loading && brands.length > 0 && (
        <section className="w-full bg-white py-6 border-y border-slate-200 overflow-hidden shadow-sm">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: marquee 25s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="animate-marquee flex items-center space-x-12">
            {/* Duplicate array to create seamless loop */}
            {[...brands, ...brands].map((brand, idx) => (
              <div key={`${brand.id}-${idx}`} className="flex items-center justify-center h-16 w-32 shrink-0 grayscale hover:grayscale-0 transition duration-300">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="max-h-12 max-w-full object-contain" />
                ) : (
                  <span className="font-bold text-slate-700 text-lg">{brand.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Constrained Grid Content (Fixed 3-Column Layout) */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10" id="featured">
          <h2 className="text-3xl font-bold text-gray-900">Our Partner Brands</h2>
          <p className="text-gray-600 mt-2">Explore official brand storefronts available at Gladys' Closet.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading brands...</div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No brands available yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {brands.map((brand) => (
              <div 
                key={brand.id} 
                className="border border-slate-200 rounded-xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition bg-white"
              >
                <div className="w-28 h-28 flex items-center justify-center mb-4">
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-2xl uppercase">
                      {brand.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{brand.name}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {brand.description || 'Official partner brand collection.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="w-full bg-slate-900 text-white mt-auto">
        <Footer />
      </footer>
    </div>
  );
}