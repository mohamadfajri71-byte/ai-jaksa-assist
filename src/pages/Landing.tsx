import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, FileText, BookOpen, Shield, ArrowRight, CheckCircle2, Menu, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bidangMenuOpen, setBidangMenuOpen] = useState(false);
  const [welcomePopupOpen, setWelcomePopupOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWelcomePopupOpen(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseWelcome = () => {
    setWelcomePopupOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Elegant Header with Glass Effect */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                <img 
                  src="/logo website.png" 
                  alt="AICA Legal Logo" 
                  className="h-7 w-auto"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                  AICA.WEB.ID
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Fitur
              </a>
              <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Keunggulan
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 outline-none">
                  Bidang
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    Pidsus
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Pidum
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Datun
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Intel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Tentang
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="text-sm font-medium"
              >
                Masuk
              </Button>
              <Button 
                onClick={() => navigate("/auth?mode=signup")}
                className="text-sm font-medium shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.2)]"
              >
                Daftar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/40 py-4 space-y-3 animate-fade-in">
              <a href="#features" className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary">
                Fitur
              </a>
              <a href="#benefits" className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary">
                Keunggulan
              </a>
              <div>
                <button
                  onClick={() => setBidangMenuOpen(!bidangMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  Bidang
                  <ChevronDown className={`h-4 w-4 transition-transform ${bidangMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {bidangMenuOpen && (
                  <div className="pl-6 space-y-2 mt-2">
                    <a href="#" className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary">
                      Pidsus
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary">
                      Pidum
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary">
                      Datun
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary">
                      Intel
                    </a>
                  </div>
                )}
              </div>
              <a href="#about" className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary">
                Tentang
              </a>
              <div className="flex flex-col gap-2 px-4 pt-2">
                <Button variant="outline" onClick={() => navigate("/auth")} className="w-full">
                  Masuk
                </Button>
                <Button onClick={() => navigate("/auth?mode=signup")} className="w-full">
                  Daftar Gratis
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Elegant Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 animate-fade-in">
              <Shield className="h-4 w-4" />
              Platform Kejaksaan Negeri Manggarai Barat
            </div>
            
            {/* Character Animation */}
            <div className="flex justify-center animate-fade-in">
              <div className="relative">
                <img 
                  src="/logolanding.png" 
                  alt="AICA Character" 
                  className="h-48 md:h-64 lg:h-80 w-auto animate-float"
                />
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in">
              Asisten Cerdas untuk
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                Jaksa Profesional
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Platform berbasis AI yang membantu Jaksa dalam pencarian yurisprudensi, 
              penyusunan dakwaan, dan akses regulasi terkini secara cepat dan akurat.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth?mode=signup")} 
                className="text-base font-semibold shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.2)] hover:shadow-xl transition-all"
              >
                Mulai Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/auth")}
                className="text-base font-semibold"
              >
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 lg:px-8 py-20 lg:py-32">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Fitur <span className="text-primary">Unggulan</span> Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Teknologi AI terdepan untuk meningkatkan efisiensi dan akurasi kerja Jaksa
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.1)] transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
            <div className="h-14 w-14 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center mb-6 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.2)]">
              <Search className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-3">Pencarian Cerdas AI</h3>
            <p className="text-muted-foreground leading-relaxed">
              Temukan yurisprudensi, pasal, dan regulasi yang relevan hanya dengan mendeskripsikan kasus. 
              AI kami akan mencarikan referensi terbaik dari database internal.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.1)] transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
            <div className="h-14 w-14 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center mb-6 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.2)]">
              <FileText className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-3">Asisten Draf Dokumen</h3>
            <p className="text-muted-foreground leading-relaxed">
              Buat kerangka dakwaan, requisitoir, atau analisis yuridis secara otomatis. 
              Hemat waktu dan tingkatkan konsistensi dokumen hukum Anda.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.1)] transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
            <div className="h-14 w-14 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center mb-6 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.2)]">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-3">Database Pengetahuan</h3>
            <p className="text-muted-foreground leading-relaxed">
              Akses lengkap ke database regulasi, yurisprudensi, dan SOP internal. 
              Semua informasi yang Anda butuhkan dalam satu platform.
            </p>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-muted/30 py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Mengapa Memilih <span className="text-primary">AICA Legal</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Solusi komprehensif untuk meningkatkan produktivitas dan kualitas kerja hukum Anda
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4 p-6 bg-card rounded-xl border border-border/50 hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.1)] transition-all">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Hemat Waktu hingga 70%</h3>
                  <p className="text-muted-foreground">
                    Riset hukum yang biasanya memakan waktu berjam-jam kini bisa diselesaikan dalam hitungan menit dengan bantuan AI.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-card rounded-xl border border-border/50 hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.1)] transition-all">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Akurasi Tinggi</h3>
                  <p className="text-muted-foreground">
                    AI kami dilatih dengan database hukum komprehensif dan terus diperbarui dengan regulasi terbaru.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-card rounded-xl border border-border/50 hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.1)] transition-all">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Selalu Terkini</h3>
                  <p className="text-muted-foreground">
                    Database regulasi dan yurisprudensi diperbarui secara berkala untuk memastikan Anda mendapat informasi terbaru.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-card rounded-xl border border-border/50 hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.1)] transition-all">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Aman & Terpercaya</h3>
                  <p className="text-muted-foreground">
                    Data dan dokumen Anda dilindungi dengan enkripsi tingkat enterprise dan akses terkontrol.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.2)]">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Meningkatkan Efisiensi Kerja Anda?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan tim Kejaksaan Negeri Manggarai Barat yang sudah menggunakan AICA Legal untuk meningkatkan produktivitas mereka.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?mode=signup")}
              className="text-base font-semibold shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.2)] hover:shadow-xl transition-all"
            >
              Daftar Sekarang Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/logo website.png" 
                alt="AICA Legal Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                AICA Legal
              </span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                &copy; 2025 AICA Legal - Kejaksaan Negeri Manggarai Barat
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Platform Asisten Cerdas untuk Jaksa Profesional
              </p>
            </div>
          </div>
        </div>
      </footer>

      <Dialog
        open={welcomePopupOpen}
        onOpenChange={setWelcomePopupOpen}
      >
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <img
              src="/welcome.png"
              alt="Welcome Popup"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleCloseWelcome}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 text-foreground flex items-center justify-center shadow hover:bg-white transition"
            >
              ✕
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Landing;
