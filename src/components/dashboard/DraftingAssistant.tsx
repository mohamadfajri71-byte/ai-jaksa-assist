import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Save, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DraftingAssistantProps {
  userId: string;
}

interface Draft {
  id: string;
  title: string;
  draft_type: string;
  content: string;
  case_description: string;
  status: string;
  created_at: string;
}

const DraftingAssistant = ({ userId }: DraftingAssistantProps) => {
  const { toast } = useToast();
  const [draftType, setDraftType] = useState<string>("dakwaan");
  const [title, setTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myDrafts, setMyDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const { data, error } = await supabase
      .from("legal_drafts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setMyDrafts(data);
    }
  };

  const handleGenerate = async () => {
    if (!caseDescription.trim()) {
      toast({
        title: "Deskripsi Kosong",
        description: "Silakan masukkan deskripsi kasus terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("draft-assistant", {
        body: { draftType, caseDescription },
      });

      if (error) throw error;

      setGeneratedContent(data.content || "");
      toast({
        title: "Draft Berhasil Dibuat",
        description: "Silakan tinjau dan edit draft sesuai kebutuhan.",
      });
    } catch (error: any) {
      console.error("Draft generation error:", error);
      toast({
        title: "Pembuatan Draft Gagal",
        description: error.message || "Terjadi kesalahan saat membuat draft.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !generatedContent.trim()) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Judul dan konten draft harus diisi.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("legal_drafts").insert({
        user_id: userId,
        title,
        draft_type: draftType,
        content: generatedContent,
        case_description: caseDescription,
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "Draft Tersimpan",
        description: "Draft Anda telah berhasil disimpan.",
      });

      // Reset form
      setTitle("");
      setCaseDescription("");
      setGeneratedContent("");
      loadDrafts();
    } catch (error: any) {
      toast({
        title: "Penyimpanan Gagal",
        description: error.message || "Terjadi kesalahan saat menyimpan draft.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asisten Draf Dokumen Hukum</CardTitle>
          <CardDescription>
            Buat kerangka dakwaan, requisitoir, atau analisis yuridis secara otomatis dengan bantuan AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="draftType">Jenis Dokumen</Label>
            <Select value={draftType} onValueChange={setDraftType}>
              <SelectTrigger id="draftType">
                <SelectValue placeholder="Pilih jenis dokumen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dakwaan">Dakwaan</SelectItem>
                <SelectItem value="requisitoir">Requisitoir (Tuntutan)</SelectItem>
                <SelectItem value="analisis">Analisis Yuridis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Draft</Label>
            <Input
              id="title"
              placeholder="Misal: Dakwaan Kasus Korupsi Pengadaan..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseDesc">Deskripsi Kasus</Label>
            <Textarea
              id="caseDesc"
              placeholder="Jelaskan detail kasus, fakta-fakta, dan informasi relevan lainnya..."
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Membuat Draft...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Buat Draft
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Draft yang Dihasilkan</CardTitle>
            <CardDescription>
              Tinjau dan edit draft sesuai kebutuhan sebelum menyimpan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Draft
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {myDrafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Draft Saya</CardTitle>
            <CardDescription>5 draft terbaru Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setTitle(draft.title);
                    setDraftType(draft.draft_type);
                    setCaseDescription(draft.case_description || "");
                    setGeneratedContent(draft.content);
                  }}
                >
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{draft.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(draft.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded capitalize">
                    {draft.draft_type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DraftingAssistant;