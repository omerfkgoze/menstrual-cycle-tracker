# Menstrual Döngü Takip Uygulaması

Bu uygulama, kullanıcıların menstrual döngülerini takip etmelerine, semptomlarını kaydetmelerine ve sağlık verilerini güvenli bir şekilde yönetmelerine olanak tanır.

## Özellikler

- Kullanıcı kimlik doğrulama (kayıt, giriş, şifre sıfırlama)
- Döngü takibi ve tahminleri
- Semptom ve ruh hali kaydı
- Takvim görünümü
- İlaç takibi
- Veri görselleştirme ve analizler
- Çevrimdışı kullanım desteği
- Veri gizliliği ve güvenliği

## Teknoloji Yığını

- **Frontend**: React Native, Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Durum Yönetimi**: React Context API
- **Navigasyon**: React Navigation
- **Stil**: Styled Components, React Native Paper

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/kullanici/menstrual-cycle-tracker.git
cd menstrual-cycle-tracker
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Supabase yapılandırması:
   - `.env` dosyasını oluşturun ve Supabase URL ve Anonim Anahtarınızı ekleyin:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Uygulamayı başlatın:
```bash
npm start
```

## Veritabanı Şeması

Uygulama aşağıdaki temel tablolara sahiptir:

- `users`: Kullanıcı profil bilgileri
- `cycles`: Menstrual döngü kayıtları
- `symptoms`: Semptom kayıtları
- `moods`: Ruh hali kayıtları
- `medications`: İlaç takip kayıtları

## Gizlilik ve Güvenlik

- Tüm hassas veriler şifrelenir
- Row Level Security (RLS) ile kullanıcı verilerinin izolasyonu sağlanır
- Kullanıcılar verilerini istedikleri zaman silebilir veya dışa aktarabilir
- Çevrimdışı mod, internet bağlantısı olmadan da kullanım sağlar

## Katkıda Bulunma

Katkıda bulunmak istiyorsanız lütfen bir issue açın veya pull request gönderin.

## Lisans

MIT