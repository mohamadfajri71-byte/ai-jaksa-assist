-- Create cases table for Pidsus case management
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  case_name TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('LID', 'DIK', 'PRATUT', 'TUT', 'EKSEKUSI')),
  assigned_to UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  suspect_name TEXT
);

-- Create case_documents table for document workflow
CREATE TABLE public.case_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review_kasubsi', 'pending_approval_kasi', 'revision_required', 'completed')),
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases
CREATE POLICY "Users can view cases assigned to them"
ON public.cases FOR SELECT
USING (
  auth.uid() = assigned_to OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create cases"
ON public.cases FOR INSERT
WITH CHECK (auth.uid() = assigned_to);

CREATE POLICY "Users can update their cases"
ON public.cases FOR UPDATE
USING (
  auth.uid() = assigned_to OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete cases"
ON public.cases FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for case_documents
CREATE POLICY "Users can view documents for their cases"
ON public.case_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_documents.case_id
    AND (cases.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can upload documents to their cases"
ON public.case_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_documents.case_id
    AND cases.assigned_to = auth.uid()
  ) AND uploaded_by = auth.uid()
);

CREATE POLICY "Users can update documents they uploaded"
ON public.case_documents FOR UPDATE
USING (
  uploaded_by = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete documents"
ON public.case_documents FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_documents_updated_at
BEFORE UPDATE ON public.case_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for case documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-documents', 'case-documents', false);

-- Storage policies for case-documents bucket
CREATE POLICY "Users can upload documents to their cases"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'case-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view documents for their cases"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'case-documents' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Users can update their documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'case-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'case-documents' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);