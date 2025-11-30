import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Copy, Trash2, Clock, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface TempFile {
  id: string;
  share_code: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
  expires_at: string;
  download_count: number;
  max_downloads: number;
}

const TempCloud = () => {
  console.log("TempCloud component rendered");
  
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [shareCode, setShareCode] = useState<string>("");
  const [downloadCode, setDownloadCode] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [myFiles, setMyFiles] = useState<TempFile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyFiles = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("temp_files")
        .select("*")
        .eq("uploaded_by", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setMyFiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (50MB = 52428800 bytes)
      if (selectedFile.size > 52428800) {
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran file maksimal adalah 50MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Pilih File",
        description: "Silakan pilih file untuk diunggah",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate share code
      const { data: codeData, error: codeError } = await supabase
        .rpc("generate_share_code");
      
      if (codeError) throw codeError;
      const newShareCode = codeData;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('temp-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get file URL
      const { data: urlData } = supabase.storage
        .from('temp-files')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { error: insertError } = await supabase
        .from("temp_files")
        .insert({
          share_code: newShareCode,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          uploaded_by: user.id,
        });

      if (insertError) throw insertError;

      setShareCode(newShareCode);
      setFile(null);
      
      toast({
        title: "File Berhasil Diunggah",
        description: `Kode berbagi: ${newShareCode}`,
      });

      // Reload files list
      loadMyFiles();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengunggah file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadCode || downloadCode.length !== 3) {
      toast({
        title: "Kode Tidak Valid",
        description: "Masukkan kode 3 digit",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true);
    try {
      // Fetch file by share code
      const { data, error } = await supabase
        .from("temp_files")
        .select("*")
        .eq("share_code", downloadCode)
        .single();

      if (error) throw new Error("Kode tidak ditemukan atau file sudah kadaluarsa");

      // Check if file is still valid
      if (new Date(data.expires_at) < new Date()) {
        throw new Error("File sudah kadaluarsa");
      }

      if (data.download_count >= data.max_downloads) {
        throw new Error("Batas download sudah tercapai");
      }

      // Increment download count
      const { error: updateError } = await supabase
        .from("temp_files")
        .update({ download_count: data.download_count + 1 })
        .eq("id", data.id);

      if (updateError) throw updateError;

      // Download file
      window.open(data.file_url, '_blank');

      toast({
        title: "Download Dimulai",
        description: `File: ${data.file_name}`,
      });

      setDownloadCode("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const copyShareCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Kode Disalin",
      description: "Kode berbagi telah disalin ke clipboard",
    });
  };

  const deleteFile = async (fileId: string, fileUrl: string) => {
    try {
      // Delete from storage
      const filePath = fileUrl.split('/temp-files/').pop();
      if (filePath) {
        await supabase.storage.from('temp-files').remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from("temp_files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;

      toast({
        title: "File Dihapus",
        description: "File telah dihapus dari Temp Cloud",
      });

      loadMyFiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Temp Cloud</h1>
        <p className="text-muted-foreground">
          Berbagi file sementara dengan kode 3 digit. File otomatis terhapus setelah 24 jam.
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="download">Download File</TabsTrigger>
          <TabsTrigger value="my-files" onClick={loadMyFiles}>File Saya</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File Baru
              </CardTitle>
              <CardDescription>
                Upload file hingga 50MB dan dapatkan kode berbagi 3 digit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Pilih File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  Maksimal 50MB. File akan otomatis terhapus setelah 24 jam atau 10x download.
                </p>
              </div>

              {file && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? "Mengunggah..." : "Upload & Dapatkan Kode"}
              </Button>

              {shareCode && (
                <div className="p-4 border rounded-lg bg-primary/10 border-primary">
                  <p className="text-sm text-muted-foreground mb-2">Kode Berbagi:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-4xl font-bold text-primary">{shareCode}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyShareCode(shareCode)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Bagikan kode ini untuk memberikan akses download
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="download">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download File
              </CardTitle>
              <CardDescription>
                Masukkan kode 3 digit untuk download file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kode Berbagi (3 Digit)</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={3}
                  placeholder="000"
                  value={downloadCode}
                  onChange={(e) => setDownloadCode(e.target.value.replace(/\D/g, ''))}
                  disabled={downloading}
                  className="text-2xl text-center tracking-widest"
                />
              </div>

              <Button 
                onClick={handleDownload} 
                disabled={!downloadCode || downloading}
                className="w-full"
              >
                {downloading ? "Memproses..." : "Download File"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-files">
          <Card>
            <CardHeader>
              <CardTitle>File Saya</CardTitle>
              <CardDescription>
                Kelola file yang telah Anda upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Memuat...</p>
              ) : myFiles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada file yang diupload
                </p>
              ) : (
                <div className="space-y-4">
                  {myFiles.map((file) => (
                    <div key={file.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5" />
                            <h3 className="font-semibold">{file.file_name}</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Kode:</span>{" "}
                              <span className="text-primary font-bold">{file.share_code}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 ml-1"
                                onClick={() => copyShareCode(file.share_code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div>
                              <span className="font-medium">Ukuran:</span>{" "}
                              {formatFileSize(file.file_size)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Kadaluarsa: {formatDistanceToNow(new Date(file.expires_at), { addSuffix: true })}</span>
                            </div>
                            <div>
                              <span className="font-medium">Download:</span>{" "}
                              {file.download_count}/{file.max_downloads}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id, file.file_url)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TempCloud;