import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function AboutFaq() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'Where is Gladys\' Closet located?',
      a: 'We operate primarily online with fast doorstep delivery throughout Accra and nationwide across Ghana. You can also contact our support team for physical pickups.',
    },
    {
      q: 'How long does delivery take within Accra?',
      a: 'Orders placed within Accra are usually delivered within 24 to 48 hours depending on your exact location.',
    },
    {
      q: 'What payment methods do you support?',
      a: 'We accept Mobile Money (MTN, Telecel, AT) and credit/debit cards through our secure Paystack checkout gateway.',
    },
    {
      q: 'Can I exchange an item if it does not fit?',
      a: 'Yes, we allow exchanges within 3 days of delivery as long as the item remains unworn, unwashed, and has its original tags attached.',
    },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
          Frequently Asked Questions
        </span>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">
          Everything You Need to Know
        </h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm"
          >
            <button
              onClick={() => toggleFaq(idx)}
              className="w-full flex justify-between items-center p-5 text-left font-bold text-gray-900 text-sm sm:text-base hover:bg-purple-50/50 transition"
            >
              <span>{faq.q}</span>
              <FiChevronDown
                className={`w-5 h-5 text-purple-600 transition-transform duration-200 ${
                  openIndex === idx ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}