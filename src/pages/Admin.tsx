import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminPanel from "@/components/dashboard/AdminPanel";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast({
            title: "Error",
            description: "Terjadi kesalahan saat memeriksa session",
            variant: "destructive",
          });
          navigate("/admin/login");
          setLoading(false);
          return;
        }
        
        if (!session?.user) {
          console.log("No session found, redirecting to login");
          toast({
            title: "Akses Ditolak",
            description: "Silakan login terlebih dahulu",
            variant: "destructive",
          });
          navigate("/admin/login");
          setLoading(false);
          return;
        }

        console.log("Checking admin role for user:", session.user.id);

        // Check admin role from database - use maybeSingle() instead of single() to handle no data gracefully
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        console.log("Role query result:", { roleData, roleError });

        if (roleError) {
          console.error("Role query error:", roleError);
          toast({
            title: "Error",
            description: `Terjadi kesalahan saat memeriksa akses: ${roleError.message}`,
            variant: "destructive",
          });
          navigate("/admin/login");
          setLoading(false);
          return;
        }

        if (!roleData) {
          console.log("No admin role found for user");
          toast({
            title: "Akses Ditolak",
            description: "Anda tidak memiliki akses admin. Silakan hubungi administrator.",
            variant: "destructive",
          });
          navigate("/admin/login");
          setLoading(false);
          return;
        }

        console.log("Admin access granted");
        setUser(session.user);
      } catch (error: any) {
        console.error("Unexpected error checking admin access:", error);
        toast({
          title: "Error",
          description: error?.message || "Terjadi kesalahan tidak terduga",
          variant: "destructive",
        });
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari panel admin",
    });
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                    Kelola konten dan data platform AICA • {user?.email}
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
