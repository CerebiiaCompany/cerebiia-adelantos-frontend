import { Download, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

type ExportReportButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
};

export function ExportReportButton({
  onClick,
  label = "Exportar reporte (Excel)",
  className,
  disabled = false,
}: ExportReportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-[hsl(260_70%_50%)]/10 px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all duration-200",
        "hover:border-primary/30 hover:shadow-md active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm",
        className,
      )}
    >
      <FileSpreadsheet className="h-4 w-4" strokeWidth={2.25} />
      {label}
      <Download className="h-3.5 w-3.5 opacity-70" strokeWidth={2.5} />
    </button>
  );
}
