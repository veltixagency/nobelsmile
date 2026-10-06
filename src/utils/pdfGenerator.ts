import jsPDF from 'jspdf';
import { PatientReport } from '../types';

export const generatePatientReportPdf = (report: PatientReport): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background banner (Trust Blue: #0f3b60 / #1d4ed8)
  doc.setFillColor(15, 59, 96);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent Sage Green hairline
  doc.setFillColor(56, 132, 92);
  doc.rect(0, 38, pageWidth, 2.5, 'F');

  // Clinic Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('NOBLE SMILE STUDIO', 16, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(187, 247, 208); // soft sage
  doc.text('CENTRE FOR ADVANCED DENTAL CARE & AESTHETIC DENTISTRY', 16, 23);

  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad, Gujarat 380055 | Tel: 084012 33949', 16, 30);

  // Document Title Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('PATIENT DIAGNOSTIC REPORT', 16, 52);

  // Report Reference & Date
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const dateStr = report.sent_at || (report.created_at ? new Date(report.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : new Date().toLocaleDateString('en-IN'));
  doc.text(`Report ID: ${(report.id || 'REP-001').toUpperCase()}`, pageWidth - 16, 48, { align: 'right' });
  doc.text(`Issue Date: ${dateStr}`, pageWidth - 16, 54, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(16, 58, pageWidth - 16, 58);

  // Patient & Doctor Information Box (Light Gray / White with border)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(16, 62, pageWidth - 32, 42, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(16, 62, pageWidth - 32, 42, 3, 3, 'S');

  // Box Left: Patient Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('PATIENT DETAILS', 22, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Full Name:', 22, 77);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(report.patient_name || 'N/A', 46, 77);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Mobile (WhatsApp):', 22, 84);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(report.patient_phone || 'N/A', 56, 84);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Email Address:', 22, 91);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(report.patient_email || 'N/A', 46, 91);

  // Box Right: Doctor & Classification
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('CLINICAL CLASSIFICATION', pageWidth / 2 + 10, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Consulting Specialist:', pageWidth / 2 + 10, 77);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216); // Trust Blue
  doc.text(report.doctor_name || 'Dr. Noman Shaikh', pageWidth / 2 + 48, 77);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Report Category:', pageWidth / 2 + 10, 84);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 132, 92); // Sage Green
  doc.text((report.report_type || 'X-Ray').toUpperCase(), pageWidth / 2 + 48, 84);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Attached Asset:', pageWidth / 2 + 10, 91);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(report.file_name || 'Digital Radiograph', pageWidth / 2 + 48, 91);

  // Diagnostic Examination Findings
  let y = 114;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 59, 96);
  doc.text('1. DIAGNOSTIC ASSESSMENT & FINDINGS', 16, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Investigation: ${report.report_title}`, 16, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const descriptionText = `Full clinical radiographic scan completed. High-definition imaging evaluated for periodontal margin integrity, dental caries, alveolar bone density, and root canal pathoses. Digital dental record is attached under filename "${report.file_name}" (${report.file_size || 'Verified'}).`;
  const splitDesc = doc.splitTextToSize(descriptionText, pageWidth - 32);
  doc.text(splitDesc, 16, y);
  y += splitDesc.length * 5 + 6;

  // Doctor Clinical Observations & Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 59, 96);
  doc.text('2. CLINICAL OBSERVATIONS & PRESCRIPTIVE ADVICE', 16, y);

  y += 7;
  doc.setFillColor(240, 253, 244); // light sage tint
  doc.roundedRect(16, y, pageWidth - 32, 38, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(16, y, pageWidth - 32, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 83, 45); // deep emerald
  const notesText = report.notes?.trim()
    ? `"${report.notes}"`
    : '"Oral examination completed with no acute periapical lesions. Patient is advised to maintain twice-daily interdental flossing, use soft-bristle toothbrush, and return for scheduled 6-month preventive scaling."';
  const splitNotes = doc.splitTextToSize(notesText, pageWidth - 42);
  doc.text(splitNotes, 21, y + 8);

  y += 48;

  // Instructions for Patient Care
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 59, 96);
  doc.text('3. PATIENT CARE GUIDELINES & NEXT STEPS', 16, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('• Save or print this official digital PDF for your ongoing healthcare records.', 20, y);
  y += 5.5;
  doc.text('• In case of sudden sensitivity, pain, or swelling, contact our 24/7 emergency helpline.', 20, y);
  y += 5.5;
  doc.text('• Access real-time appointments and past reports anytime at the Noble Smile Studio Patient Portal.', 20, y);

  // Official Signature & Stamp Block
  y = 238;
  doc.setDrawColor(203, 213, 225);
  doc.line(16, y, pageWidth - 16, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(report.doctor_name || 'Dr. Noman Shaikh, MDS', 16, y);
  doc.text('Noble Smile Studio Medical Verification', pageWidth - 16, y, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Consulting Dental Surgeon', 16, y);
  doc.text('Official Digital Seal & Authentication', pageWidth - 16, y, { align: 'right' });

  // Footer Disclaimer
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 275, pageWidth, 22, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Confidential Medical Record — This electronic document is issued solely for the named patient. Unauthorized reproduction is strictly prohibited.', pageWidth / 2, 282, { align: 'center' });
  doc.text('Noble Smile Studio • Shop 6, Aaman Plaza, Opp. Lokhandwala Party Plot, Sarkhej, Ahmedabad • Tel: 084012 33949', pageWidth / 2, 287, { align: 'center' });

  return doc;
};

export const downloadReportPdf = (report: PatientReport): string => {
  const doc = generatePatientReportPdf(report);
  const sanitizedName = (report.patient_name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `NobleSmileStudio_Report_${sanitizedName}_${report.id || Date.now()}.pdf`;
  doc.save(filename);
  return filename;
};

export const getReportPdfBlob = (report: PatientReport): Blob => {
  const doc = generatePatientReportPdf(report);
  return doc.output('blob');
};

export const getReportPdfDataUri = (report: PatientReport): string => {
  const doc = generatePatientReportPdf(report);
  return doc.output('datauristring');
};
