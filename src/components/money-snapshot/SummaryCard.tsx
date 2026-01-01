import { ClipboardList, Download, RefreshCw, ArrowRight, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FeedbackModal } from "@/components/FeedbackModal";

interface SummaryCardProps {
  totalIn: number;
  totalOut: number;
  net: number;
  monthsSpan: number;
  transactionCount: number;
  topCategories: string[];
  onReset: () => void;
  onDownload?: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const SummaryCard = ({
  totalIn,
  totalOut,
  net,
  monthsSpan,
  transactionCount,
  topCategories,
  onReset,
  onDownload,
}: SummaryCardProps) => {
  const savingsRate = totalIn > 0 ? (net / totalIn) * 100 : 0;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-lab-navy flex items-center gap-2">
          <ClipboardList size={20} className="text-lab-teal" />
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary stats */}
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Over <span className="font-medium text-lab-navy">{monthsSpan} month{monthsSpan !== 1 ? 's' : ''}</span>, you:
          </p>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-lab-sage">•</span>
              <span className="text-lab-warm-gray">Brought in <span className="font-semibold text-lab-navy">{formatCurrency(totalIn)}</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span className="text-lab-warm-gray">Spent <span className="font-semibold text-lab-navy">{formatCurrency(totalOut)}</span> across {transactionCount.toLocaleString()} transactions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={net >= 0 ? "text-lab-sage" : "text-lab-amber"}>•</span>
              <span className="text-lab-warm-gray">
                {net >= 0 ? "Kept" : "Overspent by"}{" "}
                <span className={`font-semibold ${net >= 0 ? "text-lab-sage" : "text-lab-amber"}`}>
                  {formatCurrency(Math.abs(net))}
                </span>
                {net >= 0 && savingsRate > 0 && (
                  <span className="text-muted-foreground"> ({Math.round(savingsRate)}% savings rate)</span>
                )}
              </span>
            </li>
            {topCategories.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-lab-teal">•</span>
                <span className="text-lab-warm-gray">Top categories: <span className="font-medium text-lab-navy">{topCategories.join(", ")}</span></span>
              </li>
            )}
          </ul>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-sm font-medium text-lab-navy mb-4">What's Next?</p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 px-3"
              onClick={onDownload}
              disabled={!onDownload}
            >
              <Download size={18} className="text-lab-teal" />
              <span className="text-xs font-medium">Download CSV</span>
              <span className="text-[10px] text-muted-foreground">Export categorized data</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 px-3"
              asChild
            >
              <Link to="/tools/true-monthly-cost">
                <ArrowRight size={18} className="text-lab-teal" />
                <span className="text-xs font-medium">True Monthly Cost</span>
                <span className="text-[10px] text-muted-foreground">Find recurring costs</span>
              </Link>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3 px-3"
              onClick={onReset}
            >
              <RefreshCw size={18} className="text-lab-teal" />
              <span className="text-xs font-medium">Start Over</span>
              <span className="text-[10px] text-muted-foreground">Analyze new files</span>
            </Button>
            
            <FeedbackModal 
              source="Money Snapshot"
              trigger={
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3 px-3"
                >
                  <MessageSquare size={18} className="text-lab-teal" />
                  <span className="text-xs font-medium">Share Feedback</span>
                  <span className="text-[10px] text-muted-foreground">Help us improve</span>
                </Button>
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
