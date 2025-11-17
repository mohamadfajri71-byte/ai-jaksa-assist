import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Case {
  id: string;
  case_number: string;
  case_name: string;
  stage: string;
}

interface AICAFlowUploadProps {
  cases: Case[];
  userRole: "staf" | "kasubsi" | "kasi";
  onUploadSuccess: () => void;
}

const documentTypes = [
  { value: "P-5", label: "P-5 - Laporan Hasil Penyelidikan" },
  { value: "P-8", label: "P-8 Umum - Surat Perintah Penyidikan" },
  { value: "P-16", label: "P-16 - Surat Perintah Penunjukan JPU" },
  { value: "P-42", label: "P-42 - Tuntutan" },
  { value: "BA-1", label: "BA-1 - Berita Acara Pemeriksaan Saksi" },
  { value: "BA-2", label: "BA-2 - Berita Acara Pemeriksaan Terdakwa" },
  { value: "SPDP", label: "SPDP - Surat Pemberitahuan Dimulainya Penyidikan" },
  { value: "OTHER", label: "Dokumen Lainnya" },
];

const AICAFlowUpload = ({ cases, userRole, onUploadSuccess }: AICAFlowUploadProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCase || !documentType || !file) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Silakan lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('case-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get file URL
      const { data: { publicUrl } } = supabase.storage
        .from('case-documents')
        .getPublicUrl(fileName);

      // In production, save to database
      // For now, just show success
      toast({
        title: "Dokumen Berhasil Diunggah",
        description: "Dokumen telah diunggah dan siap untuk review",
      });

      // Reset form
      setSelectedCase("");
      setDocumentType("");
      setDocumentName("");
      setNotes("");
      setFile(null);
      
      onUploadSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengunggah dokumen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Dokumen Baru
          </CardTitle>
          <CardDescription>
            Unggah dokumen perkara untuk ditinjau oleh Kasubsi dan Kasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Case Selection */}
            <div className="space-y-2">
              <Label htmlFor="case">Pilih Perkara *</Label>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih perkara" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((caseItem) => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.case_number} - {caseItem.case_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType">Jenis Dokumen *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis dokumen" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="documentName">Nama Dokumen *</Label>
              <Input
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Contoh: Laporan Hasil Penyelidikan Perkara ABC"
                required
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">File Dokumen *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="flex-1"
                  required
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Format yang didukung: PDF, DOC, DOCX (Maks. 10MB)
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan atau keterangan tentang dokumen ini"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={uploading} className="flex-1">
                {uploading ? "Mengunggah..." : "Unggah & Ajukan Review"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Butuh Bantuan Menyusun Dokumen?</CardTitle>
          <CardDescription>
            Gunakan fitur AICA untuk membantu menyusun draf dokumen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start"
              onClick={() => navigate("/dashboard/draft")}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Asisten Draf Perkara</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Buat draf dokumen dengan bantuan AI
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start"
              onClick={() => navigate("/dashboard/search")}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Cari Referensi</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Cari yurisprudensi dan regulasi terkait
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICAFlowUpload;

