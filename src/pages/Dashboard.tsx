import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Scale, LogOut, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AISearch from "@/components/dashboard/AISearch";
import DraftingAssistant from "@/components/dashboard/DraftingAssistant";
import KnowledgeBase from "@/components/dashboard/KnowledgeBase";
import AdminPanel from "@/components/dashboard/AdminPanel";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AICA Legal</span>
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
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="search">Pencarian AI</TabsTrigger>
            <TabsTrigger value="draft">Asisten Draf</TabsTrigger>
            <TabsTrigger value="knowledge">Database</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="search">
            <AISearch />
          </TabsContent>

          <TabsContent value="draft">
            <DraftingAssistant userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBase />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;