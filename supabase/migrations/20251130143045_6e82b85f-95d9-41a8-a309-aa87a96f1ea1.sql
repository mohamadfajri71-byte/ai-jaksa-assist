-- Create temp_files table for temporary cloud storage
CREATE TABLE public.temp_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.temp_files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create temp files
CREATE POLICY "Users can create temp files"
ON public.temp_files
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

-- Policy: Users can view their own temp files
CREATE POLICY "Users can view own temp files"
ON public.temp_files
FOR SELECT
USING (auth.uid() = uploaded_by);

-- Policy: Anyone can view temp files with valid code (for download)
CREATE POLICY "Anyone can view temp files by code"
ON public.temp_files
FOR SELECT
USING (expires_at > now() AND download_count < max_downloads);

-- Policy: Users can update their own temp files
CREATE POLICY "Users can update own temp files"
ON public.temp_files
FOR UPDATE
USING (auth.uid() = uploaded_by);

-- Policy: Users can delete their own temp files
CREATE POLICY "Users can delete own temp files"
ON public.temp_files
FOR DELETE
USING (auth.uid() = uploaded_by);

-- Create index for faster code lookups
CREATE INDEX idx_temp_files_share_code ON public.temp_files(share_code);

-- Create index for cleanup of expired files
CREATE INDEX idx_temp_files_expires_at ON public.temp_files(expires_at);

-- Function to generate random 3-digit code
CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 3-digit code (000-999)
    new_code := LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM public.temp_files 
      WHERE share_code = new_code 
      AND expires_at > now()
    ) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create storage bucket for temp files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temp-files',
  'temp-files',
  false,
  52428800, -- 50MB in bytes
  NULL -- Allow all file types
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for temp-files bucket
CREATE POLICY "Users can upload temp files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'temp-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own temp files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'temp-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own temp files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'temp-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);