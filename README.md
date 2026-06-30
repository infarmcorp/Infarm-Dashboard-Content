# Infarm Social Media Dashboard (Live)

Dashboard TikTok + Instagram yang narik data otomatis dari Windsor.ai setiap kali dibuka.

## Struktur

```
infarm-dashboard/
├── api/
│   └── data.js      ← serverless function: fetch data Windsor.ai pakai API key (aman, di server)
├── public/
│   └── index.html   ← dashboard yang tampil ke user, fetch ke /api/data
├── package.json
├── vercel.json
└── .gitignore
```

## Cara Deploy (sekali saja)

### 1. Push ke GitHub
```
cd infarm-dashboard
git init
git add .
git commit -m "Initial dashboard"
git branch -M main
git remote add origin https://github.com/USERNAME/infarm-dashboard.git
git push -u origin main
```
(Ganti USERNAME dengan username GitHub kamu. Bisa juga lewat GitHub Desktop kalau tidak familiar dengan command line.)

### 2. Import ke Vercel
1. Buka vercel.com → New Project
2. Pilih repo `infarm-dashboard` dari GitHub
3. Klik Deploy (biarkan setting default)

### 3. Set API Key Windsor.ai (WAJIB sebelum data muncul)
1. Di project Vercel → Settings → Environment Variables
2. Tambah variable baru:
   - **Name**: `WINDSOR_API_KEY`
   - **Value**: (paste API key Windsor.ai kamu di sini — JANGAN taruh di kode atau commit ke GitHub)
   - **Environment**: pilih semua (Production, Preview, Development)
3. Save
4. Ke tab Deployments → klik titik tiga di deployment terakhir → **Redeploy** (supaya env var ke-load)

### 4. Selesai
Buka URL project Vercel kamu (contoh: `infarm-dashboard.vercel.app`) — dashboard akan otomatis fetch data terbaru dari Windsor.ai setiap kali dibuka/direfresh.

## Cara Update Tampilan Dashboard Nanti
Edit `public/index.html`, commit, push ke GitHub — Vercel otomatis re-deploy dalam ~30 detik.

## Troubleshooting
- **Banner "Gagal memuat data..." muncul**: cek apakah `WINDSOR_API_KEY` sudah di-set di Vercel Environment Variables, lalu redeploy.
- **Data Instagram kosong tapi TikTok muncul**: field ID Instagram di `api/data.js` (bagian `instagram.dailyFields` / `contentFields`) mungkin perlu disesuaikan — cek nama field asli di dashboard Windsor.ai.
- **CORS / network error**: pastikan fetch dipanggil dari domain yang sama (otomatis aman karena `/api/data` adalah relative path di domain Vercel yang sama).
