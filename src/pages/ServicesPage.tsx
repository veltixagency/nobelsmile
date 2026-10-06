import React, { useState } from 'react';
import { DentalService } from '../types';
import { Clock, ArrowRight } from 'lucide-react';

interface ServicesPageProps {
  services: DentalService[];
  openBookingModal: (serviceId?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services, openBookingModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Preventive', 'Cosmetic', 'Specialized', 'Endodontics', 'Surgical'];

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-16 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Clinical Specialties
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Comprehensive Dental Services & Treatments
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          From preventive cleanings to advanced smile reconstructions and digital implants, our clinic is equipped with the latest dental technology for precision and comfort.
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {service.category}
                </span>
                <span className="text-lg font-bold text-blue-700">₹{service.price}</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">{service.description}</p>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 space-y-1 mb-4">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Duration: ~{service.duration_minutes} minutes</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {service.full_description}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => openBookingModal(service.id)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book This Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Dental Care Common Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-bold text-slate-900">How often should I visit Noble Smile Studio for a checkup?</h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              We recommend routine checkups and professional ultrasonic cleaning every 6 months to detect early caries, tartar accumulation, and gum issues before they become painful or costly.
            </p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-bold text-slate-900">Is teeth whitening safe for enamel?</h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              Yes, our in-clinic laser whitening uses dentist-supervised pH-neutral formulas with built-in desensitizers that lift stains without damaging the crystalline enamel matrix.
            </p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-bold text-slate-900">What is the difference between braces and clear aligners?</h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              Clear aligners (like Invisalign) are virtually invisible, custom 3D-printed removable trays with no dietary restrictions, while ceramic braces are fixed aesthetic brackets suitable for complex rotations.
            </p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-bold text-slate-900">Are dental implants permanent?</h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              Dental implants are designed to fuse biologically with your jawbone (osseointegration) and can last a lifetime with proper oral hygiene and regular clinical checkups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
