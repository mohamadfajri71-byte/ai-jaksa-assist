# Panduan Deployment dan Fix Error 404

## Masalah: Error 404 di Production

Ketika mengakses route seperti `/admin` di production (`https://www.aica.web.id/admin`), Anda mendapat error 404. Ini terjadi karena server tidak dikonfigurasi untuk **Single Page Application (SPA) routing**.

## Penjelasan

React Router menggunakan **client-side routing**, yang berarti routing dilakukan di browser, bukan di server. Ketika Anda mengakses `/admin` langsung:

1. Browser meminta file `/admin` dari server
2. Server mencari file `/admin` di filesystem
3. File tidak ada → Server mengembalikan 404
4. React Router tidak pernah dimuat

**Solusi:** Server harus dikonfigurasi untuk mengarahkan semua route ke `index.html`, sehingga React Router bisa menangani routing.

## Solusi Berdasarkan Platform Hosting

### 1. Apache (cPanel, Shared Hosting, dll)

File `.htaccess` sudah dibuat di folder `public/`. Pastikan file ini ikut ter-deploy ke server.

**Cara deploy:**
1. Build aplikasi: `npm run build`
2. Upload folder `dist/` ke server
3. Pastikan file `.htaccess` ada di root folder public_html

**Verifikasi:**
- File `.htaccess` harus ada di root folder website Anda
- Pastikan mod_rewrite sudah aktif di Apache

### 2. Netlify / Cloudflare Pages

File `_redirects` sudah dibuat di folder `public/`. File ini akan otomatis digunakan.

**Cara deploy:**
1. Build aplikasi: `npm run build`
2. Deploy folder `dist/` ke Netlify/Cloudflare Pages
3. File `_redirects` akan otomatis digunakan

**Atau** konfigurasi di dashboard:
- **Netlify:** Settings → Build & deploy → Redirects → Add rule: `/* /index.html 200`
- **Cloudflare Pages:** Functions → Redirects → Add: `/* /index.html 200`

### 3. Vercel

File `vercel.json` sudah dibuat di root project.

**Cara deploy:**
1. Push code ke Git (GitHub/GitLab)
2. Connect repository ke Vercel
3. Vercel akan otomatis menggunakan `vercel.json`

**Atau** konfigurasi di dashboard Vercel:
- Settings → Redirects → Add: Source: `/(.*)`, Destination: `/index.html`, Status: 200

### 4. Nginx

Gunakan file `nginx.conf.example` sebagai referensi.

**Cara setup:**
1. Edit file konfigurasi Nginx (biasanya `/etc/nginx/sites-available/default`)
2. Tambahkan konfigurasi dari `nginx.conf.example`
3. Restart Nginx: `sudo systemctl restart nginx`

**Konfigurasi penting:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 5. Cloudflare (jika menggunakan Cloudflare sebagai CDN)

Jika menggunakan Cloudflare sebagai proxy:
1. Buat Page Rule: URL Pattern: `*aica.web.id/*`
2. Setting: Forwarding URL → 301 Redirect → `https://www.aica.web.id/index.html`
3. **ATAU** gunakan Cloudflare Workers untuk rewrite

**Catatan:** Jika menggunakan Cloudflare Pages, gunakan file `_redirects` seperti di atas.

### 6. IIS (Windows Server)

Buat file `web.config` di root folder:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Verifikasi Setup

Setelah mengkonfigurasi server:

1. **Test di browser:**
   - Buka `https://www.aica.web.id/admin`
   - Seharusnya tidak ada error 404
   - Halaman admin seharusnya muncul (atau redirect ke login jika belum login)

2. **Test dengan curl:**
   ```bash
   curl -I https://www.aica.web.id/admin
   ```
   - Seharusnya return 200, bukan 404

3. **Test di Network tab:**
   - Buka Developer Tools → Network
   - Refresh halaman `/admin`
   - Cek apakah `index.html` di-load, bukan error 404

## Troubleshooting

### Masih Error 404 Setelah Setup

1. **Pastikan file konfigurasi ada di root:**
   - `.htaccess` untuk Apache
   - `_redirects` untuk Netlify/Cloudflare
   - `vercel.json` untuk Vercel

2. **Pastikan file ikut ter-deploy:**
   - File di folder `public/` akan otomatis ikut saat build
   - Pastikan file tidak di-ignore oleh `.gitignore`

3. **Clear cache:**
   - Clear browser cache
   - Clear CDN cache (jika menggunakan Cloudflare)
   - Hard refresh: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)

4. **Cek server logs:**
   - Apache: `/var/log/apache2/error.log`
   - Nginx: `/var/log/nginx/error.log`
   - Cek apakah ada error terkait rewrite rules

### Error 500 Internal Server Error

- **Apache:** Pastikan mod_rewrite sudah aktif
  ```bash
  sudo a2enmod rewrite
  sudo systemctl restart apache2
  ```

- **Nginx:** Pastikan konfigurasi syntax benar
  ```bash
  sudo nginx -t  # Test konfigurasi
  ```

### Route Bekerja Tapi Asset (CSS/JS) 404

Pastikan base path di `vite.config.ts` sudah benar:
```typescript
export default defineConfig({
  base: '/',  // Pastikan ini sesuai dengan deployment path
  // ...
});
```

## Catatan Penting

1. **Build sebelum deploy:**
   ```bash
   npm run build
   ```
   Folder `dist/` adalah yang harus di-deploy, bukan folder `src/`.

2. **Environment variables:**
   Pastikan environment variables (seperti `VITE_SUPABASE_URL`) sudah dikonfigurasi di platform hosting.

3. **HTTPS:**
   Pastikan website menggunakan HTTPS untuk keamanan, terutama untuk autentikasi.

## Platform Hosting yang Disarankan

- **Vercel:** Paling mudah untuk React apps, auto-configure
- **Netlify:** Mudah, support file `_redirects`
- **Cloudflare Pages:** Gratis, cepat, support `_redirects`
- **Apache/Nginx:** Fleksibel, perlu konfigurasi manual

## Bantuan Lebih Lanjut

Jika masih mengalami masalah:
1. Cek platform hosting Anda di daftar di atas
2. Pastikan file konfigurasi sesuai platform
3. Cek server logs untuk error detail
4. Test dengan curl untuk melihat response server

