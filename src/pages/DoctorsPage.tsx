import React from 'react';
import { Doctor } from '../types';
import { Calendar, Clock } from 'lucide-react';
import { IMAGES } from '../data/initialData';

interface DoctorsPageProps {
  doctors: Doctor[];
  openBookingModal: (serviceId?: string, doctorId?: string) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({ doctors, openBookingModal }) => {
  return (
    <div className="space-y-16 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Our Medical Faculty
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Meet Our Team of Dental Specialists
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Our dentists bring years of post-graduate clinical training, gentle communication, and specialized skills to ensure you receive world-class dental care.
        </p>
      </div>

      {/* Doctors In-depth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
          >
            {/* Doctor Photo */}
            <div className="sm:w-2/5 h-72 sm:h-auto bg-slate-100 overflow-hidden shrink-0 border-r border-slate-100">
              <img
                src={doctor.avatar_url || IMAGES.drAnjaliSharma}
                alt={doctor.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = IMAGES.drAnjaliSharma;
                }}
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Doctor Info */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4 sm:w-3/5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {doctor.title}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {doctor.experience_years}+ Yrs Exp
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mt-2">{doctor.name}</h3>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{doctor.specialty}</p>
                <p className="text-[11px] text-slate-500 mt-1 italic">{doctor.qualifications}</p>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                  {doctor.bio}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Hours: {doctor.working_hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Days: {doctor.available_days.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => openBookingModal(undefined, doctor.id)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Schedule Appointment with {doctor.name.split(' ')[1]}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
