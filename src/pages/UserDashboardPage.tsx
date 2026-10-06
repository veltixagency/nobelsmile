import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Edit2,
  FileText,
  Download,
  Paperclip,
  Eye,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Appointment, PatientReport } from '../types';
import { clinicService } from '../services/clinicService';

import { downloadReportPdf } from '../utils/pdfGenerator';

interface UserDashboardPageProps {
  openBookingModal: () => void;
  openAuthModal: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  openBookingModal,
  openAuthModal,
}) => {
  const { user, updateProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Cancel modal state
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // Report Preview Modal state
  const [previewReport, setPreviewReport] = useState<PatientReport | null>(null);

  const fetchUserAppointments = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const [apts, reps] = await Promise.all([
      clinicService.getAppointmentsByUser(user.phone || user.email || user.id, user.phone),
      clinicService.getReportsByPatient(user.phone || user.email || user.id, user.phone),
    ]);
    setAppointments(apts);
    setReports(reps);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserAppointments();
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: editName,
      phone: editPhone,
    });
    setIsEditingProfile(false);
    setProfileMsg('Profile details updated successfully!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    await clinicService.cancelAppointment(appointmentToCancel.id);
    setAppointmentToCancel(null);
    fetchUserAppointments();
  };

  const handleDownloadReport = (rep: PatientReport) => {
    // Generate and download the official clinical vector PDF
    downloadReportPdf(rep);
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <Phone className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in with Mobile Number</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Log in with your registered phone number & password to see your treatment history and download your dental reports & X-Ray scans.
          </p>
        </div>
        <button
          onClick={openAuthModal}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" />
          <span>Sign In / Sign Up with Mobile</span>
        </button>
      </div>
    );
  }

  const upcoming = appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'completed');
  const past = appointments.filter((a) => a.status === 'cancelled' || a.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10 bg-slate-50 min-h-screen">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Patient Dental Records Portal</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified Patient
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome, {user.full_name}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Registered Mobile: <span className="font-bold text-slate-900">{user.phone || 'Not added'}</span> • Access diagnostic reports & dental visits.
          </p>
        </div>
        <button
          onClick={openBookingModal}
          className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {profileMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{profileMsg}</span>
        </div>
      )}

      {/* MY DIAGNOSTIC REPORTS & SCANS (DOWNLOAD SECTION) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                My Diagnostic Reports & X-Rays ({reports.length})
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Direct access to panoramic radiographs, dental scan files, prescriptions, and treatment plans released for your account.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl w-fit">
            Account Phone: <span className="text-blue-700 font-bold">{user.phone || user.email}</span>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">No diagnostic reports released yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once Dr. Sharma or your specialist concludes your consultation or scan, your report will be dispatched to your WhatsApp/email and will instantly appear here for download.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                      {rep.report_type}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {rep.sent_at || (rep.created_at ? new Date(rep.created_at).toLocaleDateString() : 'Recent')}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {rep.report_title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium">
                    Consulting Doctor: <span className="text-slate-900 font-bold">{rep.doctor_name}</span>
                  </p>

                  {rep.notes && (
                    <div className="p-2.5 rounded-xl bg-white text-[11px] text-slate-700 border border-slate-200">
                      <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider mb-0.5">Doctor Advice:</span>
                      <p className="italic">"{rep.notes}"</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-mono text-slate-800 font-semibold truncate max-w-[220px]" title={rep.file_name}>
                      {rep.file_name}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{rep.file_size || 'PDF'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Delivered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewReport(rep)}
                      className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      title="View report details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadReport(rep)}
                      className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      title="Download report file to your computer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Patient Profile Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Personal Details</h3>
              <button
                onClick={() => {
                  setEditName(user.full_name);
                  setEditPhone(user.phone);
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            ) : (
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Patient Name</span>
                    <span className="font-bold text-slate-900">{user.full_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Mobile Phone (Login)</span>
                    <span className="font-bold text-slate-900">{user.phone || 'No phone added'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Email Address</span>
                    <span className="font-semibold text-slate-900 truncate block">{user.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-slate-700 space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Diagnostic Confidentiality</span>
            </h4>
            <p className="leading-relaxed text-[11px] text-slate-600">
              All diagnostic scans and prescriptions are digitally signed by our dental specialists and archived under strict patient privacy standards.
            </p>
          </div>
        </div>

        {/* Right Column: Appointments List */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Upcoming Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Appointments ({upcoming.length})</span>
            </h3>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading appointments...</div>
            ) : upcoming.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-600">You currently have no upcoming dental visits.</p>
                <button
                  onClick={openBookingModal}
                  className="py-2 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-blue-200"
                >
                  Schedule Your Visit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{apt.service_name}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">Doctor: <span className="font-bold text-slate-900">{apt.doctor_name}</span></p>
                      <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          {apt.appointment_date}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-blue-700">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {apt.appointment_time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setAppointmentToCancel(apt)}
                        className="py-1.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / History Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Past Appointments History</span>
            </h3>
            {past.length === 0 ? (
              <p className="text-xs text-slate-400">No past appointment history.</p>
            ) : (
              <div className="space-y-2">
                {past.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{apt.service_name}</p>
                      <p className="text-slate-600">
                        {apt.doctor_name} • {apt.appointment_date} at {apt.appointment_time}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        apt.status === 'completed'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Diagnostic Report Document</h3>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  {previewReport.report_type}
                </span>
                <h4 className="font-extrabold text-base text-slate-900">{previewReport.report_title}</h4>
                <p className="text-slate-700">Patient: <span className="font-bold text-slate-900">{previewReport.patient_name}</span> ({previewReport.patient_phone})</p>
                <p className="text-slate-700">Consulting Specialist: <span className="font-bold text-slate-900">{previewReport.doctor_name}</span></p>
                <p className="text-slate-500 text-[11px]">Date Issued: {previewReport.sent_at || previewReport.created_at}</p>
              </div>

              {previewReport.notes && (
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-900">Doctor Clinical Diagnosis & Advice:</h5>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-medium">
                    {previewReport.notes}
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono text-slate-800 font-semibold truncate">{previewReport.file_name}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{previewReport.file_size || 'PDF Document'}</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setPreviewReport(null)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadReport(previewReport)}
                  className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center border border-slate-200 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Cancel Appointment?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your consultation for{' '}
              <span className="font-bold text-slate-900">{appointmentToCancel.service_name}</span> on{' '}
              <span className="font-bold text-slate-900">{appointmentToCancel.appointment_date}</span>?
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setAppointmentToCancel(null)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
