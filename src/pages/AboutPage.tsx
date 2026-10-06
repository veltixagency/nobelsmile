import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { IMAGES } from '../data/initialData';

interface AboutPageProps {
  openBookingModal: () => void;
  setCurrentTab: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ openBookingModal }) => {
  return (
    <div className="space-y-16 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50">
      
      {/* Hero / Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Our Heritage & Clinical Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Pioneering Gentle & Compassionate Dental Care
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Founded with a commitment to clinical excellence and painless treatments, Noble Smile Studio has grown into a premier dental care facility trusted by patients and families across Sarkhej, Makarba, and Ahmedabad.
        </p>
      </div>

      {/* Main Story & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
          <img
            src={IMAGES.clinicOperatory}
            alt="Noble Smile Studio modern operatory suite in Sarkhej Ahmedabad"
            className="w-full h-[400px] object-cover"
          />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            A Patient-First Philosophy in Every Treatment
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We understand that visiting the dentist can often evoke anxiety. That is why we engineered Noble Smile Studio from the ground up to offer a calm, tranquil ambiance coupled with advanced pain-management protocols and microscopic precision.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Whether you need a routine checkup, smile makeover, or dental implants, our multidisciplinary team of specialists collaborates to provide customized treatment plans tailored to your lifestyle and budget.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-2xl font-extrabold text-blue-700">14+</span>
              <p className="text-xs text-slate-600 font-semibold mt-1">Years of Dental Excellence</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-2xl font-extrabold text-emerald-700">12k+</span>
              <p className="text-xs text-slate-600 font-semibold mt-1">Healthy Smiles Restored</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-2xl font-extrabold text-blue-700">100%</span>
              <p className="text-xs text-slate-600 font-semibold mt-1">Autoclave Sterilization</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-2xl font-extrabold text-emerald-700">4.9 ★</span>
              <p className="text-xs text-slate-600 font-semibold mt-1">Average Patient Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8 pt-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Why Patients Choose Noble Smile Studio</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Our gold standards in healthcare safety, technology, and patient comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Hospital-Grade Sterilization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We follow rigorous 6-step Class-B autoclave sterilization protocols with vacuum sealed packaging and biological spore testing for each patient visit.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Digital Dentistry Suite</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Equipped with 3D intraoral digital scanners, rotary endodontics, high-frequency painless dental lasers, and low-dose digital panoramic X-rays.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Zero Fear & Gentle Touch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We specialize in anxious patients, offering computerized painless anesthesia, gentle reassurance, and transparent step-by-step guidance.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Ready for a healthier, brighter smile?</h3>
          <p className="text-sm text-blue-100">Schedule your consultation today or visit our studio at Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad.</p>
        </div>
        <button
          onClick={openBookingModal}
          className="py-3.5 px-8 bg-white text-blue-900 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Book Your Appointment
        </button>
      </div>
    </div>
  );
};
