import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, Scale, BookOpen } from "lucide-react";

const Datun = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Datun - Datun dan Tindak Pidana Tertentu</h1>
        <p className="text-muted-foreground">
          Modul untuk menangani kasus-kasus datun (penuntutan) dan tindak pidana tertentu lainnya.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pencarian Kasus Datun
            </CardTitle>
            <CardDescription>
              Cari dan analisis kasus-kasus datun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fitur pencarian untuk menemukan kasus-kasus datun berdasarkan kategori, jenis tindak pidana, atau kata kunci.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumen Datun
            </CardTitle>
            <CardDescription>
              Kelola dokumen dan berkas kasus datun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manajemen dokumen untuk kasus-kasus datun termasuk surat dakwaan, surat tuntutan, dan dokumen pendukung.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Regulasi Datun
            </CardTitle>
            <CardDescription>
              Akses regulasi terkait datun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Database regulasi dan peraturan terkait datun dan tindak pidana tertentu.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Yurisprudensi Datun
            </CardTitle>
            <CardDescription>
              Referensi putusan kasus datun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kumpulan putusan pengadilan untuk kasus-kasus datun sebagai referensi dan pembelajaran.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Datun;

