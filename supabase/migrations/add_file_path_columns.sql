-- Add file_path column to knowledge base tables
ALTER TABLE IF EXISTS public.jurisprudence
  ADD COLUMN IF NOT EXISTS file_path TEXT;

ALTER TABLE IF EXISTS public.regulations
  ADD COLUMN IF NOT EXISTS file_path TEXT;

ALTER TABLE IF EXISTS public.articles
  ADD COLUMN IF NOT EXISTS file_path TEXT;

ALTER TABLE IF EXISTS public.sop_documents
  ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Optional indexes for file_path lookups
CREATE INDEX IF NOT EXISTS idx_jurisprudence_file_path ON public.jurisprudence(file_path);
CREATE INDEX IF NOT EXISTS idx_regulations_file_path ON public.regulations(file_path);
CREATE INDEX IF NOT EXISTS idx_articles_file_path ON public.articles(file_path);
CREATE INDEX IF NOT EXISTS idx_sop_file_path ON public.sop_documents(file_path);

