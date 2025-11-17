import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, Scale, BookOpen, Shield } from "lucide-react";

const Intel = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Intel - Intelijen dan Pengawasan</h1>
        <p className="text-muted-foreground">
          Modul untuk kegiatan intelijen, pengawasan, dan koordinasi penegakan hukum.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Intelijen
            </CardTitle>
            <CardDescription>
              Manajemen informasi dan data intelijen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sistem pengelolaan informasi dan data intelijen untuk mendukung penegakan hukum.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pengawasan
            </CardTitle>
            <CardDescription>
              Monitoring dan pengawasan kegiatan penegakan hukum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sistem monitoring dan pengawasan untuk memastikan efektivitas penegakan hukum.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Laporan Intelijen
            </CardTitle>
            <CardDescription>
              Kelola laporan dan dokumen intelijen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manajemen laporan intelijen dan dokumen terkait kegiatan pengawasan.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Koordinasi
            </CardTitle>
            <CardDescription>
              Koordinasi dengan instansi terkait
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sistem koordinasi dengan instansi penegak hukum lainnya untuk efektivitas penegakan hukum.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Intel;

