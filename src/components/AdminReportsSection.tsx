import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Mail,
  Paperclip,
  X,
  RefreshCw,
  Share2
} from 'lucide-react';
import { PatientReport, Appointment, Doctor, ReportDeliveryStatus, ReportChannel } from '../types';
import { clinicService } from '../services/clinicService';
import { downloadReportPdf, getReportPdfBlob } from '../utils/pdfGenerator';
import { EmailDispatcherModal } from './EmailDispatcherModal';
import { WhatsAppPdfNoticeModal } from './WhatsAppPdfNoticeModal';

interface AdminReportsSectionProps {
  appointments: Appointment[];
  doctors: Doctor[];
  showNotification: (msg: string) => void;
}

export const AdminReportsSection: React.FC<AdminReportsSectionProps> = ({
  appointments,
  doctors,
  showNotification,
}) => {
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'pending'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');

  // Email Dispatch Modal
  const [emailModalReport, setEmailModalReport] = useState<PatientReport | null>(null);
  const [whatsappNoticeReport, setWhatsappNoticeReport] = useState<PatientReport | null>(null);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorName, setDoctorName] = useState(doctors[0]?.name || 'Dr. Noman Shaikh');
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<PatientReport['report_type']>('X-Ray');
  const [notes, setNotes] = useState('');

  // File state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadReports = async () => {
    setIsLoading(true);
    const data = await clinicService.getReports();
    setReports(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSelectAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    if (!appointmentId) return;
    const apt = appointments.find((a) => a.id === appointmentId);
    if (apt) {
      setPatientName(apt.patient_name);
      setPatientEmail(apt.patient_email);
      setPatientPhone(apt.patient_phone);
      if (apt.doctor_name) {
        setDoctorName(apt.doctor_name);
      }
      setReportTitle(`${apt.service_name} Diagnostic Radiograph & Assessment`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setSelectedFile({
        name: file.name,
        size: sizeInMb,
        dataUrl: loadEvent.target?.result as string,
      });
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateReport = async (e?: React.FormEvent, sendImmediatelyChannel?: ReportChannel) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!patientName.trim()) {
      setErrorMsg('Please specify patient name.');
      return;
    }
    if (!patientEmail.trim() && !patientPhone.trim()) {
      setErrorMsg('Please provide either patient email or phone number.');
      return;
    }
    if (!reportTitle.trim()) {
      setErrorMsg('Please enter the report title.');
      return;
    }
    if (!selectedFile) {
      setErrorMsg('Please select a report or X-Ray file from your computer.');
      return;
    }

    setIsSubmitting(true);
    const isSent = Boolean(sendImmediatelyChannel);

    const newReport = await clinicService.saveReport({
      patient_name: patientName.trim(),
      patient_email: patientEmail.trim(),
      patient_phone: patientPhone.trim(),
      doctor_name: doctorName,
      report_title: reportTitle.trim(),
      report_type: reportType,
      file_name: selectedFile.name,
      file_size: selectedFile.size,
      file_data: selectedFile.dataUrl,
      notes: notes.trim(),
      status: isSent ? 'sent' : 'pending',
      sent_via: sendImmediatelyChannel,
      sent_at: isSent
        ? new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
        : undefined,
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    resetForm();
    loadReports();

    if (sendImmediatelyChannel === 'whatsapp') {
      handleSendWhatsApp(newReport);
    } else if (sendImmediatelyChannel === 'email') {
      setEmailModalReport(newReport);
    } else {
      showNotification('Diagnostic report draft saved successfully.');
    }
  };

  const resetForm = () => {
    setSelectedAppointmentId('');
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setReportTitle('');
    setReportType('X-Ray');
    setNotes('');
    setSelectedFile(null);
    setErrorMsg('');
  };

  // WhatsApp dispatch with official medical PDF generation
  const handleSendWhatsApp = async (report: PatientReport) => {
    // 1. Generate & download the official PDF file locally
    const pdfFilename = downloadReportPdf(report);

    // 2. Try Web Share API with file if supported on device (attaches file directly to WhatsApp)
    let sharedViaFile = false;
    try {
      const pdfBlob = getReportPdfBlob(report);
      const pdfFile = new File([pdfBlob], pdfFilename, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        sharedViaFile = true;
        await navigator.share({
          files: [pdfFile],
          title: report.report_title,
          text: `Noble Smile Studio Diagnostic Report for ${report.patient_name}`,
        });
      }
    } catch (err) {
      console.warn('Native share skipped, opening WhatsApp Web:', err);
    }

    // 3. Open WhatsApp Web / App
    const directPdfUrl = `${window.location.origin}/?viewReport=${report.id}`;
    if (!sharedViaFile) {
      const rawPhone = (report.patient_phone || '').replace(/[^0-9]/g, '');
      const cleanPhone = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;
      const message = `*NOBLE SMILE STUDIO — MEDICAL DIAGNOSTIC REPORT (PDF)*\n\nDear *${report.patient_name}*,\nYour official dental diagnostic report has been compiled in PDF format.\n\n📋 *Report:* ${report.report_title} (${report.report_type})\n👨‍⚕️ *Consulting Doctor:* ${report.doctor_name}\n📎 *Generated PDF File:* ${pdfFilename} (Downloaded to records)\n📝 *Doctor Advice:* ${report.notes || 'Routine follow-up advised.'}\n\n📄 *CLICK TO VIEW & DOWNLOAD YOUR OFFICIAL PDF REPORT:*\n${directPdfUrl}\n\nNoble Smile Studio • Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad • Helpline: 084012 33949`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    const res = await clinicService.sendReport(report.id, 'whatsapp');
    setWhatsappNoticeReport(report);
    showNotification(`PDF Generated & Downloaded! WhatsApp opened with link for ${report.patient_name}.`);
    loadReports();
  };

  // Open Email Dispatcher Modal
  const handleSendEmail = (report: PatientReport) => {
    setEmailModalReport(report);
  };

  const handleToggleStatus = async (report: PatientReport) => {
    const newStatus: ReportDeliveryStatus = report.status === 'sent' ? 'pending' : 'sent';
    await clinicService.saveReport({
      ...report,
      status: newStatus,
      sent_at: newStatus === 'sent' ? new Date().toLocaleString() : undefined,
    });
    showNotification(`Report marked as ${newStatus.toUpperCase()}`);
    loadReports();
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Delete this report record permanently?')) {
      await clinicService.deleteReport(reportId);
      showNotification('Report record deleted.');
      loadReports();
    }
  };

  const handleDownloadFile = (report: PatientReport) => {
    downloadReportPdf(report);
    showNotification(`Downloaded medical PDF for ${report.patient_name}`);
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      r.patient_name.toLowerCase().includes(query) ||
      r.patient_email.toLowerCase().includes(query) ||
      r.patient_phone.includes(query) ||
      r.report_title.toLowerCase().includes(query) ||
      r.doctor_name.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const totalSent = reports.filter((r) => r.status === 'sent').length;
  const totalPending = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Total Diagnostic Reports</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{reports.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Delivered to Patients</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{totalSent}</p>
            <span className="text-[10px] text-slate-500 font-medium">Via WhatsApp (PDF) / Email</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Draft / Pending Reports</span>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{totalPending}</p>
            <span className="text-[10px] text-slate-500 font-medium">Ready to dispatch</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or patient..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-black bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setStatusFilter('sent')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                statusFilter === 'sent' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Sent ({totalSent})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                statusFilter === 'pending' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Pending ({totalPending})
            </button>
          </div>
        </div>

        {/* Upload & Dispatch Button */}
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Send Report (PDF)</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-4">Patient Details</th>
                <th className="p-4">Report Info</th>
                <th className="p-4">Medical PDF & File</th>
                <th className="p-4">Consulting Doctor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No diagnostic reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70">
                    
                    {/* Patient */}
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{report.patient_name}</p>
                      <p className="text-[11px] text-emerald-800 font-bold">{report.patient_phone}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{report.patient_email}</p>
                    </td>

                    {/* Report Info */}
                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {report.report_type}
                      </span>
                      <p className="font-bold text-slate-900 mt-1">{report.report_title}</p>
                      {report.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">"{report.notes}"</p>
                      )}
                    </td>

                    {/* Attached File & Download PDF */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-mono text-[11px] truncate max-w-[130px]" title={report.file_name}>
                          {report.file_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{report.file_size || 'PDF'}</span>
                      <button
                        onClick={() => handleDownloadFile(report)}
                        className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 mt-1 font-bold cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Download Medical PDF
                      </button>
                    </td>

                    {/* Doctor */}
                    <td className="p-4 font-bold text-slate-800">
                      {report.doctor_name}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {report.status === 'sent' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Sent {report.sent_via ? `(${report.sent_via})` : ''}</span>
                          </span>
                          {report.sent_at && (
                            <p className="text-[10px] text-slate-500 font-medium">{report.sent_at}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Draft / Not Sent</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* WhatsApp Send Button (Sends with PDF) */}
                        <button
                          onClick={() => handleSendWhatsApp(report)}
                          className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Generate official PDF and send via WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp PDF</span>
                        </button>

                        {/* Email Send Button (Opens Email Dispatcher Modal) */}
                        <button
                          onClick={() => handleSendEmail(report)}
                          className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open Email Dispatcher (Gmail Web / Mail Client)"
                        >
                          <Mail className="w-3 h-3 text-blue-600" />
                          <span>Email</span>
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(report)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="Toggle Status (Sent / Pending)"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOAD & DISPATCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Upload & Send Diagnostic Report (PDF)</h3>
                  <p className="text-[11px] text-slate-500">Auto-compiles into PDF and dispatches to WhatsApp / Email</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                title="Cancel and close"
              >
                <span className="hidden sm:inline font-semibold">Cancel</span>
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="space-y-4 text-xs">
              
              {/* Quick Select from Appointments */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Autofill from Patient Appointment:
                </label>
                <select
                  value={selectedAppointmentId}
                  onChange={(e) => handleSelectAppointment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                >
                  <option value="">-- Choose Existing Patient (Auto-fills all details) --</option>
                  {appointments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.patient_name} ({apt.service_name} • {apt.appointment_date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Patient Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Sameer Verma"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white placeholder:text-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">WhatsApp / Mobile <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+91 84012 33949"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Patient Email */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">Patient Email Address</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Report Title & Type */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-900 mb-1">Report Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g. Dental OPG Radiograph & Assessment"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white placeholder:text-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Report Category</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-black font-semibold shadow-xs"
                  >
                    <option value="X-Ray">X-Ray</option>
                    <option value="Treatment Plan">Treatment Plan</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Lab Scan">Lab Scan</option>
                    <option value="Invoice">Invoice</option>
                  </select>
                </div>
              </div>

              {/* Consulting Doctor */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">Consulting Doctor</label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-black font-semibold shadow-xs"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} ({doc.title})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Selector From Own Device */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Select File from Your Device (PDF, JPG, PNG, Scans) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50">
                  <input
                    type="file"
                    id="report-file-input"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <label htmlFor="report-file-input" className="cursor-pointer block">
                    <Upload className="w-7 h-7 text-blue-600 mx-auto mb-1" />
                    {selectedFile ? (
                      <div>
                        <p className="font-bold text-slate-900 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{selectedFile.name}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold">{selectedFile.size} • Ready to compile into PDF</p>
                        <span className="text-[10px] text-blue-600 font-bold underline inline-block mt-0.5">Click to choose different file</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-blue-600 hover:underline">Click to browse your files</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">PDF X-Rays, Panoramic Scans, Lab Reports</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">Clinical Notes / Diagnosis (Printed in PDF)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Bone levels intact; follow 6-month routine cleaning."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2 items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4 text-red-500" />
                  <span>Cancel</span>
                </button>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={(e) => handleCreateReport(e)}
                    disabled={isSubmitting}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCreateReport(e, 'email')}
                    disabled={isSubmitting}
                    className="py-2.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCreateReport(e, 'whatsapp')}
                    disabled={isSubmitting}
                    className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send WhatsApp (PDF)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Email Dispatcher Modal */}
      {emailModalReport && (
        <EmailDispatcherModal
          isOpen={Boolean(emailModalReport)}
          report={emailModalReport}
          onClose={() => setEmailModalReport(null)}
          onSuccess={(msg) => {
            showNotification(msg);
            loadReports();
          }}
        />
      )}

      {/* Embedded WhatsApp PDF Notice Modal */}
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
