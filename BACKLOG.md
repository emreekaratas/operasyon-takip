# Backlog

Product Manager tarafından yönetilir. Developer agent'lar buradan iş alır.

## Kurallar

- PM yeni görev ekler, öncelik ve agent ataması yapar
- Developer sadece kendine atanan görevleri alır
- Görev tamamlanınca developer durumu `Tamamlandı` olarak günceller
- **Agent A** = Backend (API route'ları, veri katmanı, auth, validasyon)
- **Agent B** = Frontend (UI bileşenleri, sayfalar, UX iyileştirmeleri)
- **KRİTİK**: Veritabanı veya Prisma KULLANMA. Veri katmanı Next.js API route + JSON dosya veya in-memory store ile çözülecek. Harici veritabanı bağımlılığı ekleme.

## Görevler

---

### [GÖREV-001] Next.js API Route'ları Oluştur
- **Durum**: Tamamlandı
- **Öncelik**: Yüksek
- **Atanan**: Agent A
- **Açıklama**: Mevcut localStorage tabanlı veri yönetimini destekleyecek API route'ları oluştur. `src/app/api/` altında operasyonlar, atamalar ve kullanıcılar için CRUD endpoint'leri tanımla. Şimdilik veriyi bellekte (in-memory) veya JSON dosyasında tut.
- **Kabul Kriterleri**:
  - [x] `GET/POST /api/operations` — operasyon listeleme ve oluşturma
  - [x] `DELETE /api/operations/[id]` — operasyon silme
  - [x] `GET/POST /api/assignments` — atama listeleme ve oluşturma
  - [x] `PATCH /api/assignments/[id]/advance` — adım ilerleme
  - [x] `GET /api/users` — kullanıcı listeleme
  - [x] Tüm endpoint'ler doğru HTTP status code döndürüyor

---

### [GÖREV-002] Veri Validasyonu ve Hata Yönetimi
- **Durum**: Tamamlandı
- **Öncelik**: Yüksek
- **Atanan**: Agent A
- **Açıklama**: API route'larında gelen verileri doğrula. Operasyon oluşturulurken başlık boş olmamalı, en az 1 adım olmalı. Atama yapılırken operasyon ve kullanıcı var mı kontrol et. Hatalı isteklerde anlamlı hata mesajları döndür.
- **Kabul Kriterleri**:
  - [x] Operasyon oluşturma: başlık zorunlu, en az 1 adım zorunlu
  - [x] Atama: geçersiz operationId veya workerId için 404 döndür
  - [x] Mükerrer atama engelleniyor (aynı işçi + aynı operasyon)
  - [x] Tüm hata yanıtları `{ error: string }` formatında

---

### [GÖREV-003] Bildirim / Toast Sistemi Oluştur
- **Durum**: Tamamlandı
- **Öncelik**: Yüksek
- **Atanan**: Agent B
- **Açıklama**: Kullanıcı aksiyonlarında geri bildirim veren bir toast/bildirim sistemi oluştur. Operasyon oluşturuldu, işçi atandı, adım tamamlandı gibi durumlarda ekranın sağ üstünde kısa süreli bildirimler göster. Başarı (yeşil), hata (kırmızı), bilgi (mavi) renk kodları kullan.
- **Kabul Kriterleri**:
  - [x] `ToastProvider` ve `useToast` hook'u oluşturuldu
  - [x] Toast bileşeni ekranın sağ üstünde görünüyor
  - [x] Başarı, hata, bilgi tipleri farklı renklerde
  - [x] 3 saniye sonra otomatik kaybolma + animasyon
  - [x] Operasyon oluşturma, silme, atama, adım ilerleme işlemlerinde toast gösteriliyor

---

### [GÖREV-004] Operasyon Düzenleme Sayfası
- **Durum**: Tamamlandı
- **Öncelik**: Yüksek
- **Atanan**: Agent B
- **Açıklama**: Yönetici mevcut bir operasyonu düzenleyebilmeli. Operasyon listesindeki her kartta "Düzenle" butonu olacak. Tıklanınca `/dashboard/manager/operations/[id]/edit` sayfasına gidecek. Başlık, açıklama ve adımlar düzenlenebilecek. Aktif atama varsa adım silme engellenmeli.
- **Kabul Kriterleri**:
  - [x] `src/app/dashboard/manager/operations/[id]/edit/page.tsx` sayfası oluşturuldu
  - [x] Mevcut operasyon bilgileri forma yükleniyor
  - [x] Başlık, açıklama ve adımlar düzenlenebiliyor
  - [x] Yeni adım eklenebiliyor, mevcut adım silinebiliyor
  - [x] `updateOperation` fonksiyonu OperationContext'e eklendi
  - [x] Operasyon listesine "Düzenle" butonu eklendi

---

### [GÖREV-005] Kullanıcı Oturumu için API Route
- **Durum**: Tamamlandı
- **Öncelik**: Orta
- **Atanan**: Agent A
- **Açıklama**: Login/logout işlemleri için API route oluştur. `POST /api/auth/login` kullanıcı ID'si alıp oturum başlatacak, `POST /api/auth/logout` oturumu sonlandıracak, `GET /api/auth/me` mevcut kullanıcıyı döndürecek. Şimdilik cookie veya basit session mekanizması kullan.
- **Kabul Kriterleri**:
  - [x] `POST /api/auth/login` — userId ile giriş, cookie set
  - [x] `POST /api/auth/logout` — cookie temizle
  - [x] `GET /api/auth/me` — mevcut kullanıcıyı döndür veya 401
  - [x] Cookie tabanlı basit oturum yönetimi çalışıyor

---

### [GÖREV-006] Operasyon Detay Sayfası
- **Durum**: Tamamlandı
- **Öncelik**: Orta
- **Atanan**: Agent B
- **Açıklama**: Yönetici bir operasyona tıkladığında detay sayfası açılsın. Bu sayfada operasyon bilgileri, tüm adımlar, atanan işçiler ve her işçinin ilerleme durumu görünsün. `/dashboard/manager/operations/[id]` route'unda olacak.
- **Kabul Kriterleri**:
  - [x] `src/app/dashboard/manager/operations/[id]/page.tsx` sayfası oluşturuldu
  - [x] Operasyon başlığı, açıklaması, oluşturulma tarihi görünüyor
  - [x] Adımlar listesi ve durumları görünüyor
  - [x] Atanan işçiler ve bireysel ilerleme yüzdeleri görünüyor
  - [x] Operasyon listesinden detay sayfasına link eklendi

---

### [GÖREV-007] Operasyon Arama ve Filtreleme
- **Durum**: Tamamlandı
- **Öncelik**: Orta
- **Atanan**: Agent B
- **Açıklama**: Yönetici operasyon listesinde arama yapabilmeli ve duruma göre (Taslak / Aktif / Tamamlandı) filtreleyebilmeli. Üstte bir arama çubuğu ve durum filtreleri olacak.
- **Kabul Kriterleri**:
  - [x] Operasyon listesi üstünde arama inputu eklendi
  - [x] Başlık ve açıklamada arama yapılıyor
  - [x] Durum filtreleri (Tümü / Taslak / Aktif / Tamamlandı) butonları eklendi
  - [x] Filtreler anlık çalışıyor (debounce ile)
  - [x] Sonuç bulunamadığında uygun empty state gösteriliyor

---

### [GÖREV-008] İşçi Bildirimleri için API Altyapısı
- **Durum**: Tamamlandı
- **Öncelik**: Düşük
- **Atanan**: Agent A
- **Açıklama**: İşçilere yeni görev atandığında veya bir görev güncellendiğinde bildirim oluşturan bir API altyapısı kur. `Notification` modeli oluştur ve `GET /api/notifications` ile kullanıcıya özel bildirimleri döndür.
- **Kabul Kriterleri**:
  - [x] `Notification` tipi tanımlandı (id, userId, message, read, createdAt)
  - [x] `GET /api/notifications?userId=x` — kullanıcı bildirimlerini döndür
  - [x] `PATCH /api/notifications/[id]/read` — okundu olarak işaretle
  - [x] Atama yapıldığında otomatik bildirim oluşturuluyor

---

### [GÖREV-009] Responsive Tasarım İyileştirmesi
- **Durum**: Tamamlandı
- **Öncelik**: Düşük
- **Atanan**: Agent B
- **Açıklama**: Uygulama mobil cihazlarda düzgün görünmüyor. Sidebar mobilde hamburger menüye dönüşmeli. Kartlar tek sütuna düşmeli. Header'da kullanıcı bilgisi mobilde kısaltılmalı.
- **Kabul Kriterleri**:
  - [x] Sidebar mobilde gizleniyor, hamburger menü butonu eklendi
  - [x] Hamburger butona tıklanınca sidebar overlay olarak açılıyor
  - [x] Kartlar mobilde tek sütun olarak listeleniyor
  - [x] Header mobilde compact görünüyor
  - [x] 768px breakpoint'inde düzgün geçiş sağlanıyor

---

### [GÖREV-010] Operasyon İstatistik API'si
- **Durum**: Tamamlandı
- **Öncelik**: Düşük
- **Atanan**: Agent A
- **Açıklama**: Yönetici dashboard'unda gösterilen istatistikleri hesaplayan bir API endpoint'i oluştur. Toplam operasyon, aktif/tamamlanan sayıları, işçi bazında ilerleme oranları gibi verileri tek bir endpoint'ten döndür.
- **Kabul Kriterleri**:
  - [x] `GET /api/stats` — genel istatistikleri döndür
  - [x] Toplam, aktif, tamamlanan operasyon sayıları
  - [x] İşçi bazında aktif görev ve ortalama ilerleme yüzdesi
  - [x] Son 7 günde tamamlanan görev sayısı
