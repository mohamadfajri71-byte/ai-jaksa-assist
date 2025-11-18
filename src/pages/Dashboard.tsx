import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LogOut, Shield, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AISearch from "@/components/dashboard/AISearch";
import LegalChat from "@/components/dashboard/LegalChat";
import DraftingAssistant from "@/components/dashboard/DraftingAssistant";
import KnowledgeBase from "@/components/dashboard/KnowledgeBase";
import AdminPanel from "@/components/dashboard/AdminPanel";
import Pidsus from "@/components/dashboard/Pidsus";
import Pidum from "@/components/dashboard/Pidum";
import Datun from "@/components/dashboard/Datun";
import Intel from "@/components/dashboard/Intel";
import ReminderNotification from "@/components/dashboard/ReminderNotification";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardPopupOpen, setDashboardPopupOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      setIsAdmin(roles?.role === "admin");
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setDashboardPopupOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar isAdmin={isAdmin} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                  <img 
                    src="/logo website.png" 
                    alt="AICA Logo" 
                    className="h-7 w-auto"
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    AICA.WEB.ID
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Admin</span>
                  </div>
                )}
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard/search" replace />} />
              <Route path="/search" element={<AISearch />} />
              <Route path="/chat" element={<LegalChat />} />
              <Route path="/draft" element={<DraftingAssistant userId={user?.id || ""} />} />
              <Route path="/knowledge" element={<KnowledgeBase />} />
              <Route path="/bidang/pidsus" element={<Pidsus />} />
              <Route path="/bidang/pidum" element={<Pidum />} />
              <Route path="/bidang/datun" element={<Datun />} />
              <Route path="/bidang/intel" element={<Intel />} />
              <Route path="/reminder" element={<ReminderNotification />} />
              {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
              <Route path="/profile" element={<div className="text-center py-8">Halaman Profil (Coming Soon)</div>} />
              <Route path="/notifications" element={<div className="text-center py-8">Halaman Notifikasi (Coming Soon)</div>} />
            </Routes>
          </main>
        </div>
      </div>

      <Dialog open={dashboardPopupOpen} onOpenChange={setDashboardPopupOpen}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <img
              src="/dashboard popup.png"
              alt="Dashboard Highlights"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setDashboardPopupOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 text-foreground flex items-center justify-center shadow hover:bg-white transition"
            >
              ✕
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Dashboard;