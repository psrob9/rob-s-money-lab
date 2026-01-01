import { Target, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickWinsCardProps {
  categoryBreakdown: Array<{ name: string; total: number; percentage: number }>;
  monthsSpan: number;
  totalOut: number;
}

interface QuickWin {
  title: string;
  description: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const generateQuickWins = ({ categoryBreakdown, monthsSpan, totalOut }: QuickWinsCardProps): QuickWin[] => {
  const wins: QuickWin[] = [];
  
  // Find relevant categories
  const subscriptions = categoryBreakdown.find(c => c.name === "Subscriptions & Entertainment");
  const dining = categoryBreakdown.find(c => c.name === "Food & Dining");
  const groceries = categoryBreakdown.find(c => c.name === "Groceries");
  const shopping = categoryBreakdown.find(c => c.name === "Shopping");
  const uncategorized = categoryBreakdown.find(c => c.name === "Uncategorized");
  
  const monthlySubscriptions = subscriptions && monthsSpan > 0 ? subscriptions.total / monthsSpan : 0;
  const monthlyDining = dining && monthsSpan > 0 ? dining.total / monthsSpan : 0;
  const monthlyGroceries = groceries && monthsSpan > 0 ? groceries.total / monthsSpan : 0;
  const monthlyShopping = shopping && monthsSpan > 0 ? shopping.total / monthsSpan : 0;

  // 1. Subscription consolidation
  if (monthlySubscriptions > 50) {
    wins.push({
      title: "Review subscriptions",
      description: `You're spending ~${formatCurrency(Math.round(monthlySubscriptions))}/month on subscriptions. Even cutting 20% saves ${formatCurrency(Math.round(monthlySubscriptions * 0.2 * 12))}/year.`,
    });
  }

  // 2. Dining vs Groceries rebalancing
  if (monthlyDining > monthlyGroceries && monthlyDining > 100) {
    const shiftAmount = Math.min(150, Math.round(monthlyDining * 0.25));
    const yearSavings = shiftAmount * 12 * 0.5; // Assume groceries cost half of dining
    wins.push({
      title: "Shift some dining to groceries",
      description: `Moving ${formatCurrency(shiftAmount)}/month from restaurants to home cooking could save ~${formatCurrency(Math.round(yearSavings))}/year.`,
    });
  }

  // 3. High shopping spend
  if (monthlyShopping > 500) {
    wins.push({
      title: "30-day wishlist rule",
      description: `At ${formatCurrency(Math.round(monthlyShopping))}/month on shopping, try adding items to a 30-day list before buying. Many impulse purchases fade.`,
    });
  }

  // 4. Uncategorized spending
  if (uncategorized && uncategorized.percentage > 20) {
    wins.push({
      title: "Categorize unknowns",
      description: `${Math.round(uncategorized.percentage)}% of spending is uncategorized. Teaching the system helps spot patterns.`,
    });
  }

  // 5. General awareness
  if (totalOut > 0 && monthsSpan > 1) {
    const monthlyAvg = totalOut / monthsSpan;
    const topTwo = categoryBreakdown.slice(0, 2);
    const topTwoTotal = topTwo.reduce((sum, c) => sum + c.total, 0);
    const topTwoMonthly = topTwoTotal / monthsSpan;
    const topTwoPercentage = (topTwoTotal / totalOut) * 100;
    
    if (topTwoPercentage > 50 && wins.length < 2) {
      wins.push({
        title: "Focus on the big two",
        description: `${topTwo.map(c => c.name).join(" and ")} make up ${Math.round(topTwoPercentage)}% of spending (${formatCurrency(Math.round(topTwoMonthly))}/mo). Small changes here have the biggest impact.`,
      });
    }
  }

  return wins.slice(0, 3); // Max 3 quick wins
};

export const QuickWinsCard = (props: QuickWinsCardProps) => {
  const quickWins = generateQuickWins(props);

  if (quickWins.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-lab-navy flex items-center gap-2">
            <Target size={20} className="text-lab-sage" />
            Quick Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-lab-sage/10 rounded-lg">
            <Check size={20} className="text-lab-sage flex-shrink-0" />
            <p className="text-lab-warm-gray">
              Your spending looks pretty balanced! No obvious quick wins detected.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-lab-navy flex items-center gap-2">
          <Target size={20} className="text-lab-sage" />
          Quick Wins
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Based on your spending, here are opportunities:
        </p>
        <div className="space-y-3">
          {quickWins.map((win, idx) => (
            <div key={idx} className="p-3 bg-secondary/50 rounded-lg border-l-2 border-lab-sage">
              <p className="font-medium text-lab-navy text-sm mb-1">{win.title}</p>
              <p className="text-sm text-muted-foreground">{win.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
