/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { BookCallModal } from './components/BookCallModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { clinicService } from './services/clinicService';
import { Doctor, DentalService, Testimonial, ClinicInfo, PatientReport } from './types';
import { PublicReportPdfViewerModal } from './components/PublicReportPdfViewerModal';
import {
  INITIAL_DOCTORS,
  INITIAL_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_CLINIC_INFO
} from './data/initialData';
import { PhoneCall, Calendar } from 'lucide-react';

export function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [services, setServices] = useState<DentalService[]>(INITIAL_SERVICES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(INITIAL_CLINIC_INFO);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingPreselectedServiceId, setBookingPreselectedServiceId] = useState<string | undefined>(undefined);
  const [bookingPreselectedDoctorId, setBookingPreselectedDoctorId] = useState<string | undefined>(undefined);

  // Book a Call Modal State
  const [isBookCallModalOpen, setIsBookCallModalOpen] = useState<boolean>(false);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Direct Public Report PDF Viewer (from WhatsApp / Email links)
  const [viewReportModalReport, setViewReportModalReport] = useState<PatientReport | null>(null);

  const refreshAllData = async () => {
    try {
      const [docs, srvs, tests, info] = await Promise.all([
        clinicService.getDoctors(),
        clinicService.getServices(),
        clinicService.getTestimonials(),
        clinicService.getClinicInfo(),
      ]);
      setDoctors(docs);
      setServices(srvs);
      setTestimonials(tests);
      setClinicInfo(info);
    } catch (err) {
      console.warn('Error loading clinic data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();

    // Check if user came from a WhatsApp or Email direct link (e.g. ?viewReport=rep-1)
    const params = new URLSearchParams(window.location.search);
    const reportParam = params.get('viewReport');
    if (reportParam) {
      clinicService.getReports().then((allReps) => {
        const found = allReps.find((r) => r.id === reportParam);
        if (found) {
          setViewReportModalReport(found);
        }
      });
    }
  }, []);

  // Update dynamic document title and meta description based on active tab for SEO
  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'Noble Smile Studio - Modern Dental Care & Aesthetic Clinic Ahmedabad',
      about: 'About Us | Noble Smile Studio - Sarkhej, Ahmedabad',
      services: 'Dental Services & Treatments | Noble Smile Studio Ahmedabad',
      team: 'Meet Our Dental Specialists | Noble Smile Studio',
      gallery: 'Clinic & Smiles Gallery | Noble Smile Studio Ahmedabad',
      contact: 'Contact Us | Noble Smile Studio Sarkhej Ahmedabad',
      'book-appointment': 'Book Dental Appointment Online | Noble Smile Studio',
      'user-dashboard': 'Patient Portal | Noble Smile Studio Appointments & Reports',
      admin: 'Administrative Console & Patient Directory | Noble Smile Studio',
    };
    if (titles[currentTab]) {
      document.title = titles[currentTab];
    }
  }, [currentTab]);

  const handleOpenBookingModal = (serviceId?: string, doctorId?: string) => {
    setBookingPreselectedServiceId(serviceId);
    setBookingPreselectedDoctorId(doctorId);
    setIsBookingModalOpen(true);
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Primary Sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openBookingModal={() => handleOpenBookingModal()}
        openAuthModal={handleOpenAuthModal}
        openBookCallModal={() => setIsBookCallModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            doctors={doctors}
            services={services}
            testimonials={testimonials}
            clinicInfo={clinicInfo}
            setCurrentTab={setCurrentTab}
            openBookingModal={handleOpenBookingModal}
            openBookCallModal={() => setIsBookCallModalOpen(true)}
          />
        )}
        {currentTab === 'about' && (
          <AboutPage
            openBookingModal={() => handleOpenBookingModal()}
            setCurrentTab={setCurrentTab}
          />
        )}
        {currentTab === 'services' && (
          <ServicesPage
            services={services}
            openBookingModal={handleOpenBookingModal}
          />
        )}
        {currentTab === 'team' && (
          <DoctorsPage
            doctors={doctors}
            openBookingModal={handleOpenBookingModal}
          />
        )}
        {currentTab === 'gallery' && (
          <GalleryPage
            openBookingModal={() => handleOpenBookingModal()}
          />
        )}
        {currentTab === 'contact' && (
          <ContactPage
            clinicInfo={clinicInfo}
          />
        )}
        {currentTab === 'book-appointment' && (
          <div className="py-8">
            <BookAppointmentPage
              services={services}
              doctors={doctors}
              initialServiceId={bookingPreselectedServiceId}
              initialDoctorId={bookingPreselectedDoctorId}
              onSuccessNavigate={(tab) => setCurrentTab(tab)}
            />
          </div>
        )}
        {currentTab === 'user-dashboard' && (
          <UserDashboardPage
            openBookingModal={() => handleOpenBookingModal()}
            openAuthModal={() => handleOpenAuthModal('login')}
          />
        )}
        {currentTab === 'admin' && (
          <AdminDashboardPage
            initialDoctors={doctors}
            initialServices={services}
            initialClinicInfo={clinicInfo}
            onRefreshData={refreshAllData}
            openAuthModal={() => handleOpenAuthModal('login')}
          />
        )}
      </main>

      {/* Primary Footer */}
      <Footer
        setCurrentTab={setCurrentTab}
        openBookingModal={() => handleOpenBookingModal()}
      />

      {/* Mobile Bottom Fixed Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <button
          onClick={() => setIsBookCallModalOpen(true)}
          className="flex-1 py-3 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          <PhoneCall className="w-4 h-4 text-emerald-600" />
          <span>Call Clinic</span>
        </button>
        <button
          onClick={() => handleOpenBookingModal()}
          className="flex-1 py-3 px-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Now</span>
        </button>
      </div>

      {/* Appointment Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl my-6">
            <BookAppointmentPage
              services={services}
              doctors={doctors}
              initialServiceId={bookingPreselectedServiceId}
              initialDoctorId={bookingPreselectedDoctorId}
              onCloseModal={() => setIsBookingModalOpen(false)}
              onSuccessNavigate={(tab) => {
                setIsBookingModalOpen(false);
                setCurrentTab(tab);
              }}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Book a Call Modal */}
      <BookCallModal
        isOpen={isBookCallModalOpen}
        onClose={() => setIsBookCallModalOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          refreshAllData();
        }}
      />

      {/* Public Patient Report PDF Viewer Modal (Triggered by WhatsApp / Email link) */}
      {viewReportModalReport && (
        <PublicReportPdfViewerModal
          isOpen={Boolean(viewReportModalReport)}
          report={viewReportModalReport}
          onClose={() => {
            setViewReportModalReport(null);
            // Clean up the URL search param without reloading
            const url = new URL(window.location.href);
            url.searchParams.delete('viewReport');
            window.history.replaceState({}, '', url.toString());
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
