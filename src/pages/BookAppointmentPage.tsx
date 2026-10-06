import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { DentalService, Doctor, Appointment } from '../types';
import { clinicService } from '../services/clinicService';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../data/initialData';

interface BookAppointmentPageProps {
  services: DentalService[];
  doctors: Doctor[];
  initialServiceId?: string;
  initialDoctorId?: string;
  onSuccessNavigate?: (tab: string) => void;
  onCloseModal?: () => void;
  isModal?: boolean;
}

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
];

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  services,
  doctors,
  initialServiceId,
  initialDoctorId,
  onSuccessNavigate,
  onCloseModal,
  isModal = false,
}) => {
  const { user } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || (services[0]?.id ?? '')
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctorId || (doctors[0]?.id ?? '')
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const [appointmentDate, setAppointmentDate] = useState<string>(minDateStr);
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00 AM');
  const [patientName, setPatientName] = useState<string>(user?.full_name || '');
  const [patientEmail, setPatientEmail] = useState<string>(user?.email || '');
  const [patientPhone, setPatientPhone] = useState<string>(user?.phone || '');
  const [notes, setNotes] = useState<string>('');
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchExisting = async () => {
      const data = await clinicService.getAppointments();
      setExistingAppointments(data);
    };
    fetchExisting();
  }, [appointmentDate, selectedDoctorId]);

  const isSlotTaken = (time: string) => {
    return existingAppointments.some(
      (a) =>
        a.doctor_id === selectedDoctorId &&
        a.appointment_date === appointmentDate &&
        a.appointment_time === time &&
        a.status !== 'cancelled'
    );
  };

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedService) {
      setErrorMsg('Please select a dental service.');
      return;
    }
    if (!selectedDoctor) {
      setErrorMsg('Please select a doctor.');
      return;
    }
    if (!appointmentDate) {
      setErrorMsg('Please choose an appointment date.');
      return;
    }
    if (!appointmentTime) {
      setErrorMsg('Please select a preferred time slot.');
      return;
    }
    if (!patientName.trim()) {
      setErrorMsg('Please provide the patient name.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.length < 8) {
      setErrorMsg('Please provide a valid contact number.');
      return;
    }
    if (!patientEmail.trim() || !patientEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (isSlotTaken(appointmentTime)) {
      setErrorMsg(
        `This time slot (${appointmentTime}) on ${appointmentDate} is already booked for ${selectedDoctor.name}. Please select another time.`
      );
      return;
    }

    setIsSubmitting(true);

    const result = await clinicService.bookAppointment({
      user_id: user?.id,
      doctor_id: selectedDoctor.id,
      service_id: selectedService.id,
      doctor_name: selectedDoctor.name,
      service_name: selectedService.title,
      patient_name: patientName.trim(),
      patient_email: patientEmail.trim(),
      patient_phone: patientPhone.trim(),
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      notes: notes.trim(),
      status: 'confirmed',
      payment_status: 'unpaid',
    });

    setIsSubmitting(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.appointment) {
      setBookedAppointment(result.appointment);
    }
  };

  return (
    <div className={`w-full ${isModal ? 'p-0' : 'max-w-5xl mx-auto px-4 sm:px-6 py-10'}`}>
      
      {bookedAppointment ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Booking Reserved
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Your Dental Appointment is Scheduled!
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              A confirmation email and SMS reminder have been recorded for{' '}
              <span className="font-bold text-slate-900">{bookedAppointment.patient_email}</span>.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Booking ID:</span>
              <span className="font-mono font-bold text-blue-700">{bookedAppointment.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Service:</span>
              <span className="font-bold text-slate-900">{bookedAppointment.service_name}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Doctor:</span>
              <span className="font-bold text-slate-900">{bookedAppointment.doctor_name}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Date & Time:</span>
              <span className="font-bold text-slate-900">
                {bookedAppointment.appointment_date} at {bookedAppointment.appointment_time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Patient:</span>
              <span className="font-bold text-slate-900">{bookedAppointment.patient_name}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => {
                if (onSuccessNavigate) {
                  onSuccessNavigate('user-dashboard');
                } else if (onCloseModal) {
                  onCloseModal();
                }
              }}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              View In My Appointments
            </button>
            <button
              onClick={() => {
                setBookedAppointment(null);
                setNotes('');
              }}
              className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-700 p-6 sm:p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100 bg-white/15 px-2.5 py-0.5 rounded-full">
                  Noble Smile Studio Booking
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                  Schedule Your Dental Consultation
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Choose your treatment, select your doctor, and lock in your appointment.
                </p>
              </div>
              {isModal && onCloseModal && (
                <button
                  onClick={onCloseModal}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleBookingSubmit} className="p-6 sm:p-8 space-y-8">
            
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-bold">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Select Service */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                Select Dental Service
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((service) => {
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{service.title}</span>
                        <span className="text-xs font-bold text-blue-700">₹{service.price}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{service.description}</p>
                      <div className="mt-2 text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>{service.duration_minutes} mins duration</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Select Doctor */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                Choose Specialist Doctor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {doctors.map((doctor) => {
                  const isSelected = selectedDoctorId === doctor.id;
                  return (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctorId(doctor.id)}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={doctor.avatar_url || IMAGES.drAnjaliSharma}
                        alt={doctor.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = IMAGES.drAnjaliSharma;
                        }}
                        className="w-12 h-12 rounded-xl object-cover object-top border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{doctor.name}</h4>
                        <p className="text-[11px] text-blue-700 font-semibold truncate">{doctor.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{doctor.experience_years}+ yrs exp</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: Date & Time Picker */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                Select Date & Available Time Slot
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* Date Input */}
                <div className="space-y-1">
                  <span className="text-xs text-slate-700 font-bold">Appointment Date:</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      min={minDateStr}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Noble Smile Studio is open Mon-Sat 9:30AM-8:30PM, Sun 10AM-2PM.
                  </p>
                </div>

                {/* Time Slots Grid */}
                <div className="md:col-span-2 space-y-1">
                  <span className="text-xs text-slate-700 font-bold">Available Time Slots for {selectedDoctor?.name}:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                    {TIME_SLOTS.map((slot) => {
                      const taken = isSlotTaken(slot);
                      const isSelected = appointmentTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={taken}
                          onClick={() => setAppointmentTime(slot)}
                          className={`py-2 px-2 text-xs rounded-xl font-semibold text-center transition-all cursor-pointer ${
                            taken
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'bg-white border border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/40'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: Patient Information */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">4</span>
                Patient Details
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2 text-xs text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Contact Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="084012 33949"
                      className="w-full pl-9 pr-3 py-2 text-xs text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Dental Symptoms or Special Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Sensitivity on upper molar, interested in Invisalign braces, etc."
                  className="w-full p-3 text-xs text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                />
              </div>
            </div>

            {/* Submission CTA */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Instant Confirmation • Free cancellation up to 2 hours before</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto py-3 px-8 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  'Verifying & Reserving Slot...'
                ) : (
                  <>
                    Confirm & Reserve Appointment <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
