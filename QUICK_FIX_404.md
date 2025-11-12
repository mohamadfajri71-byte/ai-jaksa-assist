# Quick Fix: Error 404 di Production

## Masalah
Mengakses `https://www.aica.web.id/admin` menghasilkan error 404.

## Penyebab
Server tidak dikonfigurasi untuk SPA routing. Semua route harus diarahkan ke `index.html`.

## Solusi Cepat

### Jika menggunakan Apache (cPanel, Shared Hosting)
1. Pastikan file `.htaccess` ada di root folder website (folder `public/` sudah ada)
2. Rebuild dan redeploy:
   ```bash
   npm run build
   ```
3. Upload folder `dist/` ke server
4. Pastikan file `.htaccess` ikut ter-upload ke root folder

### Jika menggunakan Netlify / Cloudflare Pages
1. File `_redirects` sudah dibuat di folder `public/`
2. Rebuild dan redeploy - file akan otomatis digunakan

### Jika menggunakan Vercel
1. File `vercel.json` sudah dibuat di root
2. Push ke Git dan Vercel akan otomatis deploy

### Jika menggunakan Nginx
1. Edit konfigurasi Nginx
2. Tambahkan: `try_files $uri $uri/ /index.html;`
3. Lihat contoh di `nginx.conf.example`

## Langkah Selanjutnya

1. **Identifikasi platform hosting Anda**
2. **Pilih file konfigurasi yang sesuai:**
   - Apache → `.htaccess` (di folder `public/`)
   - Netlify/Cloudflare → `_redirects` (di folder `public/`)
   - Vercel → `vercel.json` (di root)
   - Nginx → lihat `nginx.conf.example`
   - IIS → `web.config` (di folder `public/`)

3. **Rebuild dan redeploy:**
   ```bash
   npm run build
   ```
   Upload folder `dist/` ke server

4. **Test:**
   - Buka `https://www.aica.web.id/admin`
   - Seharusnya tidak ada error 404

## File yang Sudah Dibuat

✅ `public/.htaccess` - untuk Apache
✅ `public/_redirects` - untuk Netlify/Cloudflare Pages
✅ `public/web.config` - untuk IIS
✅ `vercel.json` - untuk Vercel
✅ `nginx.conf.example` - contoh untuk Nginx

**Catatan:** File di folder `public/` akan otomatis di-copy ke `dist/` saat build.

## Masih Error?

Lihat file `DEPLOYMENT.md` untuk panduan lengkap dan troubleshooting.

