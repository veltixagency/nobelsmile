import { Doctor, DentalService, Appointment, Testimonial, ClinicInfo, AppointmentStatus, PatientReport, ReportChannel, PatientRecord } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  INITIAL_DOCTORS,
  INITIAL_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_APPOINTMENTS,
  INITIAL_CLINIC_INFO,
  INITIAL_REPORTS,
  INITIAL_PATIENTS
} from '../data/initialData';

const STORAGE_KEYS = {
  DOCTORS: 'noble_smile_studio_doctors',
  SERVICES: 'noble_smile_studio_services',
  APPOINTMENTS: 'noble_smile_studio_appointments',
  TESTIMONIALS: 'noble_smile_studio_testimonials',
  CLINIC_INFO: 'noble_smile_studio_clinic_info',
  REPORTS: 'noble_smile_studio_patient_reports',
  PATIENTS: 'noble_smile_studio_patients_dir',
};

// Local storage helpers
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
}

export const clinicService = {
  // ---------------- CLINIC INFO ----------------
  async getClinicInfo(): Promise<ClinicInfo> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('clinic_info').select('*').limit(1).single();
        if (!error && data && data.name?.includes('Noble Smile')) return data as ClinicInfo;
      } catch (err) {
        console.warn('Supabase fetch clinic_info error, falling back to local:', err);
      }
    }
    const stored = getLocalItem<ClinicInfo>(STORAGE_KEYS.CLINIC_INFO, INITIAL_CLINIC_INFO);
    if (!stored || stored.name !== 'Noble Smile Studio') {
      setLocalItem(STORAGE_KEYS.CLINIC_INFO, INITIAL_CLINIC_INFO);
      return INITIAL_CLINIC_INFO;
    }
    return stored;
  },

  async updateClinicInfo(info: Partial<ClinicInfo>): Promise<ClinicInfo> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('clinic_info').update(info).select().single();
        if (!error && data) return data as ClinicInfo;
      } catch (err) {
        console.warn('Supabase update clinic_info error, falling back to local:', err);
      }
    }
    const current = getLocalItem<ClinicInfo>(STORAGE_KEYS.CLINIC_INFO, INITIAL_CLINIC_INFO);
    const updated = { ...current, ...info };
    setLocalItem(STORAGE_KEYS.CLINIC_INFO, updated);
    return updated;
  },

  // ---------------- DOCTORS ----------------
  async getDoctors(): Promise<Doctor[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('doctors').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) return data as Doctor[];
      } catch (err) {
        console.warn('Supabase fetch doctors error, falling back to local:', err);
      }
    }
    const doctors = getLocalItem<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    // Sanitize any broken avatar_urls from older cached sessions
    const sanitized = doctors.map((doc) => {
      const match = INITIAL_DOCTORS.find((init) => init.id === doc.id);
      if (match && (!doc.avatar_url || doc.avatar_url.includes('/src/assets/images/'))) {
        return { ...doc, avatar_url: match.avatar_url };
      }
      return doc;
    });
    return sanitized;
  },

  async saveDoctor(doctor: Doctor): Promise<Doctor> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('doctors').upsert(doctor).select().single();
        if (!error && data) return data as Doctor;
      } catch (err) {
        console.warn('Supabase save doctor error, falling back to local:', err);
      }
    }
    const doctors = getLocalItem<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const index = doctors.findIndex((d) => d.id === doctor.id);
    let updated: Doctor[];
    if (index >= 0) {
      updated = [...doctors];
      updated[index] = doctor;
    } else {
      updated = [doctor, ...doctors];
    }
    setLocalItem(STORAGE_KEYS.DOCTORS, updated);
    return doctor;
  },

  async deleteDoctor(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('doctors').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete doctor error:', err);
      }
    }
    const doctors = getLocalItem<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const filtered = doctors.filter((d) => d.id !== id);
    setLocalItem(STORAGE_KEYS.DOCTORS, filtered);
    return true;
  },

  // ---------------- SERVICES ----------------
  async getServices(): Promise<DentalService[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('services').select('*').order('title', { ascending: true });
        if (!error && data && data.length > 0) return data as DentalService[];
      } catch (err) {
        console.warn('Supabase fetch services error, falling back to local:', err);
      }
    }
    return getLocalItem<DentalService[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  },

  async saveService(service: DentalService): Promise<DentalService> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('services').upsert(service).select().single();
        if (!error && data) return data as DentalService;
      } catch (err) {
        console.warn('Supabase save service error, falling back to local:', err);
      }
    }
    const services = getLocalItem<DentalService[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const index = services.findIndex((s) => s.id === service.id);
    let updated: DentalService[];
    if (index >= 0) {
      updated = [...services];
      updated[index] = service;
    } else {
      updated = [service, ...services];
    }
    setLocalItem(STORAGE_KEYS.SERVICES, updated);
    return service;
  },

  async deleteService(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete service error:', err);
      }
    }
    const services = getLocalItem<DentalService[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const filtered = services.filter((s) => s.id !== id);
    setLocalItem(STORAGE_KEYS.SERVICES, filtered);
    return true;
  },

  // ---------------- APPOINTMENTS ----------------
  async getAppointments(): Promise<Appointment[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: true });
        if (!error && data) return data as Appointment[];
      } catch (err) {
        console.warn('Supabase fetch appointments error, falling back to local:', err);
      }
    }
    return getLocalItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  },

  async getAppointmentsByUser(userIdOrEmailOrPhone: string, phoneAlt?: string): Promise<Appointment[]> {
    const all = await this.getAppointments();
    const cleanQuery = (userIdOrEmailOrPhone || '').toLowerCase().trim();
    const digits1 = cleanQuery.replace(/[^0-9]/g, '');
    const digits2 = (phoneAlt || '').replace(/[^0-9]/g, '');

    return all.filter((a) => {
      if (a.user_id && a.user_id === userIdOrEmailOrPhone) return true;
      if (cleanQuery && a.patient_email.toLowerCase() === cleanQuery) return true;
      
      const aptPhoneDigits = (a.patient_phone || '').replace(/[^0-9]/g, '');
      if (digits1.length >= 7 && aptPhoneDigits.length >= 7) {
        if (aptPhoneDigits.slice(-10) === digits1.slice(-10)) return true;
      }
      if (digits2.length >= 7 && aptPhoneDigits.length >= 7) {
        if (aptPhoneDigits.slice(-10) === digits2.slice(-10)) return true;
      }
      return false;
    });
  },

  // Check duplicate appointment (same doctor, same date, same time, not cancelled)
  async checkDuplicateAppointment(doctorId: string, date: string, time: string): Promise<boolean> {
    const appointments = await this.getAppointments();
    return appointments.some(
      (a) =>
        a.doctor_id === doctorId &&
        a.appointment_date === date &&
        a.appointment_time === time &&
        a.status !== 'cancelled'
    );
  },

  async bookAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at'>): Promise<{ appointment?: Appointment; error?: string }> {
    // 1. Validation check for duplicate appointment slot
    const isDuplicate = await this.checkDuplicateAppointment(
      appointmentData.doctor_id,
      appointmentData.appointment_date,
      appointmentData.appointment_time
    );

    if (isDuplicate) {
      return {
        error: `Sorry, ${appointmentData.doctor_name} is already booked on ${appointmentData.appointment_date} at ${appointmentData.appointment_time}. Please pick another time slot.`,
      };
    }

    const newAppointment: Appointment = {
      ...appointmentData,
      id: 'apt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('appointments').insert(newAppointment).select().single();
        if (error) {
          console.warn('Supabase insert appointment error:', error);
          if (error.code === '23505') {
            return { error: 'This doctor slot was just taken. Please choose another date or time.' };
          }
        } else if (data) {
          return { appointment: data as Appointment };
        }
      } catch (err) {
        console.warn('Supabase booking exception:', err);
      }
    }

    // Fallback or local persistence
    const current = getLocalItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const updated = [newAppointment, ...current];
    setLocalItem(STORAGE_KEYS.APPOINTMENTS, updated);
    return { appointment: newAppointment };
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('appointments').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Supabase update appointment error:', err);
      }
    }
    const current = getLocalItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const updated = current.map((a) => (a.id === id ? { ...a, status } : a));
    setLocalItem(STORAGE_KEYS.APPOINTMENTS, updated);
    return true;
  },

  async cancelAppointment(id: string): Promise<boolean> {
    return this.updateAppointmentStatus(id, 'cancelled');
  },

  async deleteAppointment(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('appointments').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete appointment error:', err);
      }
    }
    const current = getLocalItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const updated = current.filter((a) => a.id !== id);
    setLocalItem(STORAGE_KEYS.APPOINTMENTS, updated);
    return true;
  },

  // ---------------- TESTIMONIALS ----------------
  async getTestimonials(): Promise<Testimonial[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('testimonials').select('*').eq('is_featured', true);
        if (!error && data && data.length > 0) return data as Testimonial[];
      } catch (err) {
        console.warn('Supabase fetch testimonials error, falling back to local:', err);
      }
    }
    return getLocalItem<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  },

  async addTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: 't-' + Date.now(),
    };
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('testimonials').insert(newTestimonial);
      } catch (err) {
        console.warn('Supabase insert testimonial error:', err);
      }
    }
    const current = getLocalItem<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
    setLocalItem(STORAGE_KEYS.TESTIMONIALS, [newTestimonial, ...current]);
    return newTestimonial;
  },

  // ---------------- CALLBACK CALL REQUESTS ("Book a Call") ----------------
  async requestCallback(data: { name: string; phone: string; preferred_time?: string; service_interest?: string }) {
    const newCall = {
      id: 'call-' + Date.now(),
      name: data.name,
      phone: data.phone,
      preferred_time: data.preferred_time || 'Morning (9 AM - 12 PM)',
      service_interest: data.service_interest || 'General Consultation',
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('callback_requests').insert(newCall);
      } catch (err) {
        console.warn('Supabase callback request warning:', err);
      }
    }
    const current = getLocalItem<any[]>('demo_clinic_callbacks', []);
    setLocalItem('demo_clinic_callbacks', [newCall, ...current]);
    return newCall;
  },

  async getCallbacks() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase.from('callback_requests').select('*').order('created_at', { ascending: false });
        if (data) return data;
      } catch (err) {
        console.warn('Supabase fetch callbacks warning:', err);
      }
    }
    return getLocalItem<any[]>('demo_clinic_callbacks', []);
  },

  // ---------------- PATIENT DIAGNOSTIC REPORTS ----------------
  async getReports(): Promise<PatientReport[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('patient_reports').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as PatientReport[];
      } catch (err) {
        console.warn('Supabase fetch reports warning:', err);
      }
    }
    return getLocalItem<PatientReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },

  async getReportsByPatient(patientEmailOrPhone: string, phoneAlt?: string): Promise<PatientReport[]> {
    const all = await this.getReports();
    const cleanQuery = (patientEmailOrPhone || '').toLowerCase().trim();
    const digits1 = cleanQuery.replace(/[^0-9]/g, '');
    const digits2 = (phoneAlt || '').replace(/[^0-9]/g, '');

    return all.filter((r) => {
      if (r.patient_id && (r.patient_id === patientEmailOrPhone || r.patient_id === phoneAlt)) return true;
      if (cleanQuery && cleanQuery.includes('@') && r.patient_email.toLowerCase() === cleanQuery) return true;
      const rPhoneDigits = (r.patient_phone || '').replace(/[^0-9]/g, '');
      if (digits1.length >= 7 && rPhoneDigits.length >= 7) {
        if (rPhoneDigits.slice(-10) === digits1.slice(-10)) return true;
      }
      if (digits2.length >= 7 && rPhoneDigits.length >= 7) {
        if (rPhoneDigits.slice(-10) === digits2.slice(-10)) return true;
      }
      return false;
    });
  },

  async saveReport(reportData: Omit<PatientReport, 'id' | 'created_at'> & { id?: string }): Promise<PatientReport> {
    const newReport: PatientReport = {
      ...reportData,
      id: reportData.id || 'rep-' + Date.now(),
      created_at: new Date().toISOString(),
      status: reportData.status || 'pending',
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('patient_reports').upsert(newReport);
      } catch (err) {
        console.warn('Supabase save report warning:', err);
      }
    }

    const current = getLocalItem<PatientReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const existingIndex = current.findIndex((r) => r.id === newReport.id);
    let updated: PatientReport[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newReport;
    } else {
      updated = [newReport, ...current];
    }
    setLocalItem(STORAGE_KEYS.REPORTS, updated);
    return newReport;
  },

  async sendReport(reportId: string, channel: ReportChannel): Promise<{ success: boolean; message: string; report?: PatientReport }> {
    const reports = await this.getReports();
    const report = reports.find((r) => r.id === reportId);
    if (!report) {
      return { success: false, message: 'Report not found' };
    }

    const updatedReport: PatientReport = {
      ...report,
      status: 'sent',
      sent_via: channel,
      sent_at: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('patient_reports').update({
          status: 'sent',
          sent_via: channel,
          sent_at: updatedReport.sent_at,
        }).eq('id', reportId);
      } catch (err) {
        console.warn('Supabase update report send status warning:', err);
      }
    }

    const updatedList = reports.map((r) => (r.id === reportId ? updatedReport : r));
    setLocalItem(STORAGE_KEYS.REPORTS, updatedList);
    return {
      success: true,
      message: `Report successfully dispatched to ${report.patient_name} via ${channel === 'both' ? 'Email and WhatsApp' : channel.toUpperCase()}!`,
      report: updatedReport,
    };
  },

  async deleteReport(reportId: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('patient_reports').delete().eq('id', reportId);
      } catch (err) {
        console.warn('Supabase delete report warning:', err);
      }
    }
    const current = getLocalItem<PatientReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const filtered = current.filter((r) => r.id !== reportId);
    setLocalItem(STORAGE_KEYS.REPORTS, filtered);
    return true;
  },

  // ---------------- PATIENT DIRECTORY CRUD ----------------
  async getPatientDirectory(): Promise<PatientRecord[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as PatientRecord[];
      } catch (err) {
        console.warn('Supabase fetch patients warning:', err);
      }
    }
    return getLocalItem<PatientRecord[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  },

  async savePatient(patient: PatientRecord): Promise<PatientRecord> {
    const newRecord: PatientRecord = {
      ...patient,
      id: patient.id || 'pt-' + Date.now(),
      created_at: patient.created_at || new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('patients').upsert(newRecord);
      } catch (err) {
        console.warn('Supabase save patient warning:', err);
      }
    }

    const current = getLocalItem<PatientRecord[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    const index = current.findIndex((p) => p.id === newRecord.id || (p.phone && p.phone === newRecord.phone));
    let updated: PatientRecord[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = newRecord;
    } else {
      updated = [newRecord, ...current];
    }
    setLocalItem(STORAGE_KEYS.PATIENTS, updated);

    // Also register in registered users so patient can immediately login with mobile number
    try {
      const registeredList = JSON.parse(localStorage.getItem('noble_smile_registered_users') || '[]');
      const userIndex = registeredList.findIndex((u: any) => u.phone === newRecord.phone);
      if (userIndex >= 0) {
        registeredList[userIndex] = {
          ...registeredList[userIndex],
          full_name: newRecord.full_name,
          email: newRecord.email || registeredList[userIndex].email,
        };
      } else {
        registeredList.push({
          id: newRecord.id,
          phone: newRecord.phone,
          full_name: newRecord.full_name,
          email: newRecord.email || `${newRecord.phone.replace(/[^0-9]/g, '')}@patient.noblesmilestudio.com`,
          role: 'patient',
          password: 'password123', // default initial password if admin created
          created_at: newRecord.created_at,
        });
      }
      localStorage.setItem('noble_smile_registered_users', JSON.stringify(registeredList));
    } catch (e) {
      console.warn('Error syncing patient to auth list:', e);
    }

    return newRecord;
  },

  async deletePatient(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('patients').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete patient warning:', err);
      }
    }
    const current = getLocalItem<PatientRecord[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    const filtered = current.filter((p) => p.id !== id);
    setLocalItem(STORAGE_KEYS.PATIENTS, filtered);
    return true;
  },
};
