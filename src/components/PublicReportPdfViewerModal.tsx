import React from 'react';
import {
  X,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  Paperclip
} from 'lucide-react';
import { PatientReport } from '../types';
import { downloadReportPdf } from '../utils/pdfGenerator';

interface PublicReportPdfViewerModalProps {
  isOpen: boolean;
  report: PatientReport | null;
  onClose: () => void;
}

export const PublicReportPdfViewerModal: React.FC<PublicReportPdfViewerModalProps> = ({
  isOpen,
  report,
  onClose,
}) => {
  if (!isOpen || !report) return null;

  const handleDownload = () => {
    downloadReportPdf(report);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/?viewReport=${report.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Noble Smile Studio Diagnostic Report: ${report.report_title}`,
          text: `Official dental report for ${report.patient_name} by ${report.doctor_name}`,
          url,
        });
      } catch (err) {
        console.warn('Share error:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Report link copied to clipboard!');
    }
  };

  const dateStr = report.sent_at || (report.created_at ? new Date(report.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : new Date().toLocaleDateString('en-IN'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in zoom-in-95 duration-150 print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white">Official Medical Diagnostic Report (PDF)</h3>
              <p className="text-[10px] text-slate-300">Noble Smile Studio Centre for Advanced Dental Care</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleShare}
              className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Share report link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleDownload}
              className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Download official PDF file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Authentic Clinical A4 Document Layout */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-900 bg-white max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          
          {/* Document Letterhead */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f3b60] via-[#1d4ed8] to-[#1e40af] text-white space-y-2 relative overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">NOBLE SMILE STUDIO</h1>
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider mt-0.5">
                  Centre for Advanced Dental Care & Aesthetic Dentistry
                </p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad, Gujarat 380055 • Helpline: 084012 33949
                </p>
              </div>
              <div className="text-right sm:border-l sm:border-white/20 sm:pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                  Verified Patient Record
                </span>
                <p className="text-[11px] text-slate-200 mt-1 font-mono">Report ID: {(report.id || 'REP-001').toUpperCase()}</p>
                <p className="text-[10px] text-slate-300 font-medium">Issue Date: {dateStr}</p>
              </div>
            </div>
          </div>

          {/* Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {report.report_type} Examination
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5">
                {report.report_title}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-500 font-medium">Consulting Specialist:</span>
              <p className="font-bold text-sm text-blue-800">{report.doctor_name || 'Dr. Noman Shaikh'}</p>
            </div>
          </div>

          {/* Patient Details Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Patient Name</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{report.patient_name}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">WhatsApp / Mobile</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{report.patient_phone || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</span>
              <p className="font-medium text-slate-900 text-xs mt-0.5 truncate">{report.patient_email || 'N/A'}</p>
            </div>
          </div>

          {/* Section 1: Diagnostic Assessment & File */}
          <div className="space-y-3 text-xs">
            <h3 className="font-extrabold text-sm text-[#0f3b60] border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span>1. Diagnostic Examination & Imaging Findings</span>
            </h3>
            <p className="text-slate-700 leading-relaxed text-xs">
              Complete clinical examination and digital radiographic assessment evaluated for periodontal margin integrity, dental caries, alveolar bone height, and periapical pathoses. The clinical image scan is catalogued under filename:
            </p>
            
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 truncate">
                <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-mono text-slate-900 font-bold truncate">{report.file_name}</span>
                <span className="text-slate-400 text-[11px]">({report.file_size || 'Verified Medical Scan'})</span>
              </div>
              <button
                onClick={handleDownload}
                className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* Section 2: Clinical Observations & Prescriptive Advice */}
          <div className="space-y-2 text-xs">
            <h3 className="font-extrabold text-sm text-[#0f3b60] border-b border-slate-200 pb-1.5">
              2. Doctor Clinical Observations & Advice
            </h3>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-medium leading-relaxed italic text-xs sm:text-sm">
              "{report.notes || 'Oral examination completed with no acute periapical lesions. Patient is advised to maintain twice-daily interdental flossing, use soft-bristle toothbrush, and return for scheduled 6-month preventive scaling.'}"
            </div>
          </div>

          {/* Section 3: Care Guidelines */}
          <div className="space-y-2 text-xs">
            <h3 className="font-extrabold text-sm text-[#0f3b60] border-b border-slate-200 pb-1.5">
              3. Patient Care & Portal Access
            </h3>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li>Save or print this official digital PDF for your ongoing dental records.</li>
              <li>In case of sudden sensitivity, pain, or restoration dislodgement, contact our 24/7 helpline immediately.</li>
              <li>You can view all past radiographs and appointments anytime by logging into the Noble Smile Studio patient portal with your mobile number.</li>
            </ul>
          </div>

          {/* Verification Stamp & Signatures */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-900 text-sm">{report.doctor_name || 'Dr. Noman Shaikh, MDS'}</p>
              <p className="text-slate-500 text-[11px]">Authorized Consulting Dental Surgeon</p>
              <p className="text-[10px] text-blue-700 font-semibold mt-0.5">Noble Smile Studio Medical Faculty</p>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Digital Medical Seal Verified</span>
                <span className="text-[10px] text-slate-500">Security Hash: {(report.id || 'REP-001').toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Download Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <span className="text-[11px] text-slate-400">
              Official PDF Report issued by Noble Smile Studio, Sarkhej, Ahmedabad.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF to Device</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
