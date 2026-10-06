import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  MessageSquare,
  Mail,
  FileText,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Clock,
  Download,
  FileCheck,
  Share2
} from 'lucide-react';
import { PatientReport, ReportChannel } from '../types';
import { clinicService } from '../services/clinicService';
import { downloadReportPdf, getReportPdfBlob } from '../utils/pdfGenerator';
import { EmailDispatcherModal } from './EmailDispatcherModal';
import { WhatsAppPdfNoticeModal } from './WhatsAppPdfNoticeModal';

export interface PatientModalTarget {
  name: string;
  email: string;
  phone: string;
  doctor_name?: string;
  service_name?: string;
  reference_id?: string;
}

interface QuickPatientReportModalProps {
  isOpen: boolean;
  patient: PatientModalTarget | null;
  onClose: () => void;
  onSuccess: (report: PatientReport, msg: string) => void;
}

export const QuickPatientReportModal: React.FC<QuickPatientReportModalProps> = ({
  isOpen,
  patient,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !patient) return null;

  const [reportTitle, setReportTitle] = useState(
    patient.service_name
      ? `${patient.service_name} Diagnostic Radiograph & Clinical Report`
      : 'Comprehensive Dental Radiograph & Clinical Report'
  );
  const [reportType, setReportType] = useState<PatientReport['report_type']>('X-Ray');
  const [doctorName, setDoctorName] = useState(patient.doctor_name || 'Dr. Noman Shaikh');
  const [notes, setNotes] = useState(
    patient.service_name
      ? `Consultation for ${patient.service_name} finalized. Follow recommended dental hygiene protocol.`
      : 'Oral examination and radiographic assessment completed. Routine 6-month checkup advised.'
  );

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
  } | null>(null);

  const [existingReports, setExistingReports] = useState<PatientReport[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Email Dispatch Modal state
  const [emailModalReport, setEmailModalReport] = useState<PatientReport | null>(null);
  const [whatsappNoticeReport, setWhatsappNoticeReport] = useState<PatientReport | null>(null);

  // Fetch past reports for this specific patient
  useEffect(() => {
    if (patient) {
      const fetchHistory = async () => {
        const query = patient.email || patient.phone;
        if (query) {
          const past = await clinicService.getReportsByPatient(query);
          setExistingReports(past);
        }
      };
      fetchHistory();
    }
  }, [patient]);

  // Handle local file picking from the computer/device
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

  const handleDispatch = async (channel?: ReportChannel) => {
    setErrorMsg('');
    if (!selectedFile) {
      setErrorMsg('Please select a report file (X-Ray, PDF, or Scan) from your device.');
      return;
    }
    if (!reportTitle.trim()) {
      setErrorMsg('Please provide a descriptive title for this report.');
      return;
    }

    setIsSubmitting(true);
    const isSent = Boolean(channel);
    const sentTime = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const newReport = await clinicService.saveReport({
      patient_id: patient.reference_id,
      patient_name: patient.name,
      patient_email: patient.email,
      patient_phone: patient.phone,
      doctor_name: doctorName,
      report_title: reportTitle.trim(),
      report_type: reportType,
      file_name: selectedFile.name,
      file_size: selectedFile.size,
      file_data: selectedFile.dataUrl,
      notes: notes.trim(),
      status: isSent ? 'sent' : 'pending',
      sent_via: channel,
      sent_at: isSent ? sentTime : undefined,
    });

    setIsSubmitting(false);

    // 1. IF DISPATCHING VIA WHATSAPP (PDF FORMAT REQUIREMENT)
    if (channel === 'whatsapp' || channel === 'both') {
      // First: Automatically generate & download the real vector PDF file so it's in user's downloads ready to drag/attach!
      downloadReportPdf(newReport);

      // Second: Try native Web Share API with files if browser supports it (attaches directly to WhatsApp on mobile/desktop)
      let sharedViaFile = false;
      try {
        const pdfBlob = getReportPdfBlob(newReport);
        const pdfFile = new File([pdfBlob], `${newReport.file_name.replace(/\.[^/.]+$/, '')}_Report.pdf`, {
          type: 'application/pdf',
        });
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          sharedViaFile = true;
          await navigator.share({
            files: [pdfFile],
            title: newReport.report_title,
            text: `*Noble Smile Studio Medical Diagnostic Report*\nDear ${newReport.patient_name},\nPlease find your official diagnostic report attached.\nConsulting Doctor: ${newReport.doctor_name}`,
          });
        }
      } catch (shareErr) {
        console.warn('Native file share skipped, using WhatsApp URL:', shareErr);
      }

      // Third: Open WhatsApp Web / App with pre-filled message & reference
      const directPdfUrl = `${window.location.origin}/?viewReport=${newReport.id}`;
      if (!sharedViaFile) {
        const rawPhone = (patient.phone || '').replace(/[^0-9]/g, '');
        const cleanPhone = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;
        const message = `*NOBLE SMILE STUDIO — MEDICAL DIAGNOSTIC REPORT (PDF)*\n\nDear *${patient.name}*,\nYour official dental diagnostic report has been compiled in PDF format.\n\n📋 *Report:* ${reportTitle} (${reportType})\n👨‍⚕️ *Consulting Doctor:* ${doctorName}\n📎 *Generated PDF File:* ${selectedFile.name} (Saved to downloads)\n📝 *Doctor Advice:* ${notes}\n\n📄 *CLICK TO VIEW & DOWNLOAD YOUR OFFICIAL PDF REPORT:*\n${directPdfUrl}\n\nNoble Smile Studio • Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad • Helpline: 084012 33949`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      setWhatsappNoticeReport(newReport);
      onSuccess(newReport, `Official PDF generated and downloaded! WhatsApp Web opened with link for ${patient.name}.`);
      return;
    }

    // 2. IF DISPATCHING VIA EMAIL
    if (channel === 'email' || channel === 'both') {
      downloadReportPdf(newReport);
      setEmailModalReport(newReport);
      return;
    }

    onSuccess(newReport, `Diagnostic report draft saved for ${patient.name}.`);
    onClose();
  };

  const handleDownloadPdf = (rep: PatientReport) => {
    downloadReportPdf(rep);
  };

  const handleResendWhatsApp = async (rep: PatientReport) => {
    // Generate and download the PDF
    downloadReportPdf(rep);

    // Try native file share
    try {
      const pdfBlob = getReportPdfBlob(rep);
      const pdfFile = new File([pdfBlob], `${rep.file_name.replace(/\.[^/.]+$/, '')}_Report.pdf`, {
        type: 'application/pdf',
      });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: rep.report_title,
          text: `Dear ${rep.patient_name}, here is your official dental report from Noble Smile Studio.`,
        });
        return;
      }
    } catch (e) {
      // fallback
    }

    const rawPhone = (rep.patient_phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;
    const msg = `*NOBLE SMILE STUDIO — MEDICAL DIAGNOSTIC REPORT (PDF)*\n\nDear *${rep.patient_name}*,\nHere is your diagnostic report *"${rep.report_title}"* (${rep.report_type}).\n\nConsulting Doctor: ${rep.doctor_name}\nAttached PDF: ${rep.file_name}\nNotes: ${rep.notes || 'Routine follow-up advised.'}\n\nNoble Smile Studio Helpline: 084012 33949`;
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>Send Diagnostic Report in PDF</span>
                  <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    PDF Generator
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Sends formatted clinical PDF directly to patient WhatsApp & Email
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Cancel"
            >
              <span className="hidden sm:inline">Cancel</span>
              <X className="w-5 h-5 text-slate-300 hover:text-white" />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select File & Send PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Patient Report History ({existingReports.length})</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === 'create' ? (
              <>
                {/* 1. AUTO-FILLED PATIENT DETAILS BANNER */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-emerald-50/80 border border-blue-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Verified Patient Information
                    </span>
                    {patient.reference_id && (
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-semibold">
                        Ref: {patient.reference_id}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                    <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-blue-100 shadow-2xs">
                      <User className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-500 block">Patient Name</span>
                        <span className="font-bold text-slate-900 truncate block">{patient.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-blue-100 shadow-2xs">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-500 block">WhatsApp / Mobile</span>
                        <span className="font-bold text-slate-900 truncate block">{patient.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-blue-100 shadow-2xs">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-500 block">Patient Email</span>
                        <span className="font-medium text-slate-900 truncate block">{patient.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-blue-100 shadow-2xs">
                      <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-500 block">Consulting Doctor</span>
                        <span className="font-bold text-slate-900 truncate block">{doctorName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. FILE SELECTION FROM COMPUTER */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    1. Select Medical Radiograph / Diagnostic Scan <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50">
                    <input
                      type="file"
                      id="quick-report-file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <label htmlFor="quick-report-file" className="cursor-pointer block">
                      <Upload className="w-8 h-8 text-blue-600 mx-auto mb-1.5" />
                      {selectedFile ? (
                        <div className="space-y-1">
                          <p className="font-bold text-xs text-slate-900 flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[280px]">{selectedFile.name}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            File Size: {selectedFile.size} • Ready to compile into clinical PDF
                          </p>
                          <span className="text-[11px] text-blue-600 font-bold underline inline-block mt-0.5">
                            Click to select a different file
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-bold text-blue-600 hover:underline">
                            Click here to choose file from your device
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Supports X-Rays, Panoramic OPG scans, PDF lab reports, treatment prescriptions
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* 3. REPORT TITLE & CATEGORY */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      2. Report Title
                    </label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                      placeholder="e.g. Dental OPG Radiograph & Assessment"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Report Category
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    >
                      <option value="X-Ray">X-Ray</option>
                      <option value="Treatment Plan">Treatment Plan</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Lab Scan">Lab Scan</option>
                      <option value="Invoice">Invoice</option>
                    </select>
                  </div>
                </div>

                {/* 4. DOCTOR NOTES */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    3. Clinical Findings & Prescriptive Advice (Printed in PDF)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full p-3 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                    placeholder="e.g. Bone levels intact; follow 6-month routine cleaning."
                  />
                </div>

                {/* PDF Highlights Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>PDF Delivery:</strong> Clicking "Send WhatsApp (PDF)" will automatically compile and download the official medical PDF and open WhatsApp with the patient!
                  </span>
                </div>
              </>
            ) : (
              /* TAB: PATIENT REPORTS HISTORY */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    Diagnostic Reports for {patient.name}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Total: {existingReports.length}
                  </span>
                </div>
                {existingReports.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No reports generated yet for this patient.</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Click to select file and send now →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {existingReports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {rep.report_type}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{rep.report_title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Paperclip className="w-3 h-3 text-slate-400" />
                            <span>{rep.file_name}</span>
                            <span>·</span>
                            <span>{rep.created_at ? new Date(rep.created_at).toLocaleDateString() : 'Recent'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {rep.status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Sent {rep.sent_via ? `(${rep.sent_via})` : ''}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Draft / Not Sent</span>
                            </span>
                          )}
                          <button
                            onClick={() => handleDownloadPdf(rep)}
                            className="p-1.5 bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Download Official Medical PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="text-[10px]">PDF</span>
                          </button>
                          <button
                            onClick={() => handleResendWhatsApp(rep)}
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Send PDF to WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px]">WhatsApp</span>
                          </button>
                          <button
                            onClick={() => setEmailModalReport(rep)}
                            className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Dispatch via Email"
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[10px]">Email</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Buttons with Clear Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <X className="w-4 h-4 text-red-500 font-bold" />
              <span>Cancel</span>
            </button>

            {activeTab === 'create' && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDispatch()}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Save report record without sending"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDispatch('email')}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send via Email</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDispatch('whatsapp')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send WhatsApp (PDF)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Email Dispatcher Modal if email flow triggered */}
      {emailModalReport && (
        <EmailDispatcherModal
          isOpen={Boolean(emailModalReport)}
          report={emailModalReport}
          onClose={() => setEmailModalReport(null)}
          onSuccess={(msg) => {
            onSuccess(emailModalReport, msg);
            onClose();
          }}
        />
      )}

      {/* Embedded WhatsApp PDF Notice Modal */}
      {whatsappNoticeReport && (
        <WhatsAppPdfNoticeModal
          isOpen={Boolean(whatsappNoticeReport)}
          report={whatsappNoticeReport}
          onClose={() => {
            setWhatsappNoticeReport(null);
            onClose();
          }}
        />
      )}
    </>
  );
};
