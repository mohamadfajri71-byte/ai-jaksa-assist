import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Workflow, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Eye,
  MessageSquare,
  User,
  Users,
  UserCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AICAFlowDashboard from "./AICAFlowDashboard";
import AICAFlowUpload from "./AICAFlowUpload";
import AICAFlowReview from "./AICAFlowReview";

// Types
type DocumentStatus = "draft" | "pending_review_kasubsi" | "pending_approval_kasi" | "revision_required" | "completed";
type UserRole = "staf" | "kasubsi" | "kasi";

interface CaseDocument {
  id: string;
  case_id: string;
  document_type: string; // P-5, P-8, P-16, P-42, etc.
  document_name: string;
  status: DocumentStatus;
  uploaded_by: string;
  uploaded_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  file_url?: string;
}

interface Case {
  id: string;
  case_number: string;
  case_name: string;
  stage: "LID" | "DIK" | "PRATUT" | "TUT" | "EKSEKUSI";
  assigned_to: string;
  created_at: string;
  documents: CaseDocument[];
}

const AICAFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole>("staf");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
    loadCases();
  }, []);

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check user role from profiles or user_roles
      // For now, we'll use a simple check - in production, this should come from database
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      // Map admin role to kasi, user to staf
      // In production, you'd have a separate field for workflow role
      if (roles?.role === "admin") {
        setUserRole("kasi");
      } else {
        setUserRole("staf");
      }
    } catch (error) {
      console.error("Error loading user role:", error);
    }
  };

  const loadCases = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In production, this would fetch from database
      // For now, using mock data
      const mockCases: Case[] = [
        {
          id: "1",
          case_number: "PIDSUS-001/2025",
          case_name: "Perkara Korupsi PT. ABC",
          stage: "LID",
          assigned_to: user.id,
          created_at: new Date().toISOString(),
          documents: [
            {
              id: "doc1",
              case_id: "1",
              document_type: "P-5",
              document_name: "Laporan Hasil Penyelidikan",
              status: "pending_review_kasubsi",
              uploaded_by: user.id,
              uploaded_at: new Date().toISOString(),
            }
          ]
        }
      ];

      setCases(mockCases);
    } catch (error) {
      console.error("Error loading cases:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data perkara",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const statusConfig = {
      draft: { label: "Draf", variant: "secondary" as const, icon: FileText },
      pending_review_kasubsi: { label: "Menunggu Review Kasubsi", variant: "default" as const, icon: Clock },
      pending_approval_kasi: { label: "Menunggu Persetujuan Kasi", variant: "default" as const, icon: UserCheck },
      revision_required: { label: "Perlu Revisi", variant: "destructive" as const, icon: AlertCircle },
      completed: { label: "Selesai", variant: "default" as const, icon: CheckCircle2 },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
            <Workflow className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AICA-Flow</h1>
            <p className="text-muted-foreground">
              Modul Alur Perkara & Disposisi Pidsus
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Dashboard manajemen perkara interaktif yang memetakan seluruh alur administrasi Pidsus secara digital, 
          mulai dari Penyelidikan (LID) hingga Eksekusi.
        </p>
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="capitalize">
          {userRole === "staf" && <><User className="h-3 w-3 mr-1" /> Staf / Analis Penuntutan</>}
          {userRole === "kasubsi" && <><Users className="h-3 w-3 mr-1" /> Kasubsi</>}
          {userRole === "kasi" && <><UserCheck className="h-3 w-3 mr-1" /> Kasi Pidsus</>}
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">
            <Workflow className="h-4 w-4 mr-2" />
            Dashboard Alur
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Dokumen
          </TabsTrigger>
          <TabsTrigger value="review">
            <Eye className="h-4 w-4 mr-2" />
            Review & Approval
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <AICAFlowDashboard 
            cases={cases} 
            userRole={userRole}
            onCaseSelect={(caseId) => {
              // Navigate to case detail
              console.log("Selected case:", caseId);
            }}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <AICAFlowUpload 
            cases={cases}
            userRole={userRole}
            onUploadSuccess={loadCases}
          />
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <AICAFlowReview 
            cases={cases}
            userRole={userRole}
            onReviewSuccess={loadCases}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Integrasi dengan Fitur AICA Lainnya</CardTitle>
          <CardDescription>
            Gunakan fitur AICA lainnya untuk membantu menyelesaikan tugas Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start"
              onClick={() => navigate("/dashboard/draft")}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Asisten Draf Perkara</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Buat draf dokumen dengan bantuan AI
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start"
              onClick={() => navigate("/dashboard/search")}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold">AI Search</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Cari referensi yurisprudensi dan regulasi
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICAFlow;

