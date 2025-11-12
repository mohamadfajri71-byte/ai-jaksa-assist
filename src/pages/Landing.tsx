import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, FileText, BookOpen, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/logo website.png" 
              alt="AICA Legal Logo" 
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold text-primary">AICA Legal</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Masuk
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup")}>
              Daftar Sekarang
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            Platform Resmi Kejaksaan
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Asisten Cerdas untuk
            <span className="text-primary block mt-2">Jaksa Profesional</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Platform berbasis AI yang membantu Jaksa dalam pencarian yurisprudensi, 
            penyusunan dakwaan, dan akses regulasi terkini secara cepat dan akurat.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="gap-2">
              Mulai Gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fitur Unggulan Platform</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Teknologi AI terdepan untuk meningkatkan efisiensi dan akurasi kerja Jaksa
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pencarian Cerdas AI</h3>
            <p className="text-muted-foreground">
              Temukan yurisprudensi, pasal, dan regulasi yang relevan hanya dengan mendeskripsikan kasus. 
              AI kami akan mencarikan referensi terbaik dari database internal.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Asisten Draf Dokumen</h3>
            <p className="text-muted-foreground">
              Buat kerangka dakwaan, requisitoir, atau analisis yuridis secara otomatis. 
              Hemat waktu dan tingkatkan konsistensi dokumen hukum Anda.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Database Pengetahuan</h3>
            <p className="text-muted-foreground">
              Akses lengkap ke yurisprudensi pidsus pilihan, regulasi terbaru, dan SOP internal. 
              Semua dalam satu platform terpadu dan terstruktur.
            </p>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Mengapa Memilih AICA Legal?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Hemat Waktu Signifikan</h3>
                  <p className="text-muted-foreground text-sm">
                    Pencarian manual yang biasanya memakan waktu berjam-jam, kini cukup beberapa menit
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Akurasi Tinggi</h3>
                  <p className="text-muted-foreground text-sm">
                    AI terlatih khusus untuk hukum Indonesia dengan database yang terverifikasi
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Selalu Update</h3>
                  <p className="text-muted-foreground text-sm">
                    Database regulasi dan yurisprudensi diperbarui secara berkala
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Aman & Terpercaya</h3>
                  <p className="text-muted-foreground text-sm">
                    Platform resmi dengan standar keamanan tinggi untuk melindungi data sensitif
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Siap Meningkatkan Produktivitas Anda?
          </h2>
          <p className="text-primary-foreground/90 mb-6 text-lg">
            Bergabunglah dengan ratusan Jaksa yang telah merasakan kemudahan bekerja dengan AICA Legal
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/auth?mode=signup")}
            className="gap-2"
          >
            Daftar Sekarang Gratis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo website.png" 
                alt="AICA Legal Logo" 
                className="h-6 w-auto"
              />
              <span className="font-semibold">AICA Legal Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 aica.ac.id - Platform Asisten Jaksa Berbasis AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;