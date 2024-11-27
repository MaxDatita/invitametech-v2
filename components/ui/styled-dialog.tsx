import { theme } from '@/config/theme';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StyledDialogProps {
  title: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const StyledDialog = ({ 
  title, 
  children, 
  trigger,
  open,
  onOpenChange,
}: StyledDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
    <DialogContent className={cn(
      "bg-white border-purple-200 sm:max-w-[425px]",
      theme.colors.ui.dialog.background,
      theme.colors.ui.dialog.border
    )}>
      <DialogHeader>
        <DialogTitle className="text-base">{title}</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        {children}
      </div>
    </DialogContent>
  </Dialog>
); 