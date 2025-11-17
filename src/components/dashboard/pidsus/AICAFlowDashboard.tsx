import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  ArrowRight,
  TrendingUp
} from "lucide-react";

interface Case {
  id: string;
  case_number: string;
  case_name: string;
  stage: "LID" | "DIK" | "PRATUT" | "TUT" | "EKSEKUSI";
  assigned_to: string;
  created_at: string;
  documents: any[];
}

interface AICAFlowDashboardProps {
  cases: Case[];
  userRole: "staf" | "kasubsi" | "kasi";
  onCaseSelect: (caseId: string) => void;
}

const AICAFlowDashboard = ({ cases, userRole, onCaseSelect }: AICAFlowDashboardProps) => {
  // Calculate statistics
  const totalCases = cases.length;
  const pendingReview = cases.filter(c => 
    c.documents.some(d => d.status === "pending_review_kasubsi" || d.status === "pending_approval_kasi")
  ).length;
  const completedDocs = cases.reduce((acc, c) => 
    acc + c.documents.filter(d => d.status === "completed").length, 0
  );
  const totalDocs = cases.reduce((acc, c) => acc + c.documents.length, 0);
  const completionRate = totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0;

  // Get workflow stages
  const stages = [
    { id: "LID", name: "Penyelidikan", color: "bg-blue-500" },
    { id: "DIK", name: "Penyidikan", color: "bg-yellow-500" },
    { id: "PRATUT", name: "Pra Penuntutan", color: "bg-orange-500" },
    { id: "TUT", name: "Penuntutan", color: "bg-purple-500" },
    { id: "EKSEKUSI", name: "Eksekusi", color: "bg-green-500" },
  ];

  const getStageColor = (stage: string) => {
    const stageConfig = stages.find(s => s.id === stage);
    return stageConfig?.color || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Perkara
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCases}</div>
            <p className="text-xs text-muted-foreground mt-1">Aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReview}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userRole === "kasi" ? "Perlu persetujuan Anda" : "Perlu tindakan"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dokumen Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Dari {totalDocs} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Workflow Stages Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Alur Perkara (Workflow Stages)
          </CardTitle>
          <CardDescription>
            Peta alur administrasi Pidsus dari LID hingga Eksekusi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {stages.map((stage, index) => {
              const casesInStage = cases.filter(c => c.stage === stage.id).length;
              return (
                <div key={stage.id} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`${stage.color} w-full h-2 rounded-full`} />
                  <div className="text-center">
                    <div className="font-semibold">{stage.name}</div>
                    <div className="text-sm text-muted-foreground">{casesInStage} perkara</div>
                  </div>
                  {index < stages.length - 1 && (
                    <ArrowRight className="hidden md:block h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Daftar Perkara</h3>
        <div className="space-y-4">
          {cases.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Belum ada perkara yang ditugaskan
              </CardContent>
            </Card>
          ) : (
            cases.map((caseItem) => (
              <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{caseItem.case_name}</CardTitle>
                        <Badge variant="outline">{caseItem.case_number}</Badge>
                        <Badge className={getStageColor(caseItem.stage)}>
                          {caseItem.stage}
                        </Badge>
                      </div>
                      <CardDescription>
                        {caseItem.documents.length} dokumen • Dibuat {new Date(caseItem.created_at).toLocaleDateString('id-ID')}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onCaseSelect(caseItem.id)}>
                      Detail
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {caseItem.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.document_type}</span>
                          <span className="text-sm text-muted-foreground">{doc.document_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === "completed" && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                          {doc.status === "pending_review_kasubsi" && (
                            <Clock className="h-4 w-4 text-orange-600" />
                          )}
                          {doc.status === "pending_approval_kasi" && (
                            <Clock className="h-4 w-4 text-blue-600" />
                          )}
                          {doc.status === "revision_required" && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AICAFlowDashboard;

