import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_ADMIN, DEMO_PATIENT } from '../data/initialData';

export interface StoredUserAccount extends UserProfile {
  password?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string, fullName: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  loginAsDemoAdmin: () => void;
  loginAsDemoPatient: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'noble_smile_current_user';
const USERS_LIST_KEY = 'noble_smile_registered_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from Supabase or localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
            if (profile) {
              setUser(profile as UserProfile);
              setIsLoading(false);
              return;
            }
          }
        }
        // Local storage fallback
        const saved = localStorage.getItem(USER_STORAGE_KEY);
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (err) {
        console.warn('Auth init warning:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const cleanPhoneDigits = (raw: string) => raw.replace(/[^0-9]/g, '');

  const login = async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanIdent = identifier.trim();
      const identDigits = cleanPhoneDigits(cleanIdent);
      const isEmail = cleanIdent.includes('@');

      // 1. Check Demo Admin
      if (
        cleanIdent.toLowerCase() === 'admin@noblesmilestudio.com' ||
        cleanIdent.toLowerCase() === 'admin@democlinic.com' ||
        identDigits === '08401233949' ||
        identDigits === '8401233949' ||
        identDigits === '9876543210'
      ) {
        setUser(DEMO_ADMIN);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
        setIsLoading(false);
        return { success: true };
      }

      // 2. Check Demo Patient
      if (
        cleanIdent.toLowerCase() === 'patient@noblesmilestudio.com' ||
        cleanIdent.toLowerCase() === 'patient@democlinic.com' ||
        cleanIdent.toLowerCase() === 'sameer.patel@example.com' ||
        cleanIdent.toLowerCase() === 'sameer.verma@example.com' ||
        identDigits === '9899912345' ||
        identDigits.endsWith('9899912345')
      ) {
        setUser(DEMO_PATIENT);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_PATIENT));
        setIsLoading(false);
        return { success: true };
      }

      // 3. Supabase Auth
      if (isSupabaseConfigured() && supabase && password) {
        const supabaseEmail = isEmail ? cleanIdent.toLowerCase() : `p_${identDigits}@noblesmilestudio.patient`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: supabaseEmail,
          password: password,
        });

        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const userProfile: UserProfile = profile || {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || 'Patient',
            phone: data.user.user_metadata?.phone || cleanIdent,
            role: data.user.user_metadata?.role || 'patient',
          };

          setUser(userProfile);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
          setIsLoading(false);
          return { success: true };
        }
      }

      // 4. Local Registered Users Lookup by Phone or Email
      const registeredList: StoredUserAccount[] = JSON.parse(
        localStorage.getItem(USERS_LIST_KEY) || '[]'
      );

      const found = registeredList.find((u) => {
        const userPhoneDigits = cleanPhoneDigits(u.phone || '');
        if (identDigits.length >= 7 && userPhoneDigits.length >= 7) {
          if (userPhoneDigits.slice(-10) === identDigits.slice(-10)) return true;
        }
        if (isEmail && u.email && u.email.toLowerCase() === cleanIdent.toLowerCase()) return true;
        return false;
      });

      if (found) {
        if (found.password && password && found.password !== password) {
          setIsLoading(false);
          return { success: false, error: 'Incorrect password for this account. Please try again.' };
        }
        const profile: UserProfile = {
          id: found.id,
          email: found.email,
          full_name: found.full_name,
          phone: found.phone,
          role: found.role || 'patient',
          created_at: found.created_at,
        };
        setUser(profile);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        setIsLoading(false);
        return { success: true };
      }

      // Quick patient account creation if phone provided
      if (identDigits.length >= 7) {
        const newPatient: StoredUserAccount = {
          id: 'pt-' + Date.now(),
          phone: cleanIdent.startsWith('+') ? cleanIdent : '+91 ' + cleanIdent,
          email: `${identDigits}@patient.noblesmilestudio.com`,
          full_name: `Patient ${identDigits.slice(-4)}`,
          role: 'patient',
          password: password,
          created_at: new Date().toISOString(),
        };
        registeredList.push(newPatient);
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(registeredList));

        const profile: UserProfile = {
          id: newPatient.id,
          email: newPatient.email,
          full_name: newPatient.full_name,
          phone: newPatient.phone,
          role: 'patient',
          created_at: newPatient.created_at,
        };
        setUser(profile);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return {
        success: false,
        error: 'No patient account found with this phone number. Please click "Sign Up with Mobile" first.',
      };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Login failed. Please try again.' };
    }
  };

  const register = async (
    phone: string,
    password: string,
    fullName: string,
    email?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanPhone = phone.trim();
      const phoneDigits = cleanPhoneDigits(cleanPhone);
      if (phoneDigits.length < 7) {
        setIsLoading(false);
        return { success: false, error: 'Please enter a valid mobile phone number (at least 8-10 digits).' };
      }
      if (!password || password.length < 4) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 4 characters.' };
      }

      const registeredList: StoredUserAccount[] = JSON.parse(
        localStorage.getItem(USERS_LIST_KEY) || '[]'
      );

      const phoneExists = registeredList.some((u) => {
        const uDigits = cleanPhoneDigits(u.phone || '');
        return uDigits.slice(-10) === phoneDigits.slice(-10);
      });

      if (phoneExists) {
        setIsLoading(false);
        return {
          success: false,
          error: 'An account with this mobile number is already registered. Please sign in with your password.',
        };
      }

      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : '+91 ' + cleanPhone;
      const userEmail = email?.trim().toLowerCase() || `${phoneDigits}@patient.noblesmilestudio.com`;

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: userEmail,
            password: password,
            options: {
              data: {
                full_name: fullName.trim(),
                phone: formattedPhone,
                role: 'patient',
              },
            },
          });
          if (!error && data.user) {
            const profile: UserProfile = {
              id: data.user.id,
              email: userEmail,
              full_name: fullName.trim(),
              phone: formattedPhone,
              role: 'patient',
            };
            setUser(profile);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
            setIsLoading(false);
            return { success: true };
          }
        } catch (supaErr) {
          console.warn('Supabase signup fallback to local storage:', supaErr);
        }
      }

      const newAccount: StoredUserAccount = {
        id: 'pt-' + Date.now(),
        email: userEmail,
        full_name: fullName.trim(),
        phone: formattedPhone,
        role: 'patient',
        password: password,
        created_at: new Date().toISOString(),
      };
      registeredList.push(newAccount);
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(registeredList));

      const profile: UserProfile = {
        id: newAccount.id,
        email: newAccount.email,
        full_name: newAccount.full_name,
        phone: newAccount.phone,
        role: 'patient',
        created_at: newAccount.created_at,
      };
      setUser(profile);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    const updated = { ...user, ...data };
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').update(data).eq('id', user.id);
      } catch (err) {
        console.warn('Profile update error in Supabase:', err);
      }
    }
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));

    const registeredList: StoredUserAccount[] = JSON.parse(
      localStorage.getItem(USERS_LIST_KEY) || '[]'
    );
    const index = registeredList.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      registeredList[index] = { ...registeredList[index], ...data };
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(registeredList));
    }
    return true;
  };

  const loginAsDemoAdmin = () => {
    setUser(DEMO_ADMIN);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
  };

  const loginAsDemoPatient = () => {
    setUser(DEMO_PATIENT);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_PATIENT));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        loginAsDemoAdmin,
        loginAsDemoPatient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
