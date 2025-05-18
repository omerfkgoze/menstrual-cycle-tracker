-- Profiles tablosu (auth.users tablosunu genişletir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  birth_date DATE,
  cycle_average_length INTEGER DEFAULT 28,
  period_average_length INTEGER DEFAULT 5,
  last_period_start_date DATE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  theme_preference TEXT DEFAULT 'system'
);

-- Yeni bir kullanıcı kaydolduğunda otomatik olarak profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Döngü kayıtları tablosu
CREATE TABLE IF NOT EXISTS public.cycles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER,
  period_length INTEGER,
  notes TEXT,
  UNIQUE (user_id, start_date)
);

-- Semptom kayıtları tablosu
CREATE TABLE IF NOT EXISTS public.symptoms (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  intensity TEXT NOT NULL,
  notes TEXT
);

-- Ruh hali kayıtları tablosu
CREATE TABLE IF NOT EXISTS public.moods (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  intensity TEXT NOT NULL,
  notes TEXT
);

-- İlaç kayıtları tablosu
CREATE TABLE IF NOT EXISTS public.medications (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  taken BOOLEAN DEFAULT FALSE,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_days TEXT[],
  notes TEXT
);

-- Notlar tablosu
CREATE TABLE IF NOT EXISTS public.notes (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL
);

-- Row Level Security (RLS) Politikaları

-- Profiles tablosu için RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Cycles tablosu için RLS
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi döngü kayıtlarını görebilir"
  ON public.cycles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi döngü kayıtlarını ekleyebilir"
  ON public.cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi döngü kayıtlarını güncelleyebilir"
  ON public.cycles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi döngü kayıtlarını silebilir"
  ON public.cycles FOR DELETE
  USING (auth.uid() = user_id);

-- Symptoms tablosu için RLS
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi semptom kayıtlarını görebilir"
  ON public.symptoms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi semptom kayıtlarını ekleyebilir"
  ON public.symptoms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi semptom kayıtlarını güncelleyebilir"
  ON public.symptoms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi semptom kayıtlarını silebilir"
  ON public.symptoms FOR DELETE
  USING (auth.uid() = user_id);

-- Moods tablosu için RLS
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi ruh hali kayıtlarını görebilir"
  ON public.moods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi ruh hali kayıtlarını ekleyebilir"
  ON public.moods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi ruh hali kayıtlarını güncelleyebilir"
  ON public.moods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi ruh hali kayıtlarını silebilir"
  ON public.moods FOR DELETE
  USING (auth.uid() = user_id);

-- Medications tablosu için RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi ilaç kayıtlarını görebilir"
  ON public.medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi ilaç kayıtlarını ekleyebilir"
  ON public.medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi ilaç kayıtlarını güncelleyebilir"
  ON public.medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi ilaç kayıtlarını silebilir"
  ON public.medications FOR DELETE
  USING (auth.uid() = user_id);

-- Notes tablosu için RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi notlarını görebilir"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi notlarını ekleyebilir"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi notlarını güncelleyebilir"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi notlarını silebilir"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);