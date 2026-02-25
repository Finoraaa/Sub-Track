# 🚀 SubTrack | Akıllı Abonelik Takip Paneli

<p align="center">
  <img src="public/logo.svg" width="120" alt="SubTrack Logo" />
</p>

<p align="center">
  <strong>Dijital aboneliklerinizi kontrol altına alın, harcamalarınızı optimize edin.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
</p>

---

## ✨ Hakkında

**SubTrack**, modern bir finansal yönetim aracıdır. Netflix, Spotify, iCloud gibi onlarca dijital aboneliğinizi tek bir merkezden takip etmenizi, yaklaşan ödemelerden haberdar olmanızı ve aylık bütçenizi aşmamanızı sağlar. 

**Finora** tarafından geliştirilen bu ürün, minimalist tasarımı ve güçlü teknik altyapısı ile hem bireysel kullanıcılar hem de profesyoneller için tasarlanmıştır.

## 🌟 Öne Çıkan Özellikler

- **📊 Akıllı Dashboard:** Aylık toplam harcama, aktif abonelik sayısı ve yaklaşan ödemelerin anlık özeti.
- **🔔 Bildirim Merkezi:** Ödemesine 3 gün ve daha az kalan abonelikler için otomatik uyarı sistemi.
- **🛡️ Harcama Limitleri:** Aylık bütçe sınırı belirleme ve görsel ilerleme çubuğu (Progress Bar) ile bütçe kontrolü.
- **⚙️ Kişiselleştirme:** Para birimi seçimi (₺, $, €) ve profil yönetimi.
- **📱 Tam Responsive:** Mobil, tablet ve masaüstü cihazlarla %100 uyumlu tasarım.
- **🌑 Modern UI/UX:** Radix UI ve Framer Motion ile akıcı animasyonlar ve "premium" hissettiren arayüz.

## 🛠️ Teknoloji Yığını

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Veritabanı:** PostgreSQL (Neon Tech), Prisma ORM
- **Animasyon:** Framer Motion (Motion)
- **Bileşenler:** Radix UI (Popover, Dropdown, Accordion, Progress)
- **Doğrulama:** Zod

## 🚀 Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1. **Depoyu klonlayın:**
   ```bash
   git clone https://github.com/Finoraaa/SubTrack
   cd SubTrack
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Çevresel değişkenleri ayarlayın:**
   `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli bilgileri doldurun:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   CRON_SECRET="your_secret_key"
   ```

4. **Veritabanını hazırlayın:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Uygulamayı başlatın:**
   ```bash
   npm run dev
   ```

## 📈 Proje Yapısı

```text
├── prisma/             # Veritabanı şeması
├── public/             # Statik varlıklar (Logo, vb.)
├── src/
│   ├── components/     # UI Bileşenleri (Shadcn/Radix)
│   ├── lib/            # Singleton servisler (Prisma Client)
│   ├── App.tsx         # Ana uygulama ve Routing
│   └── main.tsx        # Entry point
├── server.ts           # Express API Sunucusu
└── vercel.json         # Cron Job yapılandırması
```


---

<p align="center">
  Made with ❤️ by <strong>Finora</strong>
</p>
