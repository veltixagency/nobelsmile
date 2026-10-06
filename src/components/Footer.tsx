import React, { useState } from 'react';
import { Facebook, Instagram, Linkedin, Youtube, ShieldCheck, MapPin, Phone, Mail, Clock, ExternalLink, Download, FileCode } from 'lucide-react';
import { NobleLogo } from './NobleLogo';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  openBookingModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, openBookingModal }) => {
  const [modalInfo, setModalInfo] = useState<{ title: string; content: string } | null>(null);

  const navigateTo = (tabId: string) => {
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-200 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 lg:col-span-1 pr-2">
            <div
              onClick={() => navigateTo('home')}
              className="cursor-pointer group w-fit"
            >
              <NobleLogo variant="dark" size="md" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
              Providing gentle, advanced, and aesthetic dental healthcare in Sarkhej, Ahmedabad. Combining clinical precision, painless techniques, and modern digital dentistry.
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="#linkedin"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-600 transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4 text-emerald-400">Navigation</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-medium">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  About the Clinic
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Treatments & Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('team')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Specialist Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('gallery')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Clinic & Smiles Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Contact & Location
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4 text-emerald-400">Dental Specialties</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-medium">
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  General Checkup & Polishing
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Cosmetic Smile Designing
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Laser Teeth Whitening
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Orthodontics & Clear Aligners
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Microscopic Root Canal Therapy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('services')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Guided Titanium Dental Implants
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="space-y-3 text-xs text-slate-300">
            <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4 text-emerald-400">Clinic Hours & Info</h3>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-medium">Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad, Gujarat 380055</span>
                <span className="inline-block mt-1 text-[11px] text-emerald-400 font-mono font-semibold">
                  Plus Code: XGG6+Q8 Ahmedabad, Gujarat
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <a
                href="tel:08401233949"
                className="hover:text-emerald-400 font-bold transition-colors"
                title="Call Noble Smile Studio"
              >
                084012 33949
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <a href="mailto:contact@noblesmilestudio.com" className="hover:text-sky-300 transition-colors">
                contact@noblesmilestudio.com
              </a>
            </div>
            <div className="flex items-start gap-2.5 pt-1">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p>Mon - Sat: 9:30 AM - 8:30 PM</p>
                <p className="text-slate-400">Sunday: 10:00 AM - 2:00 PM (By Appt)</p>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={openBookingModal}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center"
              >
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Noble Smile Studio. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href="/noble-smile-studio-final.zip"
              download="noble-smile-studio-final.zip"
              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-[11px]"
              title="Download full project source code as ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Source (.ZIP)</span>
            </a>
            <button
              onClick={() => setModalInfo({
                title: 'Noble Smile Studio Privacy Policy',
                content: 'Your clinical records, appointment histories, radiographs, and contact information are strictly confidential and stored securely in accordance with healthcare standards and Indian Medical Guidelines.'
              })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setModalInfo({
                title: 'Noble Smile Studio Terms of Service',
                content: 'Appointments can be booked online, rescheduled, or cancelled with ease. Our dental specialists provide transparent treatment planning with prior consultation.'
              })}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigateTo('admin')}
              className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-400 font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Staff Login
            </button>
          </div>
        </div>
      </div>

      {/* Info modal */}
      {modalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl p-6 max-w-md w-full space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
            <h4 className="font-bold text-sm text-emerald-400">{modalInfo.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{modalInfo.content}</p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalInfo(null)}
                className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
