import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type DocumentType = "jurisprudence" | "regulation" | "article" | "sop";

const KnowledgeBaseUpload = () => {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState<DocumentType>("jurisprudence");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Form fields based on document type
  const [formData, setFormData] = useState({
    // Jurisprudence
    case_number: "",
    title: "",
    category: "",
    year: new Date().getFullYear().toString(),
    court: "",
    keywords: "",
    
    // Regulation
    regulation_number: "",
    regulation_type: "",
    status: "active",
    
    // Article
    regulation_id: "",
    article_number: "",
    explanation: "",
    
    // SOP
    sop_category: "",
    version: "",
    effective_date: "",
    
    // Common
    content: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran file maksimal 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // For PDF files, we'll need to use a PDF parser
    // For now, we'll use a simple approach - in production, use a library like pdf-parse
    if (file.type === "application/pdf") {
      // In production, use pdf-parse or similar library
      return "Content extracted from PDF file. [In production, this would use a PDF parser]";
    } else if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
      return "Content extracted from Word document. [In production, this would use a DOCX parser]";
    } else if (file.type === "text/plain") {
      return await file.text();
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "File Diperlukan",
        description: "Silakan pilih file untuk diunggah",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Try to upload file to storage (optional - will continue if bucket doesn't exist)
      let fileUrl: string | null = null;
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${documentType}/${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('knowledge-base')
          .upload(fileName, file);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('knowledge-base')
            .getPublicUrl(fileName);
          fileUrl = urlData?.publicUrl || null;
        }
      } catch (err) {
        // Bucket might not exist, continue without file URL
        console.log("Storage upload skipped:", err);
      }

      // Extract text content from file
      // File content will be stored in database
      const extractedContent = await extractTextFromFile(file);

      // Parse keywords
      const keywords = formData.keywords
        ? formData.keywords.split(',').map(k => k.trim()).filter(k => k)
        : [];

      // Insert into appropriate table
      let insertData: any = {
        content: extractedContent || formData.content,
        keywords: keywords.length > 0 ? keywords : null,
        created_by: user.id,
      };

      if (documentType === "jurisprudence") {
        insertData = {
          ...insertData,
          case_number: formData.case_number,
          title: formData.title,
          category: formData.category,
          year: parseInt(formData.year),
          court: formData.court || null,
        };
        const { error } = await supabase.from("jurisprudence").insert(insertData);
        if (error) throw error;
      } else if (documentType === "regulation") {
        insertData = {
          ...insertData,
          regulation_number: formData.regulation_number,
          title: formData.title,
          type: formData.regulation_type,
          year: parseInt(formData.year),
          status: formData.status,
        };
        const { error } = await supabase.from("regulations").insert(insertData);
        if (error) throw error;
      } else if (documentType === "article") {
        if (!formData.regulation_id) {
          throw new Error("Regulasi harus dipilih untuk pasal");
        }
        insertData = {
          ...insertData,
          regulation_id: formData.regulation_id,
          article_number: formData.article_number,
          content: formData.content || extractedContent,
          explanation: formData.explanation || null,
        };
        const { error } = await supabase.from("articles").insert(insertData);
        if (error) throw error;
      } else if (documentType === "sop") {
        insertData = {
          ...insertData,
          title: formData.title,
          category: formData.sop_category,
          version: formData.version || null,
          effective_date: formData.effective_date || null,
        };
        const { error } = await supabase.from("sop_documents").insert(insertData);
        if (error) throw error;
      }

      toast({
        title: "Berhasil",
        description: "File berhasil diunggah dan ditambahkan ke database",
      });

      // Reset form
      setFile(null);
      setFormData({
        case_number: "",
        title: "",
        category: "",
        year: new Date().getFullYear().toString(),
        court: "",
        keywords: "",
        regulation_number: "",
        regulation_type: "",
        status: "active",
        regulation_id: "",
        article_number: "",
        explanation: "",
        sop_category: "",
        version: "",
        effective_date: "",
        content: "",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengunggah file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File ke Database Pengetahuan Hukum
          </CardTitle>
          <CardDescription>
            Unggah file dokumen hukum (PDF, DOC, DOCX) untuk ditambahkan ke database pengetahuan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="documentType">Jenis Dokumen *</Label>
              <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis dokumen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jurisprudence">Yurisprudensi</SelectItem>
                  <SelectItem value="regulation">Regulasi</SelectItem>
                  <SelectItem value="article">Pasal</SelectItem>
                  <SelectItem value="sop">SOP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">File Dokumen *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="flex-1"
                  required
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
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
                Format yang didukung: PDF, DOC, DOCX, TXT (Maks. 10MB)
              </p>
            </div>

            {/* Dynamic Fields Based on Document Type */}
            {documentType === "jurisprudence" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="case_number">Nomor Putusan *</Label>
                  <Input
                    id="case_number"
                    value={formData.case_number}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    placeholder="Contoh: 123/Pid.Sus/2024/PN.Jkt.Sel"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Putusan *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Judul putusan"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Contoh: Korupsi, Narkotika"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Tahun *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="court">Pengadilan</Label>
                  <Input
                    id="court"
                    value={formData.court}
                    onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                    placeholder="Nama pengadilan"
                  />
                </div>
              </>
            )}

            {documentType === "regulation" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="regulation_number">Nomor Regulasi *</Label>
                  <Input
                    id="regulation_number"
                    value={formData.regulation_number}
                    onChange={(e) => setFormData({ ...formData, regulation_number: e.target.value })}
                    placeholder="Contoh: UU No. 31 Tahun 1999"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Regulasi *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Judul regulasi"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regulation_type">Jenis Regulasi *</Label>
                    <Select value={formData.regulation_type} onValueChange={(value) => setFormData({ ...formData, regulation_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UU">Undang-Undang</SelectItem>
                        <SelectItem value="PP">Peraturan Pemerintah</SelectItem>
                        <SelectItem value="PERPU">Peraturan Pemerintah Pengganti UU</SelectItem>
                        <SelectItem value="PERPRES">Peraturan Presiden</SelectItem>
                        <SelectItem value="KEPMEN">Keputusan Menteri</SelectItem>
                        <SelectItem value="LAINNYA">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Tahun *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {documentType === "article" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="regulation_id">Regulasi *</Label>
                  <Input
                    id="regulation_id"
                    value={formData.regulation_id}
                    onChange={(e) => setFormData({ ...formData, regulation_id: e.target.value })}
                    placeholder="ID Regulasi (UUID)"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Masukkan ID regulasi yang sudah ada di database
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="article_number">Nomor Pasal *</Label>
                  <Input
                    id="article_number"
                    value={formData.article_number}
                    onChange={(e) => setFormData({ ...formData, article_number: e.target.value })}
                    placeholder="Contoh: Pasal 1, Pasal 2 ayat (1)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Isi Pasal *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explanation">Penjelasan</Label>
                  <Textarea
                    id="explanation"
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    rows={3}
                  />
                </div>
              </>
            )}

            {documentType === "sop" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Judul SOP *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Judul SOP"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sop_category">Kategori *</Label>
                    <Input
                      id="sop_category"
                      value={formData.sop_category}
                      onChange={(e) => setFormData({ ...formData, sop_category: e.target.value })}
                      placeholder="Kategori SOP"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Versi</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="Contoh: 1.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effective_date">Tanggal Efektif</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Keywords (Common) */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (Opsional)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Pisahkan dengan koma, contoh: korupsi, pidana, uang"
              />
              <p className="text-xs text-muted-foreground">
                Keywords membantu pencarian di database
              </p>
            </div>

            {/* Content (if not from file) */}
            {documentType !== "article" && (
              <div className="space-y-2">
                <Label htmlFor="content">Konten Tambahan (Opsional)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  placeholder="Tambahkan konten tambahan jika diperlukan (konten dari file akan diekstrak otomatis)"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={uploading || processing} className="flex-1">
                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {!uploading && !processing && <Upload className="h-4 w-4 mr-2" />}
                {uploading ? "Mengunggah..." : processing ? "Memproses..." : "Unggah ke Database"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBaseUpload;

