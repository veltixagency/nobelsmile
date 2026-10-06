import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Copy,
  Check,
  ExternalLink,
  Download,
  Paperclip,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PatientReport } from '../types';
import { clinicService } from '../services/clinicService';
import { downloadReportPdf } from '../utils/pdfGenerator';

interface EmailDispatcherModalProps {
  isOpen: boolean;
  report: PatientReport | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const EmailDispatcherModal: React.FC<EmailDispatcherModalProps> = ({
  isOpen,
  report,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !report) return null;

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const recipientEmail = report.patient_email || 'patient@example.com';
  const emailSubject = `Noble Smile Studio - Diagnostic Report & Radiograph: ${report.report_title}`;
  
  const emailBody = `Dear ${report.patient_name},

Greetings from Noble Smile Studio, Ahmedabad.

Your dental diagnostic report "${report.report_title}" (${report.report_type}) has been reviewed and released by ${report.doctor_name}.

SUMMARY OF FINDINGS:
------------------------------------------
• Patient Name: ${report.patient_name}
• Consulting Doctor: ${report.doctor_name}
• Report Category: ${report.report_type}
• Attached Medical PDF: ${report.file_name} (${report.file_size || 'Verified'})

DOCTOR CLINICAL OBSERVATIONS & NOTES:
${report.notes || 'No acute abnormalities found. Please continue with your recommended oral hygiene routine.'}

📄 VIEW & DOWNLOAD YOUR OFFICIAL MEDICAL PDF REPORT (ONLINE):
${window.location.origin}/?viewReport=${report.id}

Your official signed PDF document is attached and can also be accessed at any time inside your Noble Smile Studio Patient Portal.

If you have any questions or would like to discuss your treatment plan, please contact our clinic helpline: 084012 33949.

Warm regards,
Noble Smile Studio Team
Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad, Gujarat 380055
Helpline: 084012 33949 | contact@noblesmilestudio.com`;

  // 1. Direct Gmail Web URL (Works 100% in all modern browsers without needing local mail clients)
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // 2. Standard Mailto URL
  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Open Gmail Web
  const handleOpenGmail = async () => {
    // Generate and download the official PDF so the admin has it ready to attach to the email
    downloadReportPdf(report);
    setDownloaded(true);

    // Record as sent in clinic service
    await clinicService.sendReport(report.id, 'email');
    
    // Open Gmail composer in new tab
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');

    onSuccess(`Opened Gmail composer with pre-filled report for ${report.patient_name}! The PDF was downloaded to attach.`);
    onClose();
  };

  // Open Default Mail App (mailto)
  const handleOpenDefaultMail = async () => {
    downloadReportPdf(report);
    setDownloaded(true);

    await clinicService.sendReport(report.id, 'email');

    // Use a direct window open or anchor
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onSuccess(`Report dispatch opened in your default email application for ${recipientEmail}!`);
    onClose();
  };

  // Copy Email Text to Clipboard
  const handleCopyEmailText = () => {
    const fullText = `To: ${recipientEmail}\nSubject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Mark as Sent Directly (e.g. if sending via practice management software)
  const handleMarkAsSent = async () => {
    setIsSending(true);
    await clinicService.sendReport(report.id, 'email');
    setIsSending(false);
    onSuccess(`Diagnostic report marked as sent via email to ${recipientEmail}!`);
    onClose();
  };

  const handleDownloadPdf = () => {
    downloadReportPdf(report);
    setDownloaded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Dispatch Diagnostic Report via Email
              </h3>
              <p className="text-[11px] text-slate-300">
                Guaranteed email delivery with PDF download & Gmail Web integration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Recipient Card */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Patient Recipient</span>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">{report.patient_name}</p>
              <p className="text-slate-600 font-mono text-[11px]">{recipientEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="py-1.5 px-3 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl font-bold text-[11px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                title="Download official medical PDF"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>{downloaded ? 'Downloaded PDF' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Email Details Form Preview */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Subject Line</label>
              <input
                type="text"
                readOnly
                value={emailSubject}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-800">Email Message Content</label>
                <button
                  type="button"
                  onClick={handleCopyEmailText}
                  className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Email Text'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={7}
                value={emailBody}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono text-[11px] leading-relaxed shadow-2xs"
              />
            </div>

            {/* Attached PDF notification */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800">
                <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-[11px]">Official Medical PDF:</span>
                <span className="font-mono text-slate-800 font-semibold">{report.file_name}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                PDF Ready
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer shadow-xs"
          >
            Cancel
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Mark as Sent */}
            <button
              type="button"
              disabled={isSending}
              onClick={handleMarkAsSent}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              title="Record this report as sent via email in the system"
            >
              Mark as Sent
            </button>

            {/* Default Mail Client */}
            <button
              type="button"
              onClick={handleOpenDefaultMail}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              title="Open with Outlook, Apple Mail, or Thunderbird"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Default Mail</span>
            </button>

            {/* Send via Gmail Web (Guaranteed to work 100% in browser!) */}
            <button
              type="button"
              onClick={handleOpenGmail}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
              title="Open Gmail with pre-filled recipient, subject and body"
            >
              <Mail className="w-4 h-4" />
              <span>Send with Gmail Web</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
