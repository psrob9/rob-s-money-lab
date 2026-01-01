import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  totalIn: number;
  totalOut: number;
  net: number;
  monthsSpan: number;
  transactionCount: number;
  topCategories: string[];
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
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
