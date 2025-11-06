import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, FileText, Scale, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
          <h3 className="text-lg font-semibold">Hasil Pencarian ({results.length})</h3>
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