import React from 'react';
import {
  X,
  MessageSquare,
  Download,
  ExternalLink,
  CheckCircle2,
  Paperclip,
  Share2
} from 'lucide-react';
import { PatientReport } from '../types';
import { downloadReportPdf } from '../utils/pdfGenerator';

interface WhatsAppPdfNoticeModalProps {
  isOpen: boolean;
  report: PatientReport | null;
  onClose: () => void;
}

export const WhatsAppPdfNoticeModal: React.FC<WhatsAppPdfNoticeModalProps> = ({
  isOpen,
  report,
  onClose,
}) => {
  if (!isOpen || !report) return null;

  const rawPhone = (report.patient_phone || '').replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;
  const pdfDownloadUrl = `${window.location.origin}/?viewReport=${report.id}`;
  
  const whatsappMessage = `*NOBLE SMILE STUDIO — MEDICAL DIAGNOSTIC REPORT (PDF)*\n\nDear *${report.patient_name}*,\nYour official dental diagnostic report has been issued in PDF format.\n\n📋 *Report:* ${report.report_title} (${report.report_type})\n👨‍⚕️ *Consulting Doctor:* ${report.doctor_name}\n📎 *Attached File:* ${report.file_name}\n📝 *Doctor Advice:* ${report.notes || 'Routine follow-up advised.'}\n\n📄 *CLICK TO VIEW & DOWNLOAD YOUR OFFICIAL MEDICAL PDF REPORT:* \n${pdfDownloadUrl}\n\nNoble Smile Studio • Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad • Helpline: 084012 33949`;
  
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(whatsappMessage)}`;

  const handleOpenWhatsAppAgain = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRedownload = () => {
    downloadReportPdf(report);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">WhatsApp PDF Dispatched</h3>
              <p className="text-[11px] text-emerald-100">Patient: {report.patient_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Official Medical PDF Generated & Saved</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              The PDF report for <strong className="text-slate-900">{report.patient_name}</strong> ({report.patient_phone}) has been saved to your downloads and WhatsApp has been opened.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
              2 Ways the Patient Receives the PDF:
            </span>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>
                  <strong>Direct 1-Click Link in WhatsApp:</strong> The message contains an instant link where the patient can tap and view/download the full PDF right on their phone.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>
                  <strong>Attach Downloaded File:</strong> The generated <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">NobleSmileStudio_Report.pdf</code> is in your downloads tray—simply drag and drop it into the WhatsApp chat window!
                </span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleOpenWhatsAppAgain}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Re-Open WhatsApp Web Chat</span>
            </button>
            <button
              onClick={handleRedownload}
              className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Re-Download Medical PDF File</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
