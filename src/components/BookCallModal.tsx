import React, { useState } from 'react';
import { X, Phone, User, CheckCircle2, AlertCircle, PhoneCall } from 'lucide-react';
import { clinicService } from '../services/clinicService';

interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookCallModal: React.FC<BookCallModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('Within 15 minutes (Urgent)');
  const [serviceInterest, setServiceInterest] = useState('General Consultation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Please enter your name and contact phone number.');
      return;
    }
    setIsSubmitting(true);
    await clinicService.requestCallback({
      name: name.trim(),
      phone: phone.trim(),
      preferred_time: preferredTime,
      service_interest: serviceInterest,
    });
    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Call Request Scheduled!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our clinical coordinator will call you at <span className="font-semibold text-slate-900">{phone}</span> during your preferred window ({preferredTime}).
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Quick Doctor Callback
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">Request a Dental Call</h3>
              <p className="text-xs text-slate-500">
                Speak directly with our clinical coordinator or on-duty dentist. Free consultation advice.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="084012 33949"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">When Should We Call?</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Within 15 minutes (Urgent)">Within 15 minutes (Urgent)</option>
                  <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                  <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Treatment of Interest</label>
                <select
                  value={serviceInterest}
                  onChange={(e) => setServiceInterest(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General Consultation">General Checkup & Teeth Cleaning</option>
                  <option value="Teeth Whitening">Teeth Whitening</option>
                  <option value="Invisalign & Braces">Invisalign Clear Aligners</option>
                  <option value="Dental Implants">Dental Implants</option>
                  <option value="Root Canal Treatment">Painless Root Canal</option>
                  <option value="Emergency Toothache">Emergency Toothache Relief</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? 'Requesting...' : 'Request Call from Doctor'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
