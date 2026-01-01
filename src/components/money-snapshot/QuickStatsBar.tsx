import { FileText, Calendar, Hash } from "lucide-react";

interface QuickStatsBarProps {
  monthsSpan: number;
  transactionCount: number;
  fileCount: number;
}

export const QuickStatsBar = ({ monthsSpan, transactionCount, fileCount }: QuickStatsBarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-4 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Calendar size={14} className="text-lab-teal" />
        <span>Period: <span className="font-medium text-lab-navy">{monthsSpan} month{monthsSpan !== 1 ? 's' : ''}</span></span>
      </div>
      <div className="flex items-center gap-1.5">
        <Hash size={14} className="text-lab-teal" />
        <span>Transactions: <span className="font-medium text-lab-navy">{transactionCount.toLocaleString()}</span></span>
      </div>
      <div className="flex items-center gap-1.5">
        <FileText size={14} className="text-lab-teal" />
        <span>Files: <span className="font-medium text-lab-navy">{fileCount}</span></span>
      </div>
    </div>
  );
};
