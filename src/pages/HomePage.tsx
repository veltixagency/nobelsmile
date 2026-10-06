import React, { useState } from 'react';
import {
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Shield,
  Sparkles,
  Smile,
  Activity,
  Layers,
  Facebook,
  Linkedin,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Play,
  PhoneCall,
  CalendarCheck
} from 'lucide-react';
import { Doctor, DentalService, Testimonial, ClinicInfo } from '../types';
import { IMAGES } from '../data/initialData';
import { QuickBookingBanner } from '../components/QuickBookingBanner';
import { SmileSlider } from '../components/SmileSlider';

interface HomePageProps {
  doctors: Doctor[];
  services: DentalService[];
  testimonials: Testimonial[];
  clinicInfo: ClinicInfo;
  setCurrentTab: (tab: string) => void;
  openBookingModal: (serviceId?: string, doctorId?: string) => void;
  openBookCallModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  doctors,
  services,
  testimonials,
  clinicInfo,
  setCurrentTab,
  openBookingModal,
  openBookCallModal,
}) => {
  const heroSlides = [
    {
      title: 'Family-Friendly\nDental Care',
      subtitle: 'Permanent natural-looking solutions to replace missing teeth and restore confident, healthy smiles.',
      chip: 'Dental Checkup',
      tag: 'General Dentistry',
      rating: '4.9',
    },
    {
      title: 'Precision Laser\nTeeth Whitening',
      subtitle: 'Lighten enamel up to 8 shades in a single comfortable 45-minute appointment with zero tooth sensitivity.',
      chip: 'Teeth Cleaning',
      tag: 'Cosmetic Dentistry',
      rating: '5.0',
    },
    {
      title: 'Guided Titanium\nDental Implants',
      subtitle: 'State-of-the-art 3D CBCT guided permanent tooth replacements that feel, chew, and look 100% natural.',
      chip: 'Tooth Filling',
      tag: 'Oral Implantology',
      rating: '4.9',
    },
    {
      title: 'Invisible Clear\nDental Aligners',
      subtitle: 'Custom 3D-scanned digital orthodontic aligners for teeth straightening without unsightly metal brackets.',
      chip: 'Retainers',
      tag: 'Orthodontics',
      rating: '4.8',
    },
    {
      title: 'Painless Single-Sitting\nRoot Canal Care',
      subtitle: 'Microscopic rotary endodontics performed gently to eradicate tooth pain and save your natural roots.',
      chip: 'Gum Treatment',
      tag: 'Endodontics',
      rating: '4.9',
    },
    {
      title: 'Aesthetic Porcelain\nSmile Makeovers',
      subtitle: 'Hand-sculpted ceramic veneers and artistic cosmetic bonding for symmetry, balance, and radiant brightness.',
      chip: 'Dental Checkup',
      tag: 'Smile Aesthetics',
      rating: '5.0',
    },
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedServiceChip, setSelectedServiceChip] = useState('Dental Checkup');
  const currentSlide = heroSlides[currentSlideIndex];

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const servicePills = [
    'Dental Checkup',
    'Teeth Cleaning',
    'Tooth Filling',
    'Gum Treatment',
    'Retainers',
  ];

  const handleChipClick = (chip: string) => {
    setSelectedServiceChip(chip);
    const foundIndex = heroSlides.findIndex((s) => s.chip === chip);
    if (foundIndex !== -1) {
      setCurrentSlideIndex(foundIndex);
    }
  };

  const getServiceIcon = (index: number) => {
    switch (index % 6) {
      case 0:
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
            <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8 2 5 4.5 5 8c0 3.5 1.5 7 2.5 10 .8 2.3 2.5 4 4.5 4s3.7-1.7 4.5-4c1-3 2.5-6.5 2.5-10 0-3.5-3-6-7-6z" />
            </svg>
          </div>
        );
      case 1:
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
            <Smile className="w-6 h-6" />
          </div>
        );
      case 2:
        return (
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
        );
      case 3:
        return (
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
            <div className="font-mono font-bold text-xs">align</div>
          </div>
        );
      case 4:
        return (
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
        );
      case 5:
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-16 pb-20 bg-slate-50 text-slate-900">
      
      {/* ========================================================
          1. HERO SECTION - Redesigned in Trust Blue & Sage Green
          ======================================================== */}
      <section className="relative px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative mx-auto max-w-[1440px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl min-h-[580px] sm:min-h-[620px] lg:min-h-[700px] flex flex-col justify-between bg-white">
          
          {/* Background Photography with light, crisp overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={IMAGES.heroDentalSmile}
              alt="Happy smiling patient at modern dental clinic"
              className="w-full h-full object-cover object-center filter brightness-95"
            />
            {/* Elegant gradient scrim: clean white to soft translucent to ensure text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/40" />
          </div>

          {/* Top subtle notification */}
          <div className="relative z-10 px-6 sm:px-12 pt-6 sm:pt-8 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-blue-900 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Priority Patient Slots Available Today</span>
            </div>
            <button
              onClick={openBookCallModal}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-blue-700 bg-white/90 hover:bg-white px-3.5 py-1.5 rounded-full backdrop-blur-md border border-slate-200 cursor-pointer shadow-2xs transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Call Request</span>
            </button>
          </div>

          {/* Center Main Stage Content */}
          <div className="relative z-10 px-6 sm:px-12 lg:px-16 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            
            {/* Left Typography & Primary Button */}
            <div className="lg:col-span-8 space-y-5 max-w-2xl">
              
              <div className="inline-block">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {currentSlide.tag}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08] whitespace-pre-line">
                {currentSlide.title}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed font-normal max-w-xl">
                {currentSlide.subtitle}
              </p>

              {/* Primary Call to Action */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => openBookingModal()}
                  className="group relative inline-flex items-center gap-3 pl-6 pr-3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-blue-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Book an Appointment</span>
                  <div className="w-8 h-8 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-md group-hover:rotate-45 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={openBookCallModal}
                  className="px-5 py-3 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-full shadow-xs cursor-pointer transition-colors"
                >
                  Request Doctor Call
                </button>
              </div>

              {/* Floating Surgeon Microscope Card */}
              <div className="pt-4 sm:pt-6">
                <div className="inline-flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg max-w-sm">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                    <img
                      src={IMAGES.dentistTreatment}
                      alt="Qualified dentist treating patient with gentle care"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-900/20 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="min-w-0 pr-1">
                    <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      Modern Pain-Free Dental Technology
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Star className="w-2.5 h-2.5 fill-current text-amber-500" />
                        <span>{currentSlide.rating} Rating</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">1,200+ Verified Reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Procedures */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 lg:text-right">
                Featured Clinical Procedures
              </span>
              <div className="flex flex-wrap lg:justify-end gap-2 max-w-md">
                {servicePills.map((pill) => {
                  const isActive = selectedServiceChip === pill;
                  return (
                    <button
                      key={pill}
                      onClick={() => handleChipClick(pill)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md font-bold'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {pill}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-right hidden lg:block">
                <button
                  onClick={() => openBookingModal(undefined, doctors[0]?.id)}
                  className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Select {selectedServiceChip}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar inside the Hero Frame */}
          <div className="relative z-10 px-6 sm:px-12 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800 hidden sm:inline">Advanced Care, Gentle Touch</span>
              <div className="flex items-center gap-1 text-emerald-600">
                <span className="w-1 h-3 bg-emerald-600 rounded-full animate-pulse" />
                <span className="w-1 h-5 bg-blue-600 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-emerald-600 rounded-full animate-pulse delay-150" />
                <span className="w-1 h-4 bg-blue-600 rounded-full animate-pulse delay-100" />
              </div>
            </div>

            {/* Slide Navigator */}
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-800">
              <button
                onClick={handlePrevSlide}
                className="hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
                0{currentSlideIndex + 1} / 0{heroSlides.length}
              </span>
              <button
                onClick={handleNextSlide}
                className="hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
                aria-label="Next slide"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="text-[11px]">Scroll to explore</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Sub-hero process ribbon */}
        <div className="mt-4 mx-auto max-w-[1440px] px-5 py-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[700px] text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-slate-900 font-bold">1. Smile Assessment & Scan</span>
            </div>
            <div className="text-slate-300 font-mono text-xs">────────</div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-slate-900 font-bold">2. Digital Care Planning</span>
            </div>
            <div className="text-slate-300 font-mono text-xs">────────</div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-slate-900 font-bold">3. Gentle Treatment Process</span>
            </div>
            <div className="text-slate-300 font-mono text-xs">────────</div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-slate-900 font-bold">4. Healthy Lifetime Smile</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          BEFORE & AFTER TRANSFORMATION SLIDER
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SmileSlider />
      </section>

      {/* ========================================================
          FEATURE HIGHLIGHTS - 4 Clean Cards
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Expert Dentists</h3>
            <p className="text-xs text-slate-500 mt-1">Skilled MDS specialists with 10+ yrs exp</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Latest Technology</h3>
            <p className="text-xs text-slate-500 mt-1">3D Scanners, lasers & painless anesthesia</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Transparent Pricing</h3>
            <p className="text-xs text-slate-500 mt-1">Clear treatment quotes with no hidden charges</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 group-hover:scale-105 transition-transform">
              <Smile className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Comfortable Clinic</h3>
            <p className="text-xs text-slate-500 mt-1">Relaxing, hygienic & stress-free environment</p>
          </div>
        </div>
      </section>

      {/* ========================================================
          ABOUT US SECTION
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              About Our Clinic
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Better Dental Care <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-emerald-700">
                Starts with Compassion & Trust
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Noble Smile Studio is a state-of-the-art dental clinic in Sarkhej, Ahmedabad, dedicated to providing gentle, high-quality, and personalized aesthetic dental care. We specialize in digital smile makeovers, painless root canals, clear aligners, and dental implants with uncompromising hygiene standards.
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Experienced and caring dental faculty</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>State-of-the-art diagnostic equipment and digital X-rays</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Personalized treatment plans tailored to your budget</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Strict Class-B autoclave medical sterilization</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setCurrentTab('about')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Learn More About Us
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
              <img
                src={IMAGES.clinicOperatory}
                alt="Modern state of the art dental clinic operatory room"
                className="w-full h-[380px] sm:h-[440px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SERVICES SECTION
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Our Dental Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Dental Care
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From preventive cleanings to advanced smile reconstructions and digital implants, our clinic is equipped for comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.id}
              onClick={() => openBookingModal(service.id)}
              className="group p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {getServiceIcon(index)}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {service.title}
                  </h3>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                    ₹{service.price}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-normal">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">~{service.duration_minutes} mins</span>
                <span className="text-xs font-bold text-blue-700 group-hover:text-blue-800 flex items-center gap-1 transition-colors">
                  Book Treatment <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          WHY CHOOSE US
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
              <img
                src={IMAGES.dentistTreatment}
                alt="Gentle dentist consulting with patient"
                className="w-full h-[380px] sm:h-[420px] object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Why Choose Noble Smile Studio
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your Smile & Health Is Our Highest Priority
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We combine years of clinical experience, gentle pain-free techniques, and state-of-the-art diagnostics to deliver dental care that lasts.
            </p>

            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Specialized MDS Faculty with Hospital Experience</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Low-Radiation Digital Radiographs & 3D Scanning</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Individualized Patient Treatment & Maintenance Plans</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Affordable, Transparent Treatment Pricing</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Flexible Morning, Evening, and Weekend Appointments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SCHEDULE BANNER
          ======================================================== */}
      <QuickBookingBanner
        services={services}
        doctors={doctors}
        onBookingSuccess={() => setCurrentTab('user-dashboard')}
      />

      {/* ========================================================
          OUR TEAM
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Our Medical Faculty
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Dental Specialists
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Our experienced and caring team is here to provide the highest standard of care for your smile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 text-center flex flex-col justify-between group"
            >
              <div>
                <div className="h-64 overflow-hidden bg-slate-100">
                  <img
                    src={doctor.avatar_url || IMAGES.drAnjaliSharma}
                    alt={doctor.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = IMAGES.drAnjaliSharma;
                    }}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-base">{doctor.name}</h3>
                  <p className="text-xs font-bold text-blue-700 mt-1">{doctor.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{doctor.specialty}</p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-0">
                <div className="flex items-center justify-center gap-3 pt-2 pb-4 text-slate-500 border-t border-slate-100">
                  <a href="#facebook" aria-label="Facebook" className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                  <a href="#linkedin" aria-label="LinkedIn" className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-colors">
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                  <a href={`mailto:${doctor.email}`} aria-label="Email" className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
                <button
                  onClick={() => openBookingModal(undefined, doctor.id)}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Book with {doctor.name.split(' ')[1]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          TESTIMONIALS
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Patient Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Our Patients Say
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Read authentic feedback from patients who entrusted their smile to Noble Smile Studio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.patient_name}</p>
                  <p className="text-[11px] text-blue-700 font-semibold">{item.treatment}</p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Verified Patient
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          GET IN TOUCH & CLINIC LOCATION
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Visit Noble Smile Studio
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Get In Touch</h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Located conveniently at Aaman Plaza opposite Lokhandwala Party Plot in Sarkhej, Ahmedabad. Walk in or schedule your visit.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Studio Address</h4>
                  <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-medium leading-relaxed">
                    Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad, Gujarat 380055
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Plus Code: XGG6+Q8 Ahmedabad
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Phone & WhatsApp</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href="tel:08401233949"
                      className="text-xs sm:text-sm font-bold text-blue-700 hover:underline"
                    >
                      084012 33949
                    </a>
                    <span className="text-[11px] text-slate-400">/</span>
                    <a
                      href="https://api.whatsapp.com/send?phone=918401233949&text=Hello%20Noble%20Smile%20Studio%2C%20I%20would%20like%20to%20inquire%20about%20a%20dental%20appointment."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      WhatsApp Chat
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Email Support</h4>
                  <a
                    href="mailto:contact@noblesmilestudio.com"
                    className="text-xs sm:text-sm text-slate-700 hover:text-blue-700 mt-0.5 block"
                  >
                    contact@noblesmilestudio.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Studio Timings</h4>
                  <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-medium">Mon - Sat: 9:30 AM - 8:30 PM</p>
                  <p className="text-xs sm:text-sm text-slate-500">Sunday: 10:00 AM - 2:00 PM (By Appointment)</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <a
                href="https://maps.google.com/?q=Shop+6,+Aaman+Plaza,+Opp.+Lokhandwala+Party+Plot,+Sarkhej,+Ahmedabad,+Gujarat+380055"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </a>
              <a
                href="tel:08401233949"
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 084012 33949</span>
              </a>
            </div>
          </div>

          {/* Interactive Google Maps Card */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Noble Smile Studio Location</h4>
                  <p className="text-[10px] text-slate-300">Sarkhej, Ahmedabad • Plus Code: XGG6+Q8</p>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Shop+6,+Aaman+Plaza,+Opp.+Lokhandwala+Party+Plot,+Sarkhej,+Ahmedabad,+Gujarat+380055"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Get Directions</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Embedded interactive Google Map iframe */}
            <div className="relative flex-1 min-h-[340px] bg-slate-100">
              <iframe
                title="Noble Smile Studio Sarkhej Ahmedabad Map"
                src="https://maps.google.com/maps?q=Shop+6,+Aaman+Plaza,+Opp.+Lokhandwala+Party+Plot,+Sarkhej,+Ahmedabad,+Gujarat+380055&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full min-h-[340px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Bottom location info ribbon */}
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-extrabold text-slate-900">Noble Smile Studio</p>
                  <p className="text-slate-600 text-[11px]">Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej</p>
                </div>
                <a
                  href="tel:08401233949"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shrink-0 flex items-center gap-1 shadow-xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>084012 33949</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
