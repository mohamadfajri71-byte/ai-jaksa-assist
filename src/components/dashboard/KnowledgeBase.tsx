import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, FileText, Scale, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jurisprudence, setJurisprudence] = useState<any[]>([]);
  const [regulations, setRegulations] = useState<any[]>([]);
  const [sops, setSops] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [jurisData, regData, sopData] = await Promise.all([
      supabase.from("jurisprudence").select("*").order("year", { ascending: false }).limit(10),
      supabase.from("regulations").select("*").order("year", { ascending: false }).limit(10),
      supabase.from("sop_documents").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    if (jurisData.data) setJurisprudence(jurisData.data);
    if (regData.data) setRegulations(regData.data);
    if (sopData.data) setSops(sopData.data);
  };

  const filterData = (data: any[], query: string) => {
    if (!query) return data;
    return data.filter(
      (item) =>
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.content?.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords?.some((k: string) => k.toLowerCase().includes(query.toLowerCase()))
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Pengetahuan Hukum</CardTitle>
          <CardDescription>
            Akses lengkap ke yurisprudensi, regulasi, dan SOP internal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan judul, konten, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="jurisprudence" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jurisprudence">Yurisprudensi</TabsTrigger>
          <TabsTrigger value="regulations">Regulasi</TabsTrigger>
          <TabsTrigger value="sop">SOP Internal</TabsTrigger>
        </TabsList>

        <TabsContent value="jurisprudence" className="space-y-4">
          {filterData(jurisprudence, searchQuery).map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{item.case_number}</Badge>
                      <Badge variant="secondary">{item.year}</Badge>
                      <Badge>{item.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {item.court && (
                      <p className="text-sm text-muted-foreground mt-1">{item.court}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {item.content}
                </p>
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.keywords.map((keyword: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filterData(jurisprudence, searchQuery).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada yurisprudensi ditemukan</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="regulations" className="space-y-4">
          {filterData(regulations, searchQuery).map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{item.regulation_number}</Badge>
                      <Badge variant="secondary">{item.year}</Badge>
                      <Badge>{item.type}</Badge>
                      {item.status === "active" && (
                        <Badge className="bg-green-500">Aktif</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {item.content}
                </p>
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.keywords.map((keyword: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filterData(regulations, searchQuery).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada regulasi ditemukan</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sop" className="space-y-4">
          {filterData(sops, searchQuery).map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <File className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{item.category}</Badge>
                      {item.version && <Badge variant="outline">v{item.version}</Badge>}
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {item.effective_date && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Berlaku sejak: {new Date(item.effective_date).toLocaleDateString("id-ID")}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {item.content}
                </p>
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.keywords.map((keyword: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filterData(sops, searchQuery).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada SOP ditemukan</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBase;