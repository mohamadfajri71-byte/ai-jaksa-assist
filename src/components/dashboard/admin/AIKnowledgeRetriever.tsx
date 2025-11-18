import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bot, Search, FileText, Download, Copy, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  type: "jurisprudence" | "regulation" | "article" | "sop";
  id: string;
  title: string;
  content: string;
  metadata?: any;
}

const AIKnowledgeRetriever = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Kosong",
        description: "Silakan masukkan permintaan Anda",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // Call AI search function
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { query },
      });

      if (error) throw error;

      // Process results and fetch full data from database
      const processedResults: SearchResult[] = [];
      
      if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
          try {
            let fullData: any = null;
            
            if (result.type === "jurisprudence") {
              const { data: jurisData } = await supabase
                .from("jurisprudence")
                .select("*")
                .eq("case_number", result.reference || "")
                .single();
              fullData = jurisData;
            } else if (result.type === "regulation") {
              const { data: regData } = await supabase
                .from("regulations")
                .select("*")
                .eq("regulation_number", result.reference || "")
                .single();
              fullData = regData;
            } else if (result.type === "article") {
              const { data: artData } = await supabase
                .from("articles")
                .select("*")
                .eq("article_number", result.reference || "")
                .single();
              fullData = artData;
            }

            if (fullData) {
              processedResults.push({
                type: result.type,
                id: fullData.id,
                title: fullData.title || result.title,
                content: fullData.content || result.content,
                metadata: fullData,
              });
            } else {
              // If not found by reference, use the AI result directly
              processedResults.push({
                type: result.type,
                id: result.reference || "",
                title: result.title,
                content: result.content,
              });
            }
          } catch (err) {
            console.error("Error fetching full data:", err);
            // Still add the AI result even if we can't fetch full data
            processedResults.push({
              type: result.type,
              id: result.reference || "",
              title: result.title,
              content: result.content,
            });
          }
        }
      }

      setResults(processedResults);

      if (processedResults.length === 0) {
        toast({
          title: "Tidak Ada Hasil",
          description: "Tidak ditemukan data yang sesuai dengan permintaan Anda",
        });
      } else {
        toast({
          title: "Berhasil",
          description: `Ditemukan ${processedResults.length} hasil`,
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal melakukan pencarian",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: "Disalin",
        description: "Konten telah disalin ke clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyalin ke clipboard",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      jurisprudence: "Yurisprudensi",
      regulation: "Regulasi",
      article: "Pasal",
      sop: "SOP",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      jurisprudence: "bg-blue-500",
      regulation: "bg-green-500",
      article: "bg-purple-500",
      sop: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Knowledge Retriever
          </CardTitle>
          <CardDescription>
            Minta AI untuk mengambil data dari database pengetahuan hukum berdasarkan permintaan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Apa yang ingin Anda cari?</Label>
              <Textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Contoh: Cari semua putusan tentang korupsi tahun 2023, atau Ambil regulasi tentang narkotika, atau Tampilkan pasal-pasal tentang pidana khusus"
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Jelaskan dengan detail apa yang ingin Anda ambil dari database. AI akan mencari dan mengambil data yang relevan.
              </p>
            </div>

            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Ambil Data dengan AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Hasil Pencarian</h3>
            <Badge variant="outline">{results.length} hasil ditemukan</Badge>
          </div>

          {results.map((result, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(result.type)}>
                        {getTypeLabel(result.type)}
                      </Badge>
                      <CardTitle className="text-lg">{result.title}</CardTitle>
                    </div>
                    {result.metadata && (
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-2">
                        {result.metadata.case_number && (
                          <span>No. Putusan: {result.metadata.case_number}</span>
                        )}
                        {result.metadata.regulation_number && (
                          <span>No. Regulasi: {result.metadata.regulation_number}</span>
                        )}
                        {result.metadata.article_number && (
                          <span>Pasal: {result.metadata.article_number}</span>
                        )}
                        {result.metadata.year && (
                          <span>Tahun: {result.metadata.year}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{result.content}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(result.content, result.id)}
                    >
                      {copiedId === result.id ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Disalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Salin Konten
                        </>
                      )}
                    </Button>
                    {result.metadata && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const dataStr = JSON.stringify(result.metadata, null, 2);
                          const dataBlob = new Blob([dataStr], { type: 'application/json' });
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${result.type}_${result.id}.json`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download JSON
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contoh Permintaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-1">Contoh 1:</p>
              <p className="text-muted-foreground">
                "Cari semua putusan pengadilan tentang korupsi dari tahun 2020-2024"
              </p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-1">Contoh 2:</p>
              <p className="text-muted-foreground">
                "Ambil semua regulasi tentang narkotika dan psikotropika"
              </p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-1">Contoh 3:</p>
              <p className="text-muted-foreground">
                "Tampilkan pasal-pasal dalam KUHP tentang pencurian"
              </p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium mb-1">Contoh 4:</p>
              <p className="text-muted-foreground">
                "Cari SOP tentang prosedur penyidikan kasus pidana khusus"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIKnowledgeRetriever;

