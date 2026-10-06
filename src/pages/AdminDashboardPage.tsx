import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Database,
  Building,
  RefreshCw,
  Search,
  Check,
  AlertCircle,
  Copy,
  FileText,
  Paperclip,
  X,
  Phone,
  Mail,
  User,
  HeartPulse,
  Activity,
  MapPin,
  ChevronDown,
  MessageSquare,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Doctor, DentalService, Appointment, ClinicInfo, AppointmentStatus, PatientReport, PatientRecord } from '../types';
import { clinicService } from '../services/clinicService';
import { isSupabaseConfigured, getSupabaseConfig } from '../lib/supabase';
import { AdminReportsSection } from '../components/AdminReportsSection';
import { QuickPatientReportModal, PatientModalTarget } from '../components/QuickPatientReportModal';
import { EmailDispatcherModal } from '../components/EmailDispatcherModal';
import { WhatsAppPdfNoticeModal } from '../components/WhatsAppPdfNoticeModal';
import { downloadReportPdf, getReportPdfBlob } from '../utils/pdfGenerator';
import { IMAGES } from '../data/initialData';

interface AdminDashboardPageProps {
  initialDoctors: Doctor[];
  initialServices: DentalService[];
  initialClinicInfo: ClinicInfo;
  onRefreshData: () => void;
  openAuthModal: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  initialDoctors,
  initialServices,
  initialClinicInfo,
  onRefreshData,
  openAuthModal,
}) => {
  const { isAdmin, loginAsDemoAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'patients' | 'doctors' | 'services' | 'reports' | 'clinic' | 'supabase'>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [services, setServices] = useState<DentalService[]>(initialServices);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(initialClinicInfo);
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick report dispatch modal for patient/appointment rows
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<PatientModalTarget | null>(null);
  const [isQuickReportModalOpen, setIsQuickReportModalOpen] = useState(false);
  const [emailModalReport, setEmailModalReport] = useState<PatientReport | null>(null);
  const [whatsappNoticeReport, setWhatsappNoticeReport] = useState<PatientReport | null>(null);

  // Filter & Search states
  const [appointmentFilter, setAppointmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  // Patient Registration Form State (in Admin Panel)
  const [showAddPatientForm, setShowAddPatientForm] = useState(true);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [patientForm, setPatientForm] = useState<Partial<PatientRecord>>({
    full_name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    blood_group: 'O+',
    preferred_doctor: doctors[0]?.name || 'Dr. Noman Shaikh',
    primary_treatment: services[0]?.title || 'General Dentistry',
    first_visit_date: new Date().toISOString().split('T')[0],
    address: '',
    medical_history: '',
    notes: '',
  });

  // Modals for Doctors & Services CRUD
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [doctorForm, setDoctorForm] = useState<Partial<Doctor>>({
    name: '',
    title: '',
    specialty: '',
    qualifications: '',
    experience_years: 5,
    bio: '',
    email: '',
    phone: '',
    working_hours: '09:00 AM - 05:00 PM',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    is_active: true,
  });

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState<Partial<DentalService>>({
    title: '',
    slug: '',
    category: 'General',
    price: 999,
    duration_minutes: 45,
    description: '',
    full_description: '',
    is_active: true,
  });

  const [notification, setNotification] = useState<string>('');
  const [patientFormMsg, setPatientFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    const [apts, docs, srvs, info, reps, pts] = await Promise.all([
      clinicService.getAppointments(),
      clinicService.getDoctors(),
      clinicService.getServices(),
      clinicService.getClinicInfo(),
      clinicService.getReports(),
      clinicService.getPatientDirectory(),
    ]);
    setAppointments(apts);
    setDoctors(docs);
    setServices(srvs);
    setClinicInfo(info);
    setReports(reps);
    setPatients(pts);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to determine report delivery status for any patient by email / phone
  const getPatientReportStatus = (patientEmail?: string, patientPhone?: string) => {
    const cleanEmail = (patientEmail || '').toLowerCase().trim();
    const cleanPhone = (patientPhone || '').replace(/[^0-9]/g, '');

    const patientReps = reports.filter((r) => {
      const rEmail = (r.patient_email || '').toLowerCase().trim();
      const rPhone = (r.patient_phone || '').replace(/[^0-9]/g, '');
      return (cleanEmail && rEmail === cleanEmail) || (cleanPhone && rPhone === cleanPhone);
    });

    if (patientReps.length === 0) {
      return { count: 0, status: 'none', label: 'No Report' };
    }
    const hasSent = patientReps.some((r) => r.status === 'sent');
    if (hasSent) {
      const sentCount = patientReps.filter((r) => r.status === 'sent').length;
      return {
        count: sentCount,
        status: 'sent',
        label: `Sent (${sentCount})`,
      };
    }
    return { count: patientReps.length, status: 'pending', label: `Draft (${patientReps.length})` };
  };

  // Guard for admin access
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Admin Portal</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          This area is restricted to authorized Noble Smile Studio staff and administrators.
        </p>
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              loginAsDemoAdmin();
              loadData();
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Access with Admin Account (Dr. Noman Shaikh)
          </button>
          <button
            onClick={openAuthModal}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
          >
            Sign In with Credentials
          </button>
        </div>
      </div>
    );
  }

  // Appointment Status update
  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await clinicService.updateAppointmentStatus(id, status);
    showNotification(`Appointment status updated to "${status}".`);
    loadData();
    onRefreshData();
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Delete this appointment record permanently?')) {
      await clinicService.deleteAppointment(id);
      showNotification('Appointment record deleted.');
      loadData();
      onRefreshData();
    }
  };

  // ----------------------------------------------------
  // PATIENT DIRECTORY CRUD HANDLERS (THE NEW REQUESTED FEATURE)
  // ----------------------------------------------------
  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientFormMsg(null);

    if (!patientForm.full_name?.trim()) {
      setPatientFormMsg({ type: 'error', text: 'Please enter patient full name.' });
      return;
    }

    if (!patientForm.phone?.trim() || patientForm.phone.replace(/[^0-9]/g, '').length < 8) {
      setPatientFormMsg({ type: 'error', text: 'Please enter a valid mobile / WhatsApp number (min 8-10 digits).' });
      return;
    }

    try {
      const patientRecord: PatientRecord = {
        id: editingPatientId || 'pt-' + Date.now(),
        full_name: patientForm.full_name.trim(),
        phone: patientForm.phone.trim().startsWith('+') ? patientForm.phone.trim() : '+91 ' + patientForm.phone.trim(),
        email: patientForm.email?.trim().toLowerCase() || `${patientForm.phone.replace(/[^0-9]/g, '')}@patient.noblesmilestudio.com`,
        age: patientForm.age ? Number(patientForm.age) : undefined,
        gender: patientForm.gender as any,
        blood_group: patientForm.blood_group,
        preferred_doctor: patientForm.preferred_doctor || doctors[0]?.name,
        primary_treatment: patientForm.primary_treatment || services[0]?.title,
        first_visit_date: patientForm.first_visit_date || new Date().toISOString().split('T')[0],
        address: patientForm.address?.trim() || '',
        medical_history: patientForm.medical_history?.trim() || '',
        notes: patientForm.notes?.trim() || '',
        created_at: new Date().toISOString(),
      };

      await clinicService.savePatient(patientRecord);
      
      const successText = editingPatientId
        ? `Patient record for "${patientRecord.full_name}" updated in directory.`
        : `Patient "${patientRecord.full_name}" successfully added to Patient Directory!`;
      
      setPatientFormMsg({ type: 'success', text: successText });
      showNotification(successText);

      // Reset form
      setEditingPatientId(null);
      setPatientForm({
        full_name: '',
        phone: '',
        email: '',
        age: '',
        gender: 'Male',
        blood_group: 'O+',
        preferred_doctor: doctors[0]?.name || 'Dr. Noman Shaikh',
        primary_treatment: services[0]?.title || 'General Dentistry',
        first_visit_date: new Date().toISOString().split('T')[0],
        address: '',
        medical_history: '',
        notes: '',
      });

      // Reload patient directory
      const updatedPts = await clinicService.getPatientDirectory();
      setPatients(updatedPts);
    } catch (err: any) {
      setPatientFormMsg({ type: 'error', text: err?.message || 'Error saving patient record.' });
    }
  };

  const handleEditPatientClick = (patient: PatientRecord) => {
    setEditingPatientId(patient.id);
    setPatientForm({
      full_name: patient.full_name,
      phone: patient.phone,
      email: patient.email,
      age: patient.age,
      gender: patient.gender,
      blood_group: patient.blood_group,
      preferred_doctor: patient.preferred_doctor,
      primary_treatment: patient.primary_treatment,
      first_visit_date: patient.first_visit_date,
      address: patient.address,
      medical_history: patient.medical_history,
      notes: patient.notes,
    });
    setShowAddPatientForm(true);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleDirectWhatsAppPdf = async (patient: PatientRecord) => {
    // 1. Look for existing report or construct diagnostic report
    const cleanEmail = (patient.email || '').toLowerCase().trim();
    const cleanPhone = (patient.phone || '').replace(/[^0-9]/g, '');

    let patientReport = reports.find((r) => {
      const rEmail = (r.patient_email || '').toLowerCase().trim();
      const rPhone = (r.patient_phone || '').replace(/[^0-9]/g, '');
      return (cleanEmail && rEmail === cleanEmail) || (cleanPhone && rPhone === cleanPhone);
    });

    if (!patientReport) {
      // Create official report record
      patientReport = await clinicService.saveReport({
        patient_id: patient.id,
        patient_name: patient.full_name,
        patient_email: patient.email,
        patient_phone: patient.phone,
        doctor_name: patient.preferred_doctor || doctors[0]?.name || 'Dr. Noman Shaikh',
        report_title: `${patient.primary_treatment || 'General Dentistry'} Diagnostic Radiograph & Clinical Assessment`,
        report_type: 'X-Ray',
        file_name: `${patient.full_name.replace(/[^a-zA-Z0-9]/g, '_')}_Clinical_Scan.pdf`,
        file_size: '2.8 MB',
        notes: patient.notes || patient.medical_history || 'Full oral examination and diagnostic assessment completed. No acute contraindications noted.',
        status: 'sent',
        sent_via: 'whatsapp',
        sent_at: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      });
      loadData();
    } else {
      await clinicService.sendReport(patientReport.id, 'whatsapp');
      loadData();
    }

    // 2. Generate & download the official clinical vector PDF
    const pdfFilename = downloadReportPdf(patientReport);

    // 3. Try native Web Share API with file if supported on device (attaches file directly to WhatsApp)
    let sharedViaFile = false;
    try {
      const pdfBlob = getReportPdfBlob(patientReport);
      const pdfFile = new File([pdfBlob], pdfFilename, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        sharedViaFile = true;
        await navigator.share({
          files: [pdfFile],
          title: patientReport.report_title,
          text: `Noble Smile Studio Diagnostic Report for ${patient.full_name}`,
        });
      }
    } catch (err) {
      console.warn('Native share skipped, opening WhatsApp Web:', err);
    }

    // 4. Open WhatsApp Web with patient number and structured message
    const directPdfUrl = `${window.location.origin}/?viewReport=${patientReport.id}`;
    if (!sharedViaFile) {
      const rawPhone = (patient.phone || '').replace(/[^0-9]/g, '');
      const cleanPhone = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;
      const message = `*NOBLE SMILE STUDIO — MEDICAL DIAGNOSTIC REPORT (PDF)*\n\nDear *${patient.full_name}*,\nYour official dental diagnostic report has been issued in PDF format.\n\n📋 *Report:* ${patientReport.report_title} (${patientReport.report_type})\n👨‍⚕️ *Consulting Doctor:* ${patientReport.doctor_name}\n📎 *Generated PDF File:* ${pdfFilename} (Downloaded to records)\n📝 *Doctor Advice:* ${patientReport.notes || 'Routine follow-up advised.'}\n\n📄 *CLICK TO VIEW & DOWNLOAD YOUR OFFICIAL PDF REPORT:*\n${directPdfUrl}\n\nNoble Smile Studio • Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad • Helpline: 084012 33949`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    setWhatsappNoticeReport(patientReport);
    showNotification(`PDF Generated & Downloaded! WhatsApp opened with link for ${patient.full_name}.`);
  };

  const handleDirectEmail = async (patient: PatientRecord) => {
    const cleanEmail = (patient.email || '').toLowerCase().trim();
    const cleanPhone = (patient.phone || '').replace(/[^0-9]/g, '');

    let patientReport = reports.find((r) => {
      const rEmail = (r.patient_email || '').toLowerCase().trim();
      const rPhone = (r.patient_phone || '').replace(/[^0-9]/g, '');
      return (cleanEmail && rEmail === cleanEmail) || (cleanPhone && rPhone === cleanPhone);
    });

    if (!patientReport) {
      patientReport = await clinicService.saveReport({
        patient_id: patient.id,
        patient_name: patient.full_name,
        patient_email: patient.email,
        patient_phone: patient.phone,
        doctor_name: patient.preferred_doctor || doctors[0]?.name || 'Dr. Noman Shaikh',
        report_title: `${patient.primary_treatment || 'General Dentistry'} Diagnostic Radiograph & Clinical Assessment`,
        report_type: 'X-Ray',
        file_name: `${patient.full_name.replace(/[^a-zA-Z0-9]/g, '_')}_Clinical_Scan.pdf`,
        file_size: '2.8 MB',
        notes: patient.notes || patient.medical_history || 'Full oral examination and diagnostic assessment completed. No acute contraindications noted.',
        status: 'pending',
      });
      loadData();
    }

    setEmailModalReport(patientReport);
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove patient "${name}" from the directory?`)) {
      await clinicService.deletePatient(id);
      showNotification(`Patient "${name}" removed from directory.`);
      const updatedPts = await clinicService.getPatientDirectory();
      setPatients(updatedPts);
    }
  };

  // Doctors CRUD
  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorForm.name || !doctorForm.specialty) return;
    const newDoc: Doctor = {
      id: doctorForm.id || 'doc-' + Date.now(),
      name: doctorForm.name!,
      title: doctorForm.title || 'Dental Specialist',
      specialty: doctorForm.specialty!,
      qualifications: doctorForm.qualifications || 'BDS',
      experience_years: Number(doctorForm.experience_years) || 5,
      bio: doctorForm.bio || 'Experienced dental professional at Noble Smile Studio.',
      avatar_url: doctorForm.avatar_url || IMAGES.drAnjaliSharma,
      email: doctorForm.email || 'doctor@noblesmilestudio.com',
      phone: doctorForm.phone || '084012 33949',
      working_hours: doctorForm.working_hours || '09:30 AM - 08:30 PM',
      available_days: doctorForm.available_days || ['Monday', 'Tuesday', 'Wednesday'],
      is_active: doctorForm.is_active ?? true,
    };
    await clinicService.saveDoctor(newDoc);
    setIsDoctorModalOpen(false);
    showNotification(doctorForm.id ? 'Doctor profile updated.' : 'New doctor added.');
    loadData();
    onRefreshData();
  };

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this doctor from Noble Smile Studio?')) {
      await clinicService.deleteDoctor(id);
      showNotification('Doctor removed.');
      loadData();
      onRefreshData();
    }
  };

  // Services CRUD
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.price) return;
    const newSrv: DentalService = {
      id: serviceForm.id || 'srv-' + Date.now(),
      title: serviceForm.title!,
      slug: serviceForm.slug || serviceForm.title!.toLowerCase().replace(/\s+/g, '-'),
      category: serviceForm.category || 'General',
      price: Number(serviceForm.price),
      duration_minutes: Number(serviceForm.duration_minutes) || 45,
      description: serviceForm.description || '',
      full_description: serviceForm.full_description || serviceForm.description || '',
      icon_name: 'Tooth',
      is_active: serviceForm.is_active ?? true,
    };
    await clinicService.saveService(newSrv);
    setIsServiceModalOpen(false);
    showNotification(serviceForm.id ? 'Dental service updated.' : 'New service created.');
    loadData();
    onRefreshData();
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this dental service?')) {
      await clinicService.deleteService(id);
      showNotification('Service removed.');
      loadData();
      onRefreshData();
    }
  };

  const handleSaveClinicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    await clinicService.updateClinicInfo(clinicInfo);
    showNotification('Clinic details and hours saved successfully!');
    onRefreshData();
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesFilter = appointmentFilter === 'all' || apt.status === appointmentFilter;
    const matchesSearch =
      apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered Patients in Directory
  const filteredPatients = patients.filter((pt) => {
    const q = patientSearchQuery.toLowerCase();
    return (
      pt.full_name.toLowerCase().includes(q) ||
      pt.email.toLowerCase().includes(q) ||
      pt.phone.includes(q) ||
      (pt.preferred_doctor && pt.preferred_doctor.toLowerCase().includes(q)) ||
      (pt.primary_treatment && pt.primary_treatment.toLowerCase().includes(q))
    );
  });

  const totalRevenue = appointments
    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => {
      const s = services.find((srv) => srv.id === a.service_id);
      return sum + (s?.price || 1500);
    }, 0);

  const supabaseConfig = getSupabaseConfig();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-slate-50 min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Administrative Suite</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Role: Medical Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Noble Smile Studio Management Console
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage appointments, patient directory, diagnostic reports, doctors, and clinic operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 text-slate-700 hover:text-blue-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs"
            title="Refresh & Sync Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-semibold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'patients'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Patient Directory ({patients.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Diagnostic Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'doctors'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Doctors ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'services'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Services ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('clinic')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'clinic'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          Clinic Info & Hours
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'supabase'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          Database Sync
        </button>
      </div>

      {/* ========================================================
          TAB 1: OVERVIEW METRICS
          ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Registered Patients</span>
              <p className="text-3xl font-extrabold text-blue-700 mt-2">{patients.length}</p>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                In Patient Directory
              </span>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Total Bookings</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{appointments.length}</p>
              <span className="text-[11px] text-slate-600 font-medium mt-1">Active in pipeline</span>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Diagnostic Reports Sent</span>
              <p className="text-3xl font-extrabold text-emerald-700 mt-2">
                {reports.filter((r) => r.status === 'sent').length}
              </p>
              <span className="text-[11px] text-slate-600 font-medium mt-1">Delivered to patients</span>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold">Est. Pipeline Revenue</span>
              <p className="text-3xl font-extrabold text-emerald-700 mt-2">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-600 font-medium mt-1">Confirmed treatments</span>
            </div>
          </div>

          {/* Quick Action to Patient Directory */}
          <div className="p-6 bg-gradient-to-r from-blue-50 via-white to-emerald-50 rounded-3xl border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                Admin Workflow
              </span>
              <h3 className="text-lg font-bold text-slate-900">Patient Directory Management</h3>
              <p className="text-xs text-slate-600">
                Put in patient details (name, phone, medical history, doctor) to record them in the directory.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('patients')}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              <span>Go to Patient Directory</span>
            </button>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Appointment Bookings</h3>
              <button
                onClick={() => setActiveTab('appointments')}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 cursor-pointer"
              >
                View All Appointments →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Patient</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Doctor</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {appointments.slice(0, 5).map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-900">
                        <div>{apt.patient_name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{apt.patient_phone}</div>
                      </td>
                      <td className="py-3 font-medium text-slate-800">{apt.service_name}</td>
                      <td className="py-3 font-medium text-slate-800">{apt.doctor_name}</td>
                      <td className="py-3 font-semibold text-slate-900">
                        {apt.appointment_date} • {apt.appointment_time}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : apt.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: PATIENT DIRECTORY & ADD PATIENT SECTION (CORE REQUEST)
          ======================================================== */}
      {activeTab === 'patients' && (
        <div className="space-y-8">
          
          {/* Section 1: ADD PATIENT INFORMATION SECTION (THE USER'S REQUEST) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-700 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    {editingPatientId ? 'Edit Patient Information' : 'Add New Patient to Directory'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    Input patient details below. Once submitted, they will be permanently added to the Patient Directory.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPatientForm(!showAddPatientForm)}
                className="py-1.5 px-3.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>{showAddPatientForm ? 'Collapse Form' : 'Open Input Form'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAddPatientForm ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showAddPatientForm && (
              <div className="p-6 sm:p-8 space-y-5">
                {patientFormMsg && (
                  <div
                    className={`p-4 rounded-xl text-xs flex items-center gap-2 font-bold ${
                      patientFormMsg.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}
                  >
                    {patientFormMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{patientFormMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleSavePatient} className="space-y-5 text-xs">
                  {/* Grid 1: Basic Identifiers */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Patient Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={patientForm.full_name || ''}
                          onChange={(e) => setPatientForm({ ...patientForm, full_name: e.target.value })}
                          placeholder="e.g. Vikram Malhotra"
                          className="w-full pl-9 pr-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Mobile Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="tel"
                          value={patientForm.phone || ''}
                          onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                          placeholder="e.g. +91 98123 45678"
                          className="w-full pl-9 pr-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="email"
                          value={patientForm.email || ''}
                          onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                          placeholder="vikram@example.com"
                          className="w-full pl-9 pr-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: Demographics & Medical Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={patientForm.age || ''}
                        onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                        placeholder="e.g. 34"
                        className="w-full px-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Gender</label>
                      <select
                        value={patientForm.gender || 'Male'}
                        onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value as any })}
                        className="w-full px-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Blood Group</label>
                      <select
                        value={patientForm.blood_group || 'O+'}
                        onChange={(e) => setPatientForm({ ...patientForm, blood_group: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">First Visit Date</label>
                      <input
                        type="date"
                        value={patientForm.first_visit_date || ''}
                        onChange={(e) => setPatientForm({ ...patientForm, first_visit_date: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Grid 3: Doctor & Primary Treatment Concern */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Assigned / Preferred Doctor</label>
                      <select
                        value={patientForm.preferred_doctor || ''}
                        onChange={(e) => setPatientForm({ ...patientForm, preferred_doctor: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      >
                        {doctors.map((doc) => (
                          <option key={doc.id} value={doc.name}>
                            {doc.name} ({doc.specialty})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Primary Treatment / Chief Concern</label>
                      <select
                        value={patientForm.primary_treatment || ''}
                        onChange={(e) => setPatientForm({ ...patientForm, primary_treatment: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      >
                        {services.map((srv) => (
                          <option key={srv.id} value={srv.title}>
                            {srv.title} (₹{srv.price})
                          </option>
                        ))}
                        <option value="Consultation & X-Ray Examination">Consultation & X-Ray Examination</option>
                        <option value="Orthodontic Clear Aligners">Orthodontic Clear Aligners</option>
                        <option value="Emergency Toothache Care">Emergency Toothache Care</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid 4: Address & Medical History */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Residential Address / City</label>
                      <input
                        type="text"
                        value={patientForm.address || ''}
                        onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                        placeholder="e.g. Sarkhej, Ahmedabad"
                        className="w-full px-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Medical History / Allergies</label>
                      <input
                        type="text"
                        value={patientForm.medical_history || ''}
                        onChange={(e) => setPatientForm({ ...patientForm, medical_history: e.target.value })}
                        placeholder="e.g. Penicillin allergy, diabetes, none"
                        className="w-full px-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Clinical Notes & Observations</label>
                    <textarea
                      value={patientForm.notes || ''}
                      onChange={(e) => setPatientForm({ ...patientForm, notes: e.target.value })}
                      rows={2}
                      placeholder="e.g. Patient expressed mild dental anxiety; interested in Invisalign clear aligners."
                      className="w-full p-3 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    />
                  </div>

                  {/* Form Submission Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <div className="text-[11px] text-slate-500">
                      * Patient will be instantly searchable in the directory table below.
                    </div>
                    <div className="flex items-center gap-2">
                      {editingPatientId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPatientId(null);
                            setPatientForm({
                              full_name: '',
                              phone: '',
                              email: '',
                              age: '',
                              gender: 'Male',
                              blood_group: 'O+',
                              preferred_doctor: doctors[0]?.name,
                              primary_treatment: services[0]?.title,
                              first_visit_date: new Date().toISOString().split('T')[0],
                              address: '',
                              medical_history: '',
                              notes: '',
                            });
                          }}
                          className="py-2.5 px-4 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button
                        type="submit"
                        className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingPatientId ? 'Update Patient Record' : 'Save to Patient Directory'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Section 2: THE PATIENTS DIRECTORY TABLE */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  placeholder="Search by patient name, phone, doctor, treatment..."
                  className="w-full pl-9 pr-3 py-2 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                />
              </div>
              <div className="text-xs text-slate-600 font-bold">
                Total Patients in Directory: <span className="text-blue-700 font-extrabold">{filteredPatients.length}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-4">Patient Profile</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Vitals & Demographics</th>
                      <th className="p-4">Doctor & Treatment</th>
                      <th className="p-4">Reports Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No patients found in directory. Use the "Add New Patient" form above to create your first record!
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient) => {
                        const repInfo = getPatientReportStatus(patient.email, patient.phone);
                        return (
                          <tr key={patient.id} className="hover:bg-slate-50/70">
                            {/* Profile */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                                  {patient.full_name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{patient.full_name}</p>
                                  {patient.address && (
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3 text-slate-400" />
                                      {patient.address}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{patient.phone}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[170px]">{patient.email}</span>
                              </div>
                            </td>

                            {/* Vitals */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {patient.age && (
                                  <span className="text-[11px] font-semibold text-slate-700">
                                    {patient.age} yrs
                                  </span>
                                )}
                                {patient.gender && (
                                  <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">
                                    {patient.gender}
                                  </span>
                                )}
                                {patient.blood_group && (
                                  <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                    {patient.blood_group}
                                  </span>
                                )}
                              </div>
                              {patient.medical_history && (
                                <p className="text-[10px] text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 mt-1 truncate max-w-[160px]" title={patient.medical_history}>
                                  Hist: {patient.medical_history}
                                </p>
                              )}
                            </td>

                            {/* Treatment */}
                            <td className="p-4">
                              <p className="font-bold text-slate-900">{patient.primary_treatment || 'General Care'}</p>
                              <p className="text-[11px] text-blue-700 font-semibold">{patient.preferred_doctor}</p>
                              {patient.first_visit_date && (
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  Visit: {patient.first_visit_date}
                                </span>
                              )}
                            </td>

                            {/* Reports */}
                            <td className="p-4">
                              <div className="space-y-1">
                                {repInfo.status === 'sent' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Reports Sent ({repInfo.count})</span>
                                  </span>
                                ) : repInfo.status === 'pending' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Drafts ({repInfo.count})</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400">None yet</span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* Send WhatsApp PDF Button */}
                                <button
                                  onClick={() => handleDirectWhatsAppPdf(patient)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  title="Compile and send official medical PDF directly to WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                                  <span>WhatsApp PDF</span>
                                </button>

                                {/* Send Email Button */}
                                <button
                                  onClick={() => handleDirectEmail(patient)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  title="Dispatch report via Gmail Web or default email app"
                                >
                                  <Mail className="w-3 h-3 text-blue-600" />
                                  <span>Email</span>
                                </button>

                                {/* Attach/Customize Report Button */}
                                <button
                                  onClick={() => {
                                    setSelectedPatientForReport({
                                      name: patient.full_name,
                                      email: patient.email,
                                      phone: patient.phone,
                                      doctor_name: patient.preferred_doctor,
                                      service_name: patient.primary_treatment,
                                      reference_id: patient.id,
                                    });
                                    setIsQuickReportModalOpen(true);
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                                  title="Upload new file & customize report"
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit Patient Button */}
                                <button
                                  onClick={() => handleEditPatientClick(patient)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                  title="Edit Patient Information"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Patient Button */}
                                <button
                                  onClick={() => handleDeletePatient(patient.id, patient.full_name)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                  title="Delete from Directory"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: APPOINTMENTS FULL MANAGER
          ======================================================== */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, doctor, service..."
                className="w-full pl-9 pr-3 py-2 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold w-full sm:w-auto overflow-x-auto">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setAppointmentFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                    appointmentFilter === st
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-4">Reference & Patient</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Doctor</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Reports Status</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No appointments found matching this criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/70">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{apt.patient_name}</p>
                          <span className="font-mono text-[10px] text-slate-400">{apt.id}</span>
                        </td>
                        <td className="p-4 text-slate-700">
                          <div className="font-semibold text-slate-900">{apt.patient_phone}</div>
                          <div className="text-[10px] text-slate-500">{apt.patient_email}</div>
                        </td>
                        <td className="p-4 font-bold text-slate-900">{apt.service_name}</td>
                        <td className="p-4 text-slate-700 font-medium">{apt.doctor_name}</td>
                        <td className="p-4 text-slate-700 font-medium">
                          <div className="text-slate-900 font-semibold">{apt.appointment_date}</div>
                          <div className="text-[10px] text-blue-700 font-bold">{apt.appointment_time}</div>
                        </td>
                        <td className="p-4">
                          {(() => {
                            const repInfo = getPatientReportStatus(apt.patient_email, apt.patient_phone);
                            return (
                              <div className="flex flex-col gap-1.5 items-start">
                                {repInfo.status === 'sent' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>{repInfo.label}</span>
                                  </span>
                                ) : repInfo.status === 'pending' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>{repInfo.label}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">None</span>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedPatientForReport({
                                      name: apt.patient_name,
                                      email: apt.patient_email,
                                      phone: apt.patient_phone,
                                      doctor_name: apt.doctor_name,
                                      service_name: apt.service_name,
                                      reference_id: apt.id,
                                    });
                                    setIsQuickReportModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 cursor-pointer"
                                >
                                  <Paperclip className="w-3 h-3 text-blue-600" />
                                  <span>Send Report</span>
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-4">
                          <select
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                            className="text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-300 bg-white text-black cursor-pointer shadow-2xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: DIAGNOSTIC REPORTS SECTION
          ======================================================== */}
      {activeTab === 'reports' && (
        <AdminReportsSection
          appointments={appointments}
          doctors={doctors}
          showNotification={showNotification}
        />
      )}

      {/* ========================================================
          TAB 5: DOCTORS CRUD
          ======================================================== */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Dentists & Specialists Catalog</h3>
            <button
              onClick={() => {
                setDoctorForm({
                  name: '',
                  title: '',
                  specialty: '',
                  qualifications: '',
                  experience_years: 5,
                  bio: '',
                  email: '',
                  phone: '',
                  working_hours: '09:00 AM - 05:00 PM',
                  available_days: ['Monday', 'Tuesday', 'Wednesday'],
                  is_active: true,
                });
                setIsDoctorModalOpen(true);
              }}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 rounded-xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
                    <img
                      src={doctor.avatar_url || IMAGES.drAnjaliSharma}
                      alt={doctor.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = IMAGES.drAnjaliSharma;
                      }}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {doctor.title}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        doctor.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{doctor.name}</h4>
                  <p className="text-xs text-slate-600 font-medium">{doctor.specialty}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{doctor.qualifications}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setDoctorForm(doctor);
                      setIsDoctorModalOpen(true);
                    }}
                    className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: SERVICES & PRICING CRUD
          ======================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Dental Treatments & Price List</h3>
            <button
              onClick={() => {
                setServiceForm({
                  title: '',
                  category: 'General',
                  price: 999,
                  duration_minutes: 45,
                  description: '',
                  full_description: '',
                  is_active: true,
                });
                setIsServiceModalOpen(true);
              }}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {srv.category}
                    </span>
                    <span className="text-sm font-bold text-blue-700">₹{srv.price}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{srv.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{srv.description}</p>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">Duration: ~{srv.duration_minutes} mins</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setServiceForm(srv);
                      setIsServiceModalOpen(true);
                    }}
                    className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteService(srv.id)}
                    className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: CLINIC INFO & HOURS
          ======================================================== */}
      {activeTab === 'clinic' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Clinic Contact Information & Hours</h3>
          
          <form onSubmit={handleSaveClinicInfo} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Clinic Name</label>
              <input
                type="text"
                value={clinicInfo.name}
                onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white shadow-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Clinic Tagline</label>
              <input
                type="text"
                value={clinicInfo.tagline}
                onChange={(e) => setClinicInfo({ ...clinicInfo, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white shadow-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={clinicInfo.phone}
                  onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white shadow-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-900 mb-1">Emergency Hotline</label>
                <input
                  type="text"
                  value={clinicInfo.emergency_phone}
                  onChange={(e) => setClinicInfo({ ...clinicInfo, emergency_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white shadow-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Email Address</label>
              <input
                type="email"
                value={clinicInfo.email}
                onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white shadow-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Physical Address</label>
              <input
                type="text"
                value={clinicInfo.address}
                onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white shadow-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Weekday Hours</label>
                <input
                  type="text"
                  value={clinicInfo.working_hours_weekday}
                  onChange={(e) => setClinicInfo({ ...clinicInfo, working_hours_weekday: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white shadow-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-900 mb-1">Sunday Hours</label>
                <input
                  type="text"
                  value={clinicInfo.working_hours_weekend}
                  onChange={(e) => setClinicInfo({ ...clinicInfo, working_hours_weekend: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white shadow-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Update Clinic Details
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          TAB 8: SUPABASE STATUS
          ======================================================== */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Database & Authentication Architecture</h3>
                  <p className="text-xs text-slate-500">PostgreSQL Tables, Patient Records & Auth Sync</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    supabaseConfig.configured ? 'bg-emerald-500' : 'bg-emerald-600'
                  }`}
                />
                <span className="text-xs font-bold text-slate-800">
                  {supabaseConfig.configured ? 'Live Supabase Connected' : 'Persistent Storage Active'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-medium">Database Status:</span>
                <p className="font-mono text-slate-800 font-bold">
                  Active & Synced (Patients, Appointments, Reports, Doctors, Services)
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-medium">Patient Directory Records:</span>
                <p className="font-mono text-blue-700 font-bold">
                  {patients.length} Registered Patients
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Modal */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {doctorForm.id ? 'Edit Doctor Profile' : 'Add New Doctor'}
              </h3>
              <button
                type="button"
                onClick={() => setIsDoctorModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
            <form onSubmit={handleSaveDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  placeholder="Dr. John Doe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Title</label>
                  <input
                    type="text"
                    value={doctorForm.title}
                    onChange={(e) => setDoctorForm({ ...doctorForm, title: e.target.value })}
                    placeholder="Chief Dentist"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black font-semibold bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={doctorForm.experience_years}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience_years: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black font-semibold bg-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-900 mb-1">Specialty</label>
                <input
                  type="text"
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                  placeholder="Orthodontics & Braces"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black font-semibold bg-white"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-900 mb-1">Qualifications</label>
                <input
                  type="text"
                  value={doctorForm.qualifications}
                  onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
                  placeholder="BDS, MDS"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black font-semibold bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="py-2 px-3.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {serviceForm.id ? 'Edit Dental Service' : 'Add Dental Service'}
              </h3>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Service Title</label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. Laser Teeth Whitening"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black font-semibold bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black font-semibold bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={serviceForm.duration_minutes}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black font-semibold bg-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-900 mb-1">Category</label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-black font-semibold"
                >
                  <option value="General">General</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Cosmetic">Cosmetic</option>
                  <option value="Specialized">Specialized</option>
                  <option value="Endodontics">Endodontics</option>
                  <option value="Surgical">Surgical</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-900 mb-1">Short Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black font-semibold bg-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="py-2 px-3.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-filled Quick Patient Report Modal */}
      <QuickPatientReportModal
        isOpen={isQuickReportModalOpen}
        patient={selectedPatientForReport}
        onClose={() => {
          setIsQuickReportModalOpen(false);
          setSelectedPatientForReport(null);
        }}
        onSuccess={(newRep, msg) => {
          showNotification(msg);
          loadData();
          onRefreshData();
        }}
      />

      {/* Direct Email Dispatcher Modal */}
      {emailModalReport && (
        <EmailDispatcherModal
          isOpen={Boolean(emailModalReport)}
          report={emailModalReport}
          onClose={() => setEmailModalReport(null)}
          onSuccess={(msg) => {
            showNotification(msg);
            loadData();
            onRefreshData();
          }}
        />
      )}

      {/* WhatsApp PDF Dispatch Notice Modal */}
      {whatsappNoticeReport && (
        <WhatsAppPdfNoticeModal
          isOpen={Boolean(whatsappNoticeReport)}
          report={whatsappNoticeReport}
          onClose={() => setWhatsappNoticeReport(null)}
        />
      )}
    </div>
  );
};
