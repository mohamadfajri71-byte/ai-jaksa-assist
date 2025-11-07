import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, FileText, Scale, BookOpen, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface SearchResult {
  type: "jurisprudence" | "regulation" | "article";
  title: string;
  content: string;
  relevance: string;
  reference?: string;
}

const AISearch = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Kosong",
        description: "Silakan masukkan deskripsi kasus terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { query },
      });

      if (error) throw error;

      setResults(data.results || []);
      
      // Save search history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("search_history").insert({
          user_id: user.id,
          query,
          results: data.results,
        });
      }

      toast({
        title: "Pencarian Selesai",
        description: `Ditemukan ${data.results?.length || 0} hasil yang relevan.`,
      });
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Pencarian Gagal",
        description: error.message || "Terjadi kesalahan saat melakukan pencarian.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "jurisprudence":
        return <Scale className="h-5 w-5 text-primary" />;
      case "regulation":
        return <BookOpen className="h-5 w-5 text-primary" />;
      case "article":
        return <FileText className="h-5 w-5 text-primary" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "jurisprudence":
        return "Yurisprudensi";
      case "regulation":
        return "Regulasi";
      case "article":
        return "Pasal";
      default:
        return "Dokumen";
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Hasil Pencarian AI", margin, yPosition);
    yPosition += lineHeight * 2;

    // Query
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Query:", margin, yPosition);
    yPosition += lineHeight;
    
    const queryLines = doc.splitTextToSize(query, pageWidth - 2 * margin);
    doc.setFontSize(10);
    doc.text(queryLines, margin, yPosition);
    yPosition += lineHeight * queryLines.length + lineHeight;

    // Results
    results.forEach((result, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // Result number and type
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${getTypeLabel(result.type)}`, margin, yPosition);
      yPosition += lineHeight;

      // Reference
      if (result.reference) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(`Referensi: ${result.reference}`, margin, yPosition);
        yPosition += lineHeight;
      }

      // Title
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(result.title, pageWidth - 2 * margin);
      doc.text(titleLines, margin, yPosition);
      yPosition += lineHeight * titleLines.length;

      // Content
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const contentLines = doc.splitTextToSize(result.content, pageWidth - 2 * margin);
      doc.text(contentLines, margin, yPosition);
      yPosition += lineHeight * contentLines.length;

      // Relevance
      if (result.relevance) {
        yPosition += lineHeight / 2;
        doc.setFont("helvetica", "bold");
        doc.text("Relevansi:", margin, yPosition);
        yPosition += lineHeight;
        doc.setFont("helvetica", "normal");
        const relevanceLines = doc.splitTextToSize(result.relevance, pageWidth - 2 * margin);
        doc.text(relevanceLines, margin, yPosition);
        yPosition += lineHeight * relevanceLines.length;
      }

      yPosition += lineHeight * 1.5;
    });

    // Footer
    const timestamp = new Date().toLocaleString('id-ID');
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`Diekspor pada: ${timestamp}`, margin, pageHeight - 10);

    doc.save(`pencarian-ai-${Date.now()}.pdf`);
    
    toast({
      title: "Berhasil",
      description: "Hasil pencarian berhasil diekspor ke PDF.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pencarian Cerdas AI</CardTitle>
          <CardDescription>
            Deskripsikan kasus Anda, dan AI akan menemukan yurisprudensi, pasal, dan regulasi yang relevan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Contoh: Kasus korupsi pengadaan barang dan jasa di instansi pemerintah dengan kerugian negara lebih dari 1 miliar rupiah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button onClick={handleSearch} disabled={loading} className="w-full gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mencari...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Cari Referensi Hukum
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Hasil Pencarian ({results.length})</h3>
            <Button onClick={exportToPDF} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Ekspor ke PDF
            </Button>
          </div>
          {results.map((result, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(result.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                        {getTypeLabel(result.type)}
                      </span>
                      {result.reference && (
                        <span className="text-xs text-muted-foreground">{result.reference}</span>
                      )}
                    </div>
                    <CardTitle className="text-base">{result.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">{result.content}</p>
                {result.relevance && (
                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      <span className="font-medium">Relevansi: </span>
                      {result.relevance}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada hasil ditemukan. Coba gunakan kata kunci yang berbeda.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISearch;