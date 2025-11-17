import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, Scale, BookOpen } from "lucide-react";

const Pidsus = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pidsus - Pidana Khusus</h1>
        <p className="text-muted-foreground">
          Modul untuk menangani kasus-kasus pidana khusus seperti korupsi, terorisme, narkotika, dan kejahatan lainnya.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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

