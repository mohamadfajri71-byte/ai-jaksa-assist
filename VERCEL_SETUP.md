# Setup Vercel untuk Fix Error 404

## Masalah
Route `/admin` menghasilkan error 404 di production (`https://www.aica.web.id/admin`).

## Solusi

File `vercel.json` sudah dibuat dan dikonfigurasi dengan benar. Ikuti langkah berikut:

### 1. Pastikan File `vercel.json` Ada di Root Project

File `vercel.json` harus ada di root folder project (sama level dengan `package.json`).

### 2. Push ke Git Repository

```bash
git add vercel.json
git commit -m "Add Vercel configuration for SPA routing"
git push
```

### 3. Deploy di Vercel

**Jika project sudah terhubung ke Vercel:**
- Vercel akan otomatis detect perubahan dan redeploy
- Tunggu deployment selesai

**Jika project belum terhubung:**
1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik "Add New Project"
3. Import repository dari GitHub/GitLab
4. Vercel akan otomatis detect:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Klik "Deploy"

### 4. Verifikasi Konfigurasi di Vercel Dashboard

Setelah deploy, pastikan konfigurasi di Vercel Dashboard:

1. Buka project di Vercel Dashboard
2. Settings → General
3. Pastikan:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. Settings → Redirects
   - Vercel akan otomatis menggunakan `vercel.json`
   - Atau pastikan ada redirect: `/(.*) → /index.html` dengan status 200

### 5. Test

Setelah deployment selesai:
1. Buka `https://www.aica.web.id/admin`
2. Seharusnya tidak ada error 404
3. Halaman admin akan muncul (atau redirect ke login jika belum login)

## Konfigurasi `vercel.json`

File `vercel.json` yang sudah dibuat berisi:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Penjelasan:**
- `rewrites`: Mengarahkan semua route ke `index.html` untuk SPA routing
- `buildCommand`: Command untuk build project
- `outputDirectory`: Folder output setelah build (default Vite adalah `dist`)
- `headers`: Optimasi cache untuk static assets

## Troubleshooting

### Masih Error 404 Setelah Deploy

1. **Cek apakah `vercel.json` ada di root:**
   ```bash
   ls -la vercel.json
   ```

2. **Cek deployment logs di Vercel Dashboard:**
   - Buka project → Deployments → Pilih deployment terbaru
   - Cek apakah ada error saat build

3. **Clear cache dan redeploy:**
   - Settings → General → Clear Build Cache
   - Redeploy project

4. **Cek Environment Variables:**
   - Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` sudah dikonfigurasi
   - Settings → Environment Variables

### Build Error

Jika ada error saat build:
1. Test build lokal:
   ```bash
   npm run build
   ```
2. Cek apakah ada error di output
3. Pastikan semua dependencies terinstall:
   ```bash
   npm install
   ```

### Route Bekerja Tapi Asset (CSS/JS) 404

Pastikan base path di `vite.config.ts` sudah benar (default adalah `/`):
```typescript
export default defineConfig({
  base: '/',  // Pastikan ini sesuai
  // ...
});
```

## Custom Domain

Jika menggunakan custom domain (`aica.web.id`):

1. **Tambah domain di Vercel:**
   - Settings → Domains
   - Add domain: `aica.web.id` dan `www.aica.web.id`

2. **Update DNS:**
   - Tambahkan A record atau CNAME record sesuai instruksi Vercel
   - Biasanya:
     - Type: CNAME
     - Name: `@` atau `www`
     - Value: `cname.vercel-dns.com`

3. **Tunggu DNS propagation** (bisa beberapa menit sampai 24 jam)

## Environment Variables

Pastikan environment variables sudah dikonfigurasi di Vercel:

1. Settings → Environment Variables
2. Tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Pilih environment: Production, Preview, Development
4. Redeploy setelah menambah environment variables

## Tips

1. **Auto-deploy:** Vercel akan otomatis deploy setiap push ke branch utama
2. **Preview deployments:** Setiap pull request akan dapat preview URL
3. **Analytics:** Aktifkan Vercel Analytics untuk monitoring
4. **Speed Insights:** Aktifkan untuk melihat performance

## Verifikasi Setup

Setelah semua langkah:

1. ✅ File `vercel.json` ada di root project
2. ✅ Code sudah di-push ke Git
3. ✅ Project sudah terhubung ke Vercel
4. ✅ Build command: `npm run build`
5. ✅ Output directory: `dist`
6. ✅ Environment variables sudah dikonfigurasi
7. ✅ Custom domain sudah dikonfigurasi (jika menggunakan)

Test dengan membuka:
- `https://www.aica.web.id/admin` → Seharusnya tidak 404
- `https://www.aica.web.id/dashboard` → Seharusnya tidak 404
- Route lainnya → Seharusnya tidak 404

## Bantuan Lebih Lanjut

Jika masih mengalami masalah:
1. Cek [Vercel Documentation](https://vercel.com/docs)
2. Cek deployment logs di Vercel Dashboard
3. Test build lokal untuk memastikan tidak ada error
4. Cek Network tab di browser untuk melihat request yang gagal

