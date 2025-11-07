import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminPanel from "@/components/dashboard/AdminPanel";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = sessionStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      toast({
        title: "Akses Ditolak",
        description: "Silakan login terlebih dahulu",
        variant: "destructive",
      });
      navigate("/admin/login");
    }
  }, [navigate, toast]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_authenticated");
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari panel admin",
    });
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Panel Admin</CardTitle>
                  <CardDescription>
                    Kelola konten dan data platform AICA
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        <AdminPanel />
      </div>
    </div>
  );
};

export default Admin;
