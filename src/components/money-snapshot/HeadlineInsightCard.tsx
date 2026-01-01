import { TrendingUp, TrendingDown, ChevronDown, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HeadlineInsightCardProps {
  totalIn: number;
  totalOut: number;
  net: number;
  monthsSpan: number;
  categoryBreakdown: Array<{ name: string; total: number; percentage: number }>;
  uncategorizedPercentage: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const generateHeadlineInsight = ({
  totalIn,
  totalOut,
  net,
  monthsSpan,
  categoryBreakdown,
  uncategorizedPercentage,
}: HeadlineInsightCardProps): { headline: string; subtext: string } => {
  const savingsRate = totalIn > 0 ? (net / totalIn) * 100 : 0;
  
  // Find top category
  const topCategory = categoryBreakdown[0];
  const topCategoryPercentage = topCategory?.percentage || 0;
  
  // Find dining vs groceries
  const dining = categoryBreakdown.find(c => c.name === "Food & Dining");
  const groceries = categoryBreakdown.find(c => c.name === "Groceries");
  const diningTotal = dining?.total || 0;
  const groceriesTotal = groceries?.total || 0;
  
  // Find subscriptions
  const subscriptions = categoryBreakdown.find(c => c.name === "Subscriptions & Entertainment");
  const subscriptionsTotal = subscriptions?.total || 0;
  const monthlySubscriptions = monthsSpan > 0 ? subscriptionsTotal / monthsSpan : 0;

  // Priority: Pick the most interesting insight
  
  // 1. Savings rate insight (if net is positive and significant)
  if (savingsRate > 30) {
    return {
      headline: `You saved ${Math.round(savingsRate)}% of your income this period.`,
      subtext: "That's exceptional — most Americans save 5-10%.",
    };
  }
  
  if (savingsRate >= 15 && savingsRate <= 30) {
    return {
      headline: `You saved ${Math.round(savingsRate)}% — that's above average.`,
      subtext: "The typical American saves around 5-10% of their income.",
    };
  }
  
  if (savingsRate > 0 && savingsRate < 15) {
    return {
      headline: `You're spending ${Math.round(100 - savingsRate)}% of what you earn.`,
      subtext: `Only ${Math.round(savingsRate)}% is staying in your pocket.`,
    };
  }
  
  // 2. Negative net (spending more than earning)
  if (net < 0) {
    return {
      headline: `You spent ${formatCurrency(Math.abs(net))} more than you brought in.`,
      subtext: "Let's look at where it's going.",
    };
  }
  
  // 3. Category dominance insight (if one category is >25%)
  if (topCategoryPercentage > 25 && topCategory) {
    return {
      headline: `${topCategory.name} is your biggest category at ${formatCurrency(topCategory.total)}.`,
      subtext: `That's ${Math.round(topCategoryPercentage)}% of all your spending.`,
    };
  }
  
  // 4. Dining vs groceries insight
  if (diningTotal > groceriesTotal * 2 && diningTotal > 100) {
    const ratio = Math.round(diningTotal / groceriesTotal * 10) / 10;
    return {
      headline: `You spend ${ratio}x more on dining out than groceries.`,
      subtext: "Restaurant meals add up faster than you'd think.",
    };
  }
  
  if (groceriesTotal > diningTotal * 2 && groceriesTotal > 100) {
    return {
      headline: "You're a home cook — groceries outpace dining out.",
      subtext: "Cooking at home is one of the best ways to save.",
    };
  }
  
  // 5. Subscriptions insight
  if (monthlySubscriptions > 50) {
    return {
      headline: `About ${formatCurrency(Math.round(monthlySubscriptions))}/month goes to subscriptions.`,
      subtext: "Worth reviewing if any have gone unused.",
    };
  }
  
  // 6. Uncategorized insight
  if (uncategorizedPercentage > 30) {
    return {
      headline: `${Math.round(uncategorizedPercentage)}% of your spending is uncategorized.`,
      subtext: "There might be patterns hiding in there.",
    };
  }
  
  // Default fallback
  return {
    headline: `${formatCurrency(totalOut)} spent over ${monthsSpan} month${monthsSpan !== 1 ? 's' : ''}.`,
    subtext: "Let's see where it all went.",
  };
};

export const HeadlineInsightCard = (props: HeadlineInsightCardProps) => {
  const { totalIn, totalOut, net } = props;
  const { headline, subtext } = generateHeadlineInsight(props);

  return (
    <Card className="border-lab-teal/30 bg-gradient-to-br from-lab-teal/5 to-lab-sage/5 shadow-md">
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-lab-amber/10 rounded-lg">
            <Lightbulb size={20} className="text-lab-amber" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-lab-teal mb-1">Your Money Snapshot</h2>
            <p className="text-xl sm:text-2xl font-bold text-lab-navy leading-tight">{headline}</p>
            <p className="text-muted-foreground mt-1">{subtext}</p>
          </div>
        </div>

        {/* Flow visualization */}
        <div className="flex items-center justify-between gap-2 text-sm mt-5 pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-lab-sage" />
            <span className="font-semibold text-lab-navy">{formatCurrency(totalIn)}</span>
            <span className="text-muted-foreground hidden sm:inline">in</span>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="flex items-center gap-1.5">
            <TrendingDown size={14} className="text-red-500" />
            <span className="font-semibold text-lab-navy">{formatCurrency(totalOut)}</span>
            <span className="text-muted-foreground hidden sm:inline">out</span>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="flex items-center gap-1.5">
            <span className={`font-bold ${net >= 0 ? "text-lab-sage" : "text-lab-amber"}`}>
              {net >= 0 ? "+" : ""}{formatCurrency(net)}
            </span>
            <span className="text-muted-foreground hidden sm:inline">kept</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 mt-4 text-xs text-muted-foreground">
          <ChevronDown size={14} />
          <span>See the full breakdown below</span>
        </div>
      </CardContent>
    </Card>
  );
};
