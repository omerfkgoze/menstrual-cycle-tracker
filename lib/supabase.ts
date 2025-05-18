import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Supabase URL ve anonim anahtarı doğrudan kullanıyoruz
// @env modülünden içe aktarma yerine doğrudan değerleri kullanıyoruz
const supabaseUrl = 'https://gmqfllukurfrdyztggob.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcWZsbHVrdXJmcmR5enRnZ29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE5NjQsImV4cCI6MjA2MzE2Nzk2NH0.EvmqcLSt02MgUidJUIdVfu1w2H3FkzPHODHiumOE9Nc';

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Veritabanı tabloları için yardımcı fonksiyonlar
export const db = {
  // Kullanıcı profili
  profiles: {
    get: async (userId: string) => {
      return await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    },
    update: async (userId: string, data: any) => {
      return await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
    },
  },
  
  // Döngü kayıtları
  cycles: {
    getAll: async (userId: string) => {
      return await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });
    },
    add: async (data: any) => {
      return await supabase
        .from('cycles')
        .insert(data);
    },
    update: async (id: number, data: any) => {
      return await supabase
        .from('cycles')
        .update(data)
        .eq('id', id);
    },
    delete: async (id: number) => {
      return await supabase
        .from('cycles')
        .delete()
        .eq('id', id);
    },
  },
  
  // Semptom kayıtları
  symptoms: {
    getByDate: async (userId: string, date: string) => {
      return await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date);
    },
    add: async (data: any) => {
      return await supabase
        .from('symptoms')
        .insert(data);
    },
    update: async (id: number, data: any) => {
      return await supabase
        .from('symptoms')
        .update(data)
        .eq('id', id);
    },
    delete: async (id: number) => {
      return await supabase
        .from('symptoms')
        .delete()
        .eq('id', id);
    },
  },
  
  // Ruh hali kayıtları
  moods: {
    getByDate: async (userId: string, date: string) => {
      return await supabase
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date);
    },
    add: async (data: any) => {
      return await supabase
        .from('moods')
        .insert(data);
    },
    update: async (id: number, data: any) => {
      return await supabase
        .from('moods')
        .update(data)
        .eq('id', id);
    },
    delete: async (id: number) => {
      return await supabase
        .from('moods')
        .delete()
        .eq('id', id);
    },
  },
  
  // İlaç takip kayıtları
  medications: {
    getAll: async (userId: string) => {
      return await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId);
    },
    getByDate: async (userId: string, date: string) => {
      return await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date);
    },
    add: async (data: any) => {
      return await supabase
        .from('medications')
        .insert(data);
    },
    update: async (id: number, data: any) => {
      return await supabase
        .from('medications')
        .update(data)
        .eq('id', id);
    },
    delete: async (id: number) => {
      return await supabase
        .from('medications')
        .delete()
        .eq('id', id);
    },
  },
};