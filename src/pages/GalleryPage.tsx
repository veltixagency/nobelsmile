import React from 'react';
import { IMAGES } from '../data/initialData';

interface GalleryPageProps {
  openBookingModal: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ openBookingModal }) => {
  const galleryItems = [
    {
      title: 'State-of-the-Art Operatory Suite',
      category: 'Clinic Facilities',
      image: IMAGES.clinicOperatory,
      description: 'Ergonomic treatment chairs with whisper-quiet hydraulic systems and integrated intraoral cameras.',
    },
    {
      title: 'Gentle Clinical Procedures',
      category: 'Patient Care',
      image: IMAGES.dentistTreatment,
      description: 'Microscopic precision dentistry ensuring painless treatments and rapid patient recovery.',
    },
    {
      title: 'Smile Transformation Results',
      category: 'Cosmetic Dentistry',
      image: IMAGES.heroDentalSmile,
      description: 'Restoring natural brightness, alignment, and confidence through tailored cosmetic dental artistry.',
    },
    {
      title: 'Digital Treatment Planning',
      category: 'Technology',
      image: IMAGES.clinicOperatory,
      description: 'High-definition digital radiography and 3D intraoral optical scanning for predictable outcomes.',
    },
  ];

  return (
    <div className="space-y-16 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Visual Tour
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Noble Smile Studio Facility & Smiles Gallery
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Take a look inside our clean, calm medical environment in Sarkhej, Ahmedabad designed to eliminate dental phobia and deliver exceptional aesthetic results.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {galleryItems.map((item, idx) => (
          <div
            key={idx}
            className="group rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="h-72 overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {item.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{item.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Booking CTA */}
      <div className="text-center bg-white border border-slate-200 rounded-3xl p-10 space-y-4 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900">Experience Noble Smile Studio Firsthand</h3>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Schedule an in-person consultation or routine preventive cleanup at our studio in Sarkhej, Ahmedabad.
        </p>
        <button
          onClick={openBookingModal}
          className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          Book Your Consultation
        </button>
      </div>
    </div>
  );
};
