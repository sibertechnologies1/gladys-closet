import React from 'react';
import contactImg from './contact.jpg';

export default function ContactHero() {
  return (
    <div className="bg-purple-900 text-white py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Text Content */}
        <div className="space-y-4 text-center md:text-left">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">
            Reach Out To Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Get in Touch
          </h1>
          <p className="text-purple-200 text-sm sm:text-base max-w-lg mx-auto md:mx-0">
            Have questions about our collections, orders, or deliveries? We're here to help you look your best.
          </p>
        </div>

        {/* Right: Contact Hero Graphic */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs sm:max-w-sm bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10 shadow-2xl">
            <img
              src={contactImg}
              alt="Contact Support"
              className="w-full h-auto object-contain drop-shadow-md rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}