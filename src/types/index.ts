export type UserRole = 'patient' | 'admin' | 'doctor';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at?: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  qualifications: string;
  experience_years: number;
  bio: string;
  avatar_url: string;
  email: string;
  phone: string;
  available_days: string[];
  working_hours: string;
  is_active: boolean;
}

export interface DentalService {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_description: string;
  category: string;
  price: number;
  duration_minutes: number;
  icon_name: string;
  image_url?: string;
  is_active: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Appointment {
  id: string;
  user_id?: string;
  doctor_id: string;
  service_id: string;
  doctor_name: string;
  service_name: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // e.g. "10:00 AM"
  notes?: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface Testimonial {
  id: string;
  patient_name: string;
  rating: number;
  comment: string;
  treatment?: string;
  is_featured: boolean;
}

export interface ClinicInfo {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  working_hours_weekday: string;
  working_hours_weekend: string;
  emergency_phone: string;
  plus_code?: string;
  google_maps_url?: string;
}

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  preferred_time: string;
  service_interest: string;
  status: 'pending' | 'called' | 'closed';
  created_at: string;
}

export type ReportDeliveryStatus = 'pending' | 'sent' | 'failed';
export type ReportChannel = 'email' | 'whatsapp' | 'both';

export interface PatientReport {
  id: string;
  patient_id?: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  doctor_name: string;
  report_title: string;
  report_type: 'X-Ray' | 'Prescription' | 'Treatment Plan' | 'Lab Scan' | 'Invoice';
  file_name: string;
  file_size?: string;
  file_data?: string; // base64 data url for preview/download
  notes?: string;
  status: ReportDeliveryStatus;
  sent_via?: ReportChannel;
  sent_at?: string;
  created_at: string;
}

export interface PatientRecord {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  age?: number | string;
  gender?: 'Male' | 'Female' | 'Other';
  blood_group?: string;
  preferred_doctor?: string;
  primary_treatment?: string;
  medical_history?: string;
  address?: string;
  first_visit_date?: string;
  notes?: string;
  created_at: string;
}
