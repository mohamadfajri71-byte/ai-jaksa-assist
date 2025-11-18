import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PDFViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string | null;
}

const PDFViewerDialog = ({ open, onOpenChange, title, url }: PDFViewerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {url ? (
          <iframe
            src={url}
            className="w-full h-full rounded-md border"
            title={title}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Tidak dapat memuat PDF
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerDialog;

