# Panduan Setup Admin Panel

## Masalah: Route `/admin` Tidak Bisa Dibuka

Jika route `/admin` tidak bisa dibuka, kemungkinan besar penyebabnya adalah:

1. **User belum memiliki role admin di database** (paling umum)
2. **User belum login** 
3. **Error saat memeriksa session atau role**

## Solusi

### Langkah 1: Pastikan User Sudah Terdaftar

Pastikan user yang ingin dijadikan admin sudah terdaftar di sistem:
- User harus sudah mendaftar/login melalui halaman `/auth`
- User harus ada di tabel `auth.users` di Supabase

### Langkah 2: Berikan Role Admin kepada User

Ada beberapa cara untuk memberikan role admin:

#### Cara 1: Menggunakan SQL Editor di Supabase Dashboard (Disarankan)

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka **SQL Editor**
4. Jalankan query berikut (ganti `your-email@example.com` dengan email user yang ingin dijadikan admin):

```sql
-- Berikan role admin berdasarkan email
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id as user_id,
  'admin'::app_role as role
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

5. Verifikasi dengan query ini:

```sql
-- Cek role user
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com';
```

#### Cara 2: Menggunakan File SQL Helper

1. Buka file `supabase/create-admin-user.sql`
2. Edit email user di query
3. Jalankan query di Supabase SQL Editor

### Langkah 3: Test Akses Admin

1. Login dengan email user yang sudah diberikan role admin di `/admin/login`
2. Jika berhasil, Anda akan diarahkan ke `/admin`
3. Jika masih error, cek console browser untuk melihat error message

## Troubleshooting

### Error: "Anda tidak memiliki akses admin"

**Penyebab:** User belum memiliki role admin di database

**Solusi:** Ikuti Langkah 2 di atas untuk memberikan role admin

### Error: "Terjadi kesalahan saat memeriksa akses"

**Penyebab:** 
- Masalah dengan RLS (Row Level Security) policy
- Database connection error
- Query error

**Solusi:**
1. Cek console browser untuk error detail
2. Pastikan RLS policy sudah aktif dan benar
3. Pastikan user sudah terdaftar di `auth.users`
4. Pastikan tabel `user_roles` sudah ada dan memiliki data

### Error: "Silakan login terlebih dahulu"

**Penyebab:** User belum login atau session sudah expired

**Solusi:**
1. Login terlebih dahulu di `/admin/login`
2. Pastikan session tidak expired
3. Cek apakah cookies/localStorage masih ada

## Struktur Database

### Tabel `user_roles`

Tabel ini menyimpan role untuk setiap user:

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL, -- 'admin' atau 'user'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
```

### RLS Policies

- **Users can view their own roles**: User bisa melihat role mereka sendiri
- **Admins can manage all roles**: Admin bisa mengelola semua role

## Catatan Penting

1. **Default Role**: Setiap user baru secara otomatis mendapat role 'user'
2. **Multiple Roles**: User bisa memiliki multiple roles (user dan admin)
3. **RLS Policy**: RLS policy memastikan user hanya bisa melihat role mereka sendiri, kecuali mereka adalah admin
4. **Security**: Pastikan hanya user terpercaya yang diberikan role admin

## Verifikasi Setup

Setelah memberikan role admin, verifikasi dengan:

1. **Cek di Database:**
```sql
SELECT 
  u.email,
  ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

2. **Test Login:**
   - Buka `/admin/login`
   - Login dengan email user yang sudah diberikan role admin
   - Seharusnya bisa mengakses `/admin`

3. **Cek Console:**
   - Buka Developer Tools (F12)
   - Cek tab Console untuk error messages
   - Cek tab Network untuk API calls

## Bantuan Lebih Lanjut

Jika masih mengalami masalah:
1. Cek error messages di console browser
2. Cek Supabase logs di dashboard
3. Pastikan semua migration sudah dijalankan
4. Pastikan RLS policies sudah aktif

