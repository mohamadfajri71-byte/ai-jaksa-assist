import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, Scale, BookOpen } from "lucide-react";

const Pidum = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pidum - Pidana Umum</h1>
        <p className="text-muted-foreground">
          Modul untuk menangani kasus-kasus pidana umum seperti pencurian, penganiayaan, pembunuhan, dan kejahatan lainnya.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pencarian Kasus Pidum
            </CardTitle>
            <CardDescription>
              Cari dan analisis kasus-kasus pidana umum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fitur pencarian untuk menemukan kasus-kasus pidana umum berdasarkan jenis kejahatan, pasal, atau kata kunci.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumen Pidum
            </CardTitle>
            <CardDescription>
              Kelola dokumen dan berkas kasus pidana umum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manajemen dokumen untuk kasus-kasus pidana umum termasuk dakwaan, surat dakwaan, dan dokumen pendukung.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Regulasi Pidum
            </CardTitle>
            <CardDescription>
              Akses regulasi terkait pidana umum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Database regulasi dan peraturan terkait pidana umum seperti KUHP dan peraturan turunannya.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Yurisprudensi Pidum
            </CardTitle>
            <CardDescription>
              Referensi putusan kasus pidana umum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kumpulan putusan pengadilan untuk kasus-kasus pidana umum sebagai referensi dan pembelajaran.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pidum;

