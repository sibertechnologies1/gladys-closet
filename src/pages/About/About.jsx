import React from 'react';
import AboutHero from '../../components/AboutHero/AboutHero';
import { FiMapPin, FiPhone, FiMail, FiCheckCircle } from 'react-icons/fi';

export default function About() {
  const highlights = [
    { title: 'Authentic Quality', desc: 'Handpicked, premium fabrics and fashion pieces designed to last.' },
    { title: 'Local & Modern', desc: 'Blending traditional Ghanaian elegance with modern contemporary styles.' },
    { title: 'Fast Delivery', desc: 'Prompt doorstep delivery across Accra and nationwide shipping.' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
     <AboutHero />

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
            Our Story
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
            Fashion Built on Style and Quality
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Gladys' Closet started with a simple vision: to bring high-quality, beautifully designed clothing to fashion enthusiasts in Accra and beyond. We carefully select every item to ensure superior fit, exceptional comfort, and lasting style.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Whether you need vibrant traditional wear, chic daily outfits, or standout pieces for special occasions, we bring you modern collections that suit every wardrobe.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop"
            alt="Gladys Closet Store"
            className="w-full h-80 object-cover"
          />
        </div>
      </div>

      {/* Value Pillars */}
      <div className="bg-gray-50 py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <FiCheckCircle className="w-8 h-8 text-purple-600 mb-4" />
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location & Contact Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-purple-50 rounded-3xl p-8 sm:p-12 border border-purple-100 flex flex-col md:flex-row justify-between gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Visit Our Shop</h2>
            <p className="text-gray-600 text-sm mb-6">Come experience our collections in person or reach out to us directly.</p>
            
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-purple-600 w-5 h-5" />
                <span>Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-purple-600 w-5 h-5" />
                <span>+233 (0) 59 805 215</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-purple-600 w-5 h-5" />
                <span>info@gladyscloset.com</span>
              </div>
            </div>
          </div>

          <a
            href="/shop"
            className="bg-purple-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-purple-700 transition whitespace-nowrap"
          >
            Explore Shop
          </a>
        </div>
      </div>
    </div>
  );
}