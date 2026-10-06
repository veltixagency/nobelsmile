import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { ClinicInfo } from '../types';

interface ContactPageProps {
  clinicInfo: ClinicInfo;
}

export const ContactPage: React.FC<ContactPageProps> = ({ clinicInfo }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSent(true);
  };

  return (
    <div className="space-y-16 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Connect With Us
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          We Are Here to Support Your Dental Health
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Have a question about our dental procedures, insurance coverage, or need an urgent dental consultation? Our friendly front-desk team is ready to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Clinic Details</h3>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Address</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{clinicInfo.address}</p>
                  <p className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1.5 w-fit">
                    Plus Code: XGG6+Q8 Ahmedabad, Gujarat
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Phone</h4>
                  <p className="text-slate-600 mt-0.5">{clinicInfo.phone}</p>
                  <p className="text-[11px] text-blue-700 font-bold">Emergency Hotline: {clinicInfo.emergency_phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Email</h4>
                  <p className="text-slate-600 mt-0.5">{clinicInfo.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Working Hours</h4>
                  <p className="text-slate-600 mt-0.5">{clinicInfo.working_hours_weekday}</p>
                  <p className="text-slate-600">{clinicInfo.working_hours_weekend}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 text-xs text-slate-700 space-y-2">
            <h4 className="font-bold text-blue-900">Same-Day Emergency Triage</h4>
            <p className="leading-relaxed">
              Suffering from acute toothache, knocked-out tooth, or broken restoration? Call our emergency helpline directly for priority triage slots.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Send Us an Inquiry</h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill out the form below and our care coordinator will reach out within 2 working hours.
            </p>

            {isSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-800 text-base">Inquiry Dispatched!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you, {name}. Our clinic team has received your message and will call or email you shortly.
                </p>
                <button
                  onClick={() => {
                    setIsSent(false);
                    setMessage('');
                  }}
                  className="mt-2 text-xs font-semibold text-emerald-800 underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full px-3.5 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="084012 33949"
                      className="w-full px-3.5 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Inquiry Topic</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    >
                      <option value="">Select Topic</option>
                      <option value="General Question">General Question</option>
                      <option value="Pricing / Insurance">Pricing & Insurance Coverage</option>
                      <option value="Second Opinion">Second Opinion</option>
                      <option value="Dental Emergency">Dental Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Your Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="How can our dental team assist you today?"
                    className="w-full p-3.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Noble Smile Studio</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Google Map Section */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Studio Location
              </span>
              <span className="text-xs text-slate-300 font-mono">Plus Code: XGG6+Q8</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Visit Noble Smile Studio in Sarkhej</h3>
            <p className="text-xs text-slate-300 mt-0.5">{clinicInfo.address}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="https://maps.google.com/?q=Shop+6,+Aaman+Plaza,+Opp.+Lokhandwala+Party+Plot,+Sarkhej,+Ahmedabad,+Gujarat+380055"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>
            <a
              href="tel:08401233949"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 084012 33949</span>
            </a>
          </div>
        </div>

        <div className="relative w-full h-[400px] bg-slate-100">
          <iframe
            title="Noble Smile Studio Sarkhej Map Location"
            src="https://maps.google.com/maps?q=Shop+6,+Aaman+Plaza,+Opp.+Lokhandwala+Party+Plot,+Sarkhej,+Ahmedabad,+Gujarat+380055&t=&z=16&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};
