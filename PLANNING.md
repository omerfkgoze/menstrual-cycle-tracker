# Menstrual Döngü Takip Uygulaması - Planlama Dokümanı

## Proje Genel Bakış

Bu uygulama, kullanıcıların menstrual döngülerini takip etmelerine, semptomlarını kaydetmelerine ve sağlık verilerini güvenli bir şekilde yönetmelerine olanak tanır. Uygulama, kullanıcı gizliliğine öncelik veren, kullanımı kolay ve bilgilendirici bir deneyim sunmayı amaçlar.

## Teknoloji Yığını

### Frontend
- **Framework**: React Native
- **Geliştirme Platformu**: Expo
- **Durum Yönetimi**: React Context API
- **Navigasyon**: React Navigation
- **UI Bileşenleri**: React Native Paper, Styled Components
- **Grafikler**: React Native Chart Kit
- **Takvim**: React Native Calendars

### Backend
- **Platform**: Supabase
- **Veritabanı**: PostgreSQL
- **Kimlik Doğrulama**: Supabase Auth
- **Depolama**: Supabase Storage
- **Güvenlik**: Row Level Security (RLS)

## Mimari

Uygulama, aşağıdaki mimari prensiplere göre tasarlanmıştır:

### Katmanlı Mimari
1. **Sunum Katmanı**: React Native bileşenleri ve ekranlar
2. **İş Mantığı Katmanı**: Context API ve yardımcı fonksiyonlar
3. **Veri Erişim Katmanı**: Supabase istemcisi ve API çağrıları
4. **Veri Depolama Katmanı**: Supabase PostgreSQL veritabanı

### Dosya Yapısı
```
/
├── assets/               # Görsel ve statik dosyalar
├── components/           # Yeniden kullanılabilir UI bileşenleri
├── context/              # React Context API dosyaları
├── lib/                  # Yardımcı kütüphaneler ve API istemcileri
├── screens/              # Uygulama ekranları
│   ├── auth/             # Kimlik doğrulama ekranları
│   └── main/             # Ana uygulama ekranları
├── supabase/             # Supabase yapılandırma ve migration dosyaları
├── types/                # TypeScript tip tanımlamaları
├── utils/                # Yardımcı fonksiyonlar ve araçlar
├── App.tsx               # Ana uygulama bileşeni
└── package.json          # Bağımlılıklar ve betikler
```

## Veritabanı Şeması

### Tablolar

#### 1. profiles
- `id` (UUID, PK): Kullanıcı ID'si (auth.users tablosundan referans)
- `updated_at` (timestamp): Son güncelleme zamanı
- `username` (text): Kullanıcı adı
- `full_name` (text): Tam ad
- `avatar_url` (text): Profil resmi URL'si
- `birth_date` (date): Doğum tarihi
- `cycle_average_length` (integer): Ortalama döngü uzunluğu (gün)
- `period_average_length` (integer): Ortalama periyod uzunluğu (gün)
- `last_period_start_date` (date): Son periyod başlangıç tarihi
- `email_notifications` (boolean): E-posta bildirimleri tercihi
- `push_notifications` (boolean): Push bildirimleri tercihi
- `theme_preference` (text): Tema tercihi (light/dark/system)

#### 2. cycles
- `id` (serial, PK): Döngü ID'si
- `created_at` (timestamp): Oluşturma zamanı
- `user_id` (UUID, FK): Kullanıcı ID'si
- `start_date` (date): Döngü başlangıç tarihi
- `end_date` (date): Döngü bitiş tarihi
- `cycle_length` (integer): Döngü uzunluğu (gün)
- `period_length` (integer): Periyod uzunluğu (gün)
- `notes` (text): Notlar

#### 3. symptoms
- `id` (serial, PK): Semptom ID'si
- `created_at` (timestamp): Oluşturma zamanı
- `user_id` (UUID, FK): Kullanıcı ID'si
- `date` (date): Semptom tarihi
- `type` (text): Semptom tipi
- `intensity` (text): Semptom yoğunluğu (light/medium/severe)
- `notes` (text): Notlar

#### 4. moods
- `id` (serial, PK): Ruh hali ID'si
- `created_at` (timestamp): Oluşturma zamanı
- `user_id` (UUID, FK): Kullanıcı ID'si
- `date` (date): Ruh hali tarihi
- `type` (text): Ruh hali tipi
- `intensity` (text): Ruh hali yoğunluğu (slight/moderate/strong)
- `notes` (text): Notlar

#### 5. medications
- `id` (serial, PK): İlaç ID'si
- `created_at` (timestamp): Oluşturma zamanı
- `user_id` (UUID, FK): Kullanıcı ID'si
- `name` (text): İlaç adı
- `dosage` (text): Doz
- `date` (date): İlaç tarihi
- `time` (time): İlaç zamanı
- `taken` (boolean): Alındı mı
- `recurring` (boolean): Tekrarlanan ilaç mı
- `recurring_days` (text[]): Tekrarlanan günler
- `notes` (text): Notlar

#### 6. notes
- `id` (serial, PK): Not ID'si
- `created_at` (timestamp): Oluşturma zamanı
- `user_id` (UUID, FK): Kullanıcı ID'si
- `date` (date): Not tarihi
- `content` (text): Not içeriği

## Güvenlik ve Gizlilik

### Row Level Security (RLS)
Tüm tablolar için RLS politikaları uygulanarak, kullanıcıların yalnızca kendi verilerine erişebilmesi sağlanır.

### Veri Şifreleme
Hassas veriler için şifreleme uygulanır. Kullanıcı verileri, hem sunucu tarafında hem de istemci tarafında güvenli bir şekilde saklanır.

### Veri Minimizasyonu
Uygulama, yalnızca gerekli verileri toplar ve işler. Kullanıcılar, verilerini istedikleri zaman silebilir veya dışa aktarabilir.

## Ekranlar ve Akışlar

### Kimlik Doğrulama Akışı
1. Giriş Ekranı
2. Kayıt Ekranı
3. Şifre Sıfırlama Ekranı

### Ana Uygulama Akışı
1. Ana Sayfa (Döngü durumu ve özet)
2. Takvim (Döngü ve semptom görüntüleme)
3. Veri Girişi (Döngü, semptom, ruh hali ve ilaç kaydı)
4. İstatistikler (Döngü analizleri ve grafikler)
5. Profil (Kullanıcı ayarları ve hesap yönetimi)

## Tasarım Prensipleri

### UI/UX
- Temiz ve minimal tasarım
- Kolay kullanılabilirlik
- Erişilebilirlik standartlarına uygunluk
- Duyarlı ve uyarlanabilir arayüz
- Karanlık/açık tema desteği

### Renk Paleti
- **Ana Renk**: #FF6B81 (Pembe)
- **İkincil Renk**: #FFA5B3 (Açık Pembe)
- **Başarı**: #4CD964 (Yeşil)
- **Uyarı**: #FFCC00 (Sarı)
- **Hata**: #FF3B30 (Kırmızı)
- **Bilgi**: #5AC8FA (Mavi)

## Gelecek Özellikler

- Döngü tahminleri için makine öğrenimi algoritmaları
- Sağlık önerileri ve içgörüler
- Sosyal paylaşım özellikleri (isteğe bağlı)
- Sağlık uzmanlarıyla bağlantı
- Çoklu dil desteği
- Web uygulaması entegrasyonu
- Apple Health ve Google Fit entegrasyonu

## Geliştirme Zaman Çizelgesi

1. **Faz 1: Temel Uygulama (2 hafta)**
   - Proje kurulumu
   - Kimlik doğrulama
   - Temel ekranlar
   - Veritabanı şeması

2. **Faz 2: Temel Özellikler (3 hafta)**
   - Döngü takibi
   - Semptom ve ruh hali kaydı
   - Takvim görünümü
   - Profil yönetimi

3. **Faz 3: Gelişmiş Özellikler (4 hafta)**
   - İstatistikler ve grafikler
   - Tahminler ve analizler
   - Hatırlatıcılar ve bildirimler
   - Veri dışa aktarma

4. **Faz 4: Test ve Optimizasyon (2 hafta)**
   - Kullanıcı testleri
   - Performans optimizasyonu
   - Hata düzeltmeleri
   - Son iyileştirmeler

5. **Faz 5: Lansman ve İzleme (1 hafta)**
   - App Store ve Google Play'e yükleme
   - Kullanıcı geri bildirimleri
   - Analitik izleme
   - İyileştirmeler ve güncellemeler

## Kodlama Standartları

- TypeScript tip güvenliği
- Fonksiyonel bileşenler ve React Hooks
- Temiz kod prensipleri
- Kapsamlı hata işleme
- Birim testleri
- Tutarlı kod formatı (ESLint ve Prettier)
- Anlaşılır yorum ve dokümantasyon

## Ölçeklenebilirlik ve Performans

- Verimli durum yönetimi
- Lazy loading ve code splitting
- Önbelleğe alma stratejileri
- Offline önce yaklaşımı
- Veritabanı indeksleme ve optimizasyon
- CDN kullanımı statik varlıklar için

## Sonuç

Bu planlama dokümanı, Menstrual Döngü Takip Uygulaması'nın geliştirme sürecini yönlendirmek için bir çerçeve sağlar. Proje ilerledikçe, kullanıcı geri bildirimleri ve yeni gereksinimler doğrultusunda güncellenecektir.