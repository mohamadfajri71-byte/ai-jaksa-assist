-- Script untuk memberikan role admin kepada user yang sudah ada
-- 
-- Cara penggunaan:
-- 1. Login ke Supabase Dashboard
-- 2. Buka SQL Editor
-- 3. Jalankan query ini untuk melihat semua user:
--    SELECT id, email FROM auth.users;
-- 4. Ganti USER_EMAIL_HERE dengan email user yang ingin dijadikan admin
-- 5. Jalankan script ini

-- Method 1: Memberikan role admin berdasarkan email user
-- Ganti 'your-email@example.com' dengan email user yang ingin dijadikan admin
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id as user_id,
  'admin'::app_role as role
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Method 2: Memberikan role admin berdasarkan user_id
-- Ganti 'USER_ID_HERE' dengan UUID user yang ingin dijadikan admin
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Verifikasi: Cek apakah role admin sudah diberikan
-- SELECT 
--   u.email,
--   ur.role,
--   ur.created_at
-- FROM auth.users u
-- LEFT JOIN public.user_roles ur ON u.id = ur.user_id
-- WHERE u.email = 'your-email@example.com';

-- Catatan: 
-- - Pastikan user sudah terdaftar di auth.users terlebih dahulu
-- - Jika user sudah punya role 'user', query ini akan menambahkan role 'admin' (bukan mengganti)
-- - ON CONFLICT DO NOTHING memastikan tidak ada error jika role sudah ada

