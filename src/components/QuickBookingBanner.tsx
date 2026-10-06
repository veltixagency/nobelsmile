import React, { useState } from 'react';
import { User, Phone, Calendar, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { DentalService, Doctor } from '../types';
import { useAuth } from '../context/AuthContext';

interface QuickBookingBannerProps {
  services: DentalService[];
  doctors: Doctor[];
  onBookingSuccess: () => void;
}

export const QuickBookingBanner: React.FC<QuickBookingBannerProps> = ({
  services,
  doctors,
  onBookingSuccess,
}) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [serviceId, setServiceId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    if (!serviceId) {
      setErrorMsg('Please select a dental service.');
      return;
    }
    if (!preferredDate) {
      setErrorMsg('Please select your preferred appointment date.');
      return;
    }

    setIsSubmitting(true);
    const selectedService = services.find((s) => s.id === serviceId) || services[0];

    // Assign recommended specialist doctor
    let assignedDoctor = doctors[0];
    if (selectedService.title.toLowerCase().includes('orthodont')) {
      assignedDoctor = doctors.find((d) => d.title.toLowerCase().includes('ortho')) || doctors[0];
    } else if (selectedService.title.toLowerCase().includes('cosmetic') || selectedService.title.toLowerCase().includes('white')) {
      assignedDoctor = doctors.find((d) => d.title.toLowerCase().includes('cosmetic')) || doctors[0];
    } else if (selectedService.title.toLowerCase().includes('implant')) {
      assignedDoctor = doctors.find((d) => d.title.toLowerCase().includes('implant')) || doctors[0];
    }

    const defaultTime = '10:00 AM';

    const result = await clinicService.bookAppointment({
      user_id: user?.id,
      doctor_id: assignedDoctor.id,
      service_id: selectedService.id,
      doctor_name: assignedDoctor.name,
      service_name: selectedService.title,
      patient_name: fullName.trim(),
      patient_email: user?.email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      patient_phone: phoneNumber.trim(),
      appointment_date: preferredDate,
      appointment_time: defaultTime,
      notes: 'Booked via Quick Schedule banner on Homepage',
      status: 'confirmed',
      payment_status: 'unpaid',
    });

    setIsSubmitting(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg(`Appointment reserved successfully with ${assignedDoctor.name} on ${preferredDate} at ${defaultTime}!`);
      setFullName('');
      setPhoneNumber('');
      setServiceId('');
      setPreferredDate('');
      onBookingSuccess();
    }
  };

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 bg-white border border-slate-200/80 rounded-3xl mx-4 sm:mx-6 lg:mx-auto max-w-6xl shadow-xl my-12">
      {/* Decorative ambient subtle accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative px-6 sm:px-10 lg:px-16">
        
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 mx-auto shadow-xs">
            <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2C8 2 5 4.5 5 8c0 3.5 1.5 7 2.5 10 .8 2.3 2.5 4 4.5 4s3.7-1.7 4.5-4c1-3 2.5-6.5 2.5-10 0-3.5-3-6-7-6z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5" />
            </svg>
          </div>
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-emerald-800 uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Quick Scheduling
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Schedule Your Dental Visit
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto font-normal">
            Take the first step towards a healthier, brighter smile with zero wait times. Reserve your preferred slot online today!
          </p>
        </div>

        {/* Feedback states */}
        {errorMsg && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Quick Booking Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-3 bg-white text-black font-semibold rounded-xl text-xs sm:text-sm placeholder-slate-400 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-800 mb-1">Phone Number (WhatsApp)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="084012 33949"
                  className="w-full pl-10 pr-4 py-3 bg-white text-black font-semibold rounded-xl text-xs sm:text-sm placeholder-slate-400 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
                  required
                />
              </div>
            </div>

            {/* Select Service */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-800 mb-1">Select Dental Service</label>
              <div className="relative">
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-black font-semibold rounded-xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="text-slate-400">
                    Select Service...
                  </option>
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id} className="text-black font-medium">
                      {srv.title} (₹{srv.price})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Preferred Date */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-800 mb-1">Preferred Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  min={minDate}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-black font-semibold rounded-xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all cursor-pointer"
                  required
                />
              </div>
            </div>
          </div>

          {/* Full-width Book Appointment Button - Trust Blue */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Reserving Slot...
                </span>
              ) : (
                'Confirm & Reserve Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
