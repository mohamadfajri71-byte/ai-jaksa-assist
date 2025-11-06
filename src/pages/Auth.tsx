import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  fullName: z.string().min(2, "Nama minimal 2 karakter").optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = authSchema.parse(formData);

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: validation.email,
          password: validation.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: validation.fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Registrasi Berhasil!",
          description: "Akun Anda telah dibuat. Silakan login.",
        });
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: validation.email,
          password: validation.password,
        });

        if (error) throw error;

        toast({
          title: "Login Berhasil!",
          description: "Selamat datang kembali.",
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validasi Gagal",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">AICA Legal</span>
          </div>
          <div>
            <CardTitle className="text-2xl">
              {mode === "login" ? "Masuk ke Akun Anda" : "Daftar Akun Baru"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Masukkan kredensial Anda untuk melanjutkan"
                : "Buat akun untuk mengakses platform"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required={mode === "signup"}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Daftar di sini
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Masuk di sini
                </button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;