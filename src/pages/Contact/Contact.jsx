import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ContactHero from '../../components/ContactHero/ContactHero';
import ContactForm from '../../components/ContactForm/ContactForm';
import ContactMap from '../../components/ContactMap/ContactMap';

export default function Contact() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <ContactHero />
      <ContactForm />
      <ContactMap />
      <Footer />
    </div>
  );
}