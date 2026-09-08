import React from 'react';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

export default function NewArrivals() {
  return (
    <div className="min-h-screen bg-white">
        <Navbar />
      {/* Banner */}
      <div className="bg-purple-50 py-12 text-center">
        <h1 className="text-4xl font-extrabold text-brand-navy">Fresh Drops & New Arrivals</h1>
        <p className="text-gray-600 mt-2">Explore the newest additions added to our store in the last 30 days.</p>
      </div>

      {/* Renders only items added within the last 30 days */}
      <ProductGrid isNewArrivalsOnly={true} />
      <Footer />
    </div>
  );
}