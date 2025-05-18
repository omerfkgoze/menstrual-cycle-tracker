// Kullanıcı profili tipi
export interface Profile {
  id: string;
  updated_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  cycle_average_length: number | null;
  period_average_length: number | null;
  last_period_start_date: string | null;
  email_notifications: boolean;
  push_notifications: boolean;
  theme_preference: 'light' | 'dark' | 'system';
}

// Döngü kaydı tipi
export interface Cycle {
  id: number;
  created_at: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  cycle_length: number | null;
  period_length: number | null;
  notes: string | null;
}

// Semptom kaydı tipi
export interface Symptom {
  id: number;
  created_at: string;
  user_id: string;
  date: string;
  type: SymptomType;
  intensity: 'light' | 'medium' | 'severe';
  notes: string | null;
}

// Semptom tipleri
export enum SymptomType {
  CRAMPS = 'cramps',
  HEADACHE = 'headache',
  BACKACHE = 'backache',
  NAUSEA = 'nausea',
  FATIGUE = 'fatigue',
  BLOATING = 'bloating',
  BREAST_TENDERNESS = 'breast_tenderness',
  ACNE = 'acne',
  INSOMNIA = 'insomnia',
  DIZZINESS = 'dizziness',
  CRAVINGS = 'cravings',
  DIARRHEA = 'diarrhea',
  CONSTIPATION = 'constipation',
  OTHER = 'other'
}

// Ruh hali kaydı tipi
export interface Mood {
  id: number;
  created_at: string;
  user_id: string;
  date: string;
  type: MoodType;
  intensity: 'slight' | 'moderate' | 'strong';
  notes: string | null;
}

// Ruh hali tipleri
export enum MoodType {
  HAPPY = 'happy',
  ENERGETIC = 'energetic',
  CALM = 'calm',
  IRRITABLE = 'irritable',
  ANXIOUS = 'anxious',
  SAD = 'sad',
  DEPRESSED = 'depressed',
  MOOD_SWINGS = 'mood_swings',
  SENSITIVE = 'sensitive',
  STRESSED = 'stressed',
  OTHER = 'other'
}

// İlaç kaydı tipi
export interface Medication {
  id: number;
  created_at: string;
  user_id: string;
  name: string;
  dosage: string;
  date: string;
  time: string;
  taken: boolean;
  recurring: boolean;
  recurring_days: string[] | null; // ['monday', 'tuesday', ...]
  notes: string | null;
}

// Takvim işaretleme tipi
export interface CalendarMark {
  date: string;
  period: boolean;
  fertile: boolean;
  ovulation: boolean;
  symptoms: boolean;
  moods: boolean;
  medications: boolean;
  notes: boolean;
}

// Takvim günü veri tipi
export interface DayData {
  date: string;
  cycle?: Cycle;
  symptoms: Symptom[];
  moods: Mood[];
  medications: Medication[];
  notes?: string;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
}