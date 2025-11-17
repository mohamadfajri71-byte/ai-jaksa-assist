import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileText, Scale, BookOpen, Workflow, ArrowRight } from "lucide-react";
import AICAFlow from "./pidsus/AICAFlow";

const Pidsus = () => {
  const [showAICAFlow, setShowAICAFlow] = useState(false);

  if (showAICAFlow) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setShowAICAFlow(false)}
          className="mb-4"
        >
          ← Kembali ke Menu Pidsus
        </Button>
        <AICAFlow />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pidsus - Pidana Khusus</h1>
        <p className="text-muted-foreground">
          Modul untuk menangani kasus-kasus pidana khusus seperti korupsi, terorisme, narkotika, dan kejahatan lainnya.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AICA-Flow Card - Featured */}
        <Card className="md:col-span-2 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                <Workflow className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div>AICA-Flow</div>
                <CardDescription className="text-base">
                  Modul Alur Perkara & Disposisi
                </CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Dashboard manajemen perkara interaktif yang memetakan seluruh alur administrasi Pidsus secara digital, 
              mulai dari Penyelidikan (LID) hingga Eksekusi. Sistem approval berjenjang dari Staf → Kasubsi → Kasi 
              dengan checklist digital dan tracking real-time.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Workflow Management</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Approval Chain</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Digital Checklist</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Document Tracking</span>
            </div>
            <Button onClick={() => setShowAICAFlow(true)} className="w-full md:w-auto">
              Buka AICA-Flow
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pencarian Kasus Pidsus
            </CardTitle>
            <CardDescription>
              Cari dan analisis kasus-kasus pidana khusus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fitur pencarian untuk menemukan kasus-kasus pidana khusus berdasarkan kategori, jenis kejahatan, atau kata kunci.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumen Pidsus
            </CardTitle>
            <CardDescription>
              Kelola dokumen dan berkas kasus pidana khusus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manajemen dokumen untuk kasus-kasus pidana khusus termasuk dakwaan, surat dakwaan, dan dokumen pendukung.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Regulasi Pidsus
            </CardTitle>
            <CardDescription>
              Akses regulasi terkait pidana khusus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Database regulasi dan peraturan terkait pidana khusus seperti UU Tipikor, UU Narkotika, dan lainnya.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Yurisprudensi Pidsus
            </CardTitle>
            <CardDescription>
              Referensi putusan kasus pidana khusus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kumpulan putusan pengadilan untuk kasus-kasus pidana khusus sebagai referensi dan pembelajaran.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pidsus;

