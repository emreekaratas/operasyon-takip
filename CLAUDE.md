# Operasyon Takip Uygulaması

Dashboard tabanlı operasyon takip sistemi. Yöneticiler operasyon adımları tanımlayıp işçilere atar, işçiler kart arayüzünden adımları sırayla ilerletir.

## Komutlar

- `npm run dev` — Geliştirme sunucusu (localhost:3000)
- `npm run build` — Prodüksiyon derlemesi
- `npm run start` — Prodüksiyon sunucusu
- `npm run lint` — ESLint kontrolü

## Teknoloji

- Next.js 16 (App Router, Turbopack)
- TypeScript (strict mode)
- Tailwind CSS 4 (`@theme inline` ile custom token'lar)
- React Context API (state yönetimi)
- localStorage (client-side persistence, backend yok)
- ESLint 9 (flat config, next/core-web-vitals + next/typescript)

## Mimari

### Dizin Yapısı

```
src/
├── app/                         # Next.js App Router sayfaları
│   ├── page.tsx                 # Login (giriş noktası)
│   ├── layout.tsx               # Root layout (AuthProvider + OperationProvider)
│   ├── globals.css              # Tema token'ları ve animasyonlar
│   └── dashboard/
│       ├── layout.tsx           # Korumalı layout (Sidebar + Header)
│       ├── page.tsx             # Role göre yönlendirme
│       ├── manager/
│       │   ├── page.tsx         # Yönetici özet dashboard
│       │   ├── operations/
│       │   │   ├── page.tsx     # Operasyon listesi
│       │   │   └── new/page.tsx # Yeni operasyon formu
│       │   └── workers/page.tsx # İşçi listesi ve ilerleme
│       └── worker/
│           └── page.tsx         # İşçi görev kartları
├── components/                  # Paylaşılan UI bileşenleri
│   ├── Sidebar.tsx              # Role göre dinamik navigasyon
│   ├── Header.tsx               # Üst bar + çıkış
│   ├── StepProgress.tsx         # Adım ilerleme göstergesi
│   └── AssignModal.tsx          # İşçiye operasyon atama modalı
├── context/
│   ├── AuthContext.tsx          # Kimlik doğrulama (login/logout/user/users)
│   └── OperationContext.tsx     # Operasyon CRUD, atama, adım ilerleme
├── types/
│   └── index.ts                 # Tüm TypeScript arayüz tanımları
└── lib/
    └── storage.ts               # localStorage CRUD yardımcıları
```

### Veri Modelleri (`src/types/index.ts`)

- **User** — `id`, `name`, `role` (`"manager" | "worker"`), `avatar?`
- **Operation** — `id`, `title`, `description`, `steps: Step[]`, `status` (`"draft" | "active" | "completed"`), `createdBy`, `createdAt`
- **Step** — `id`, `title`, `description`, `order`, `status` (`"pending" | "in_progress" | "completed"`)
- **Assignment** — `id`, `operationId`, `workerId`, `currentStepIndex`, `status` (`"active" | "completed"`), `startedAt`, `completedAt?`

Assignment, Operation ile Worker arasında many-to-many ilişki kurar. Bir operasyon birden fazla işçiye atanabilir; her atama bağımsız ilerleme takip eder.

### Kullanıcı Rolleri ve Route Koruması

| Rol | Erişim | Giriş sonrası yönlendirme |
|-----|--------|--------------------------|
| `manager` | `/dashboard/manager/**` | `/dashboard/manager` |
| `worker` | `/dashboard/worker/**` | `/dashboard/worker` |

- `dashboard/layout.tsx` auth guard görevi görür — `user` yoksa `/` adresine yönlendirir.
- `dashboard/page.tsx` role göre otomatik redirect yapar.
- Login mock'tur: `lib/storage.ts` içinde seed kullanıcılar tanımlıdır (1 yönetici, 3 işçi).

### State Akışı

```
AuthProvider (root layout)
  └── OperationProvider (root layout)
        ├── Manager sayfaları → addOperation / deleteOperation / assignOperation
        └── Worker sayfası → advanceStep
```

- Tüm state değişiklikleri anında `localStorage`'a persist edilir.
- Context'ler `useEffect` ile hydration sırasında localStorage'dan okur.
- `loading` state'i hydration tamamlanana kadar spinner gösterir (SSR/CSR uyumsuzluğunu önler).

## Kodlama Kuralları

### Genel

- Arayüz dili **Türkçe**, kod dili **İngilizce** (değişken/fonksiyon/dosya adları).
- Tüm sayfa ve bileşenler `"use client"` direktifi kullanır (localStorage bağımlılığı).
- Path alias: `@/*` → `./src/*`

### Bileşenler

- Dosya adı: PascalCase (`StepProgress.tsx`)
- Default export kullan, named export sadece hook'lar için (`useAuth`, `useOperations`).
- Props arayüzünü bileşen dosyasında tanımla, paylaşılmıyorsa `types/index.ts`'e taşıma.

### Stil

- Tailwind utility class'ları kullan, custom CSS minimal tut.
- Tema token'ları `globals.css` içinde CSS custom properties olarak tanımlı:
  - Renkler: `primary`, `primary-hover`, `success`, `warning`, `danger`, `muted`, `card`, `border`
  - Sidebar: `sidebar-bg`, `sidebar-text`, `sidebar-active`
- Tailwind'de `bg-primary`, `text-muted`, `border-border` şeklinde kullan.
- Animasyonlar: `animate-fade-in`, `animate-slide-in`, `animate-scale-in` (globals.css'de tanımlı).
- Border radius: kartlar için `rounded-2xl`, butonlar için `rounded-xl`, avatar için `rounded-full`.

### Yeni Sayfa Ekleme

1. `src/app/dashboard/{role}/` altında klasör + `page.tsx` oluştur.
2. `"use client"` ekle.
3. `src/components/Sidebar.tsx` içindeki ilgili nav dizisine (`managerNav` veya `workerNav`) yeni menü öğesi ekle.

### Yeni Bileşen Ekleme

1. `src/components/` altında PascalCase dosya oluştur.
2. Props interface'ini dosya içinde tanımla.
3. Default export kullan.

### Context'e Yeni İşlev Ekleme

1. İlgili context dosyasında (`AuthContext.tsx` veya `OperationContext.tsx`):
   - Interface'e yeni fonksiyon signature'ı ekle.
   - Provider içinde `useCallback` ile implement et.
   - Provider value objesine ekle.
2. localStorage'a yazması gerekiyorsa `persist()` helper'ını kullan (`OperationContext` içinde mevcut).
