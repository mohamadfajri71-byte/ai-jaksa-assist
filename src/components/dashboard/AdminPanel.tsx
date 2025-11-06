import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, BookOpen, FileText, File } from "lucide-react";

const AdminPanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Panel Admin
          </CardTitle>
          <CardDescription>
            Kelola konten database dan pengguna sistem
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Kelola Pengguna</CardTitle>
                <CardDescription>Atur role dan akses user</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tambah, edit, atau hapus pengguna. Atur role admin atau user untuk setiap akun.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Yurisprudensi</CardTitle>
                <CardDescription>Kelola database yurisprudensi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tambah, edit, atau hapus data yurisprudensi pidana khusus.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Regulasi & Pasal</CardTitle>
                <CardDescription>Kelola regulasi dan pasal</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tambah, edit, atau hapus data regulasi dan pasal terkait.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>SOP Internal</CardTitle>
                <CardDescription>Kelola dokumen SOP</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tambah, edit, atau hapus dokumen Standard Operating Procedure internal.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground">
            Untuk mengelola data secara detail, silakan akses database melalui Cloud dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;