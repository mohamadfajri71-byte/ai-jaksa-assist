import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  FileText,
  User,
  MessageSquare,
  ArrowRight,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Case {
  id: string;
  case_number: string;
  case_name: string;
  documents: any[];
}

interface AICAFlowReviewProps {
  cases: Case[];
  userRole: "staf" | "kasubsi" | "kasi";
  onReviewSuccess: () => void;
}

const AICAFlowReview = ({ cases, userRole, onReviewSuccess }: AICAFlowReviewProps) => {
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  // Filter documents based on user role
  const getDocumentsForReview = () => {
    const allDocs: any[] = [];
    cases.forEach(caseItem => {
      caseItem.documents.forEach(doc => {
        if (userRole === "kasubsi" && doc.status === "pending_review_kasubsi") {
          allDocs.push({ ...doc, case: caseItem });
        } else if (userRole === "kasi" && doc.status === "pending_approval_kasi") {
          allDocs.push({ ...doc, case: caseItem });
        } else if (userRole === "staf" && doc.status === "revision_required") {
          allDocs.push({ ...doc, case: caseItem });
        }
      });
    });
    return allDocs;
  };

  const documentsForReview = getDocumentsForReview();

  const handleReview = (doc: any, actionType: "approve" | "reject") => {
    setSelectedDoc(doc);
    setAction(actionType);
    setReviewNotes("");
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedDoc || !action) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Determine new status based on action and role
      let newStatus: string;
      const updateData: any = { notes: reviewNotes || null };

      if (action === "approve") {
        if (userRole === "kasubsi") {
          newStatus = "pending_approval_kasi";
          updateData.reviewed_by = user.id;
          updateData.reviewed_at = new Date().toISOString();
        } else if (userRole === "kasi") {
          newStatus = "completed";
          updateData.approved_by = user.id;
          updateData.approved_at = new Date().toISOString();
        } else {
          newStatus = "pending_review_kasubsi";
        }
      } else {
        newStatus = "revision_required";
        updateData.reviewed_by = user.id;
        updateData.reviewed_at = new Date().toISOString();
      }

      updateData.status = newStatus;

      // Update document in database
      const { error: updateError } = await supabase
        .from("case_documents")
        .update(updateData)
        .eq("id", selectedDoc.id);

      if (updateError) throw updateError;

      const actionText = action === "approve" 
        ? (userRole === "kasubsi" ? "diteruskan ke Kasi" : "disetujui")
        : "dikembalikan untuk revisi";

      toast({
        title: "Review Berhasil",
        description: `Dokumen ${actionText}`,
      });

      setReviewDialogOpen(false);
      setSelectedDoc(null);
      setAction(null);
      setReviewNotes("");
      onReviewSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal melakukan review",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
      pending_review_kasubsi: { label: "Menunggu Review Kasubsi", variant: "default" },
      pending_approval_kasi: { label: "Menunggu Persetujuan Kasi", variant: "default" },
      revision_required: { label: "Perlu Revisi", variant: "destructive" },
      completed: { label: "Selesai", variant: "secondary" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {userRole === "kasubsi" && "Review Dokumen dari Staf"}
            {userRole === "kasi" && "Persetujuan Final Dokumen"}
            {userRole === "staf" && "Dokumen Perlu Revisi"}
          </CardTitle>
          <CardDescription>
            {userRole === "kasubsi" && "Tinjau dan berikan catatan pada dokumen yang diunggah Staf"}
            {userRole === "kasi" && "Berikan persetujuan akhir atau kembalikan untuk revisi"}
            {userRole === "staf" && "Lihat catatan revisi dan perbaiki dokumen Anda"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="font-semibold">{documentsForReview.length} dokumen</span>
            <span className="text-muted-foreground">
              {userRole === "kasubsi" && "menunggu review Anda"}
              {userRole === "kasi" && "menunggu persetujuan Anda"}
              {userRole === "staf" && "perlu direvisi"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documentsForReview.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Tidak Ada Dokumen</p>
            <p className="text-muted-foreground">
              {userRole === "kasubsi" && "Tidak ada dokumen yang menunggu review"}
              {userRole === "kasi" && "Tidak ada dokumen yang menunggu persetujuan"}
              {userRole === "staf" && "Tidak ada dokumen yang perlu direvisi"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documentsForReview.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{doc.document_type}</CardTitle>
                      {getStatusBadge(doc.status)}
                    </div>
                    <CardDescription className="mb-2">
                      {doc.document_name}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Perkara: {doc.case.case_number}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Diunggah: {new Date(doc.uploaded_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    {doc.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium mb-1">Catatan:</p>
                            <p className="text-sm text-muted-foreground">{doc.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {doc.file_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  {userRole === "kasubsi" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReview(doc, "approve")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Setuju & Teruskan ke Kasi
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReview(doc, "reject")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Revisi
                      </Button>
                    </>
                  )}
                  {userRole === "kasi" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReview(doc, "approve")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Setuju & Selesai
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReview(doc, "reject")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Revisi
                      </Button>
                    </>
                  )}
                  {userRole === "staf" && (
                    <Button variant="default" size="sm">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Perbaiki Dokumen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" 
                ? (userRole === "kasubsi" ? "Teruskan ke Kasi" : "Setujui Dokumen")
                : "Kembalikan untuk Revisi"}
            </DialogTitle>
            <DialogDescription>
              {selectedDoc && (
                <>
                  Dokumen: <strong>{selectedDoc.document_type} - {selectedDoc.document_name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">
                {action === "approve" ? "Catatan (Opsional)" : "Catatan Revisi *"}
              </Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  action === "approve"
                    ? "Tambahkan catatan jika diperlukan..."
                    : "Jelaskan bagian yang perlu direvisi..."
                }
                rows={4}
                required={action === "reject"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmitReview}>
              {action === "approve" 
                ? (userRole === "kasubsi" ? "Teruskan ke Kasi" : "Setujui")
                : "Kembalikan untuk Revisi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AICAFlowReview;

