import { useState, useCallback, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Upload, FileText, Lock, ChevronDown, ChevronUp, RefreshCw, Download, TrendingUp, TrendingDown, DollarSign, Calendar, ChevronRight, Sparkles, Loader2, Check, AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import Papa from "papaparse";

interface Transaction {
  date: string;
  description: string;
  amount: number;
}

interface AnalysisResult {
  totalIn: number;
  totalOut: number;
  net: number;
  transactionCount: number;
  startDate: string;
  endDate: string;
  monthsSpan: number;
}

interface CategoryBreakdown {
  name: string;
  total: number;
  percentage: number;
  color: string;
}

interface CategoryConfig {
  name: string;
  keywords: string[];
  color: string;
}

interface UploadedFile {
  id: string;
  name: string;
  transactions: Transaction[];
  dateRange: { start: string; end: string };
  status: 'parsing' | 'ready' | 'error';
  errorMessage?: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    name: "Housing",
    keywords: ["rent", "mortgage", "hoa", "property", "insurance", "home", "apartment", "lease"],
    color: "bg-amber-500",
  },
  {
    name: "Food & Dining",
    keywords: ["restaurant", "doordash", "uber eats", "grubhub", "chipotle", "mcdonald", "starbucks", "dunkin", "pizza", "sushi", "thai", "chinese", "mexican", "burger", "cafe", "coffee", "diner", "grill", "kitchen", "bistro", "taco", "wing", "sub", "sandwich", "bakery", "deli", "bar & grill", "chick-fil-a", "wendy", "panera", "five guys", "sweetgreen", "cava", "oats overnight", "daily harvest", "factor", "hello fresh", "blue apron", "freshly", "smoothie", "juice", "acai", "poke"],
    color: "bg-orange-500",
  },
  {
    name: "Groceries",
    keywords: ["walmart", "kroger", "safeway", "trader joe", "whole foods", "aldi", "costco", "target", "publix", "heb", "wegmans", "giant", "food lion", "stop & shop", "sprouts", "grocery", "market", "supermarket"],
    color: "bg-green-500",
  },
  {
    name: "Transportation",
    keywords: ["uber", "lyft", "gas", "shell", "chevron", "exxon", "bp", "mobil", "speedway", "wawa", "parking", "toll", "metro", "transit", "amtrak", "airline", "united", "delta", "american air", "southwest", "spirit", "frontier", "swa", "jetblue", "alaska air", "united air", "delta air", "ev charge", "chargepoint", "electrify", "evgo", "plugshare", "tesla supercharger", "hertz", "enterprise", "avis", "budget rental", "national car", "turo", "luggage", "bag fee", "excs_bag"],
    color: "bg-blue-500",
  },
  {
    name: "Shopping",
    keywords: ["amazon", "ebay", "etsy", "best buy", "home depot", "lowes", "ikea", "wayfair", "tj maxx", "marshalls", "ross", "nordstrom", "macy", "kohls", "old navy", "gap", "nike", "adidas", "apple store", "mack weldon", "bonobos", "untuckit", "bombas", "allbirds", "everlane", "simply to impress", "push pin", "rockdoodles", "foggy dog", "chewy", "barkbox", "pet"],
    color: "bg-purple-500",
  },
  {
    name: "Subscriptions & Entertainment",
    keywords: ["netflix", "spotify", "hulu", "disney+", "hbo", "youtube", "apple music", "amazon prime", "audible", "kindle", "patreon", "twitch", "playstation", "xbox", "steam", "nintendo", "movie", "cinema", "theater", "amc", "regal", "onlyfans", "ccbill", "nytimes", "new york times", "wsj", "wall street", "washington post", "wapo", "reuters", "prime video", "peacock", "paramount+", "max", "discovery+", "showtime", "starz", "crunchyroll", "claude", "anthropic", "openai", "chatgpt", "lovable", "github", "figma", "notion", "canva", "substack", "medium", "icloud", "dropbox", "google one", "google storage", "adobe", "creative cloud", "nyt cooking", "nyt games"],
    color: "bg-pink-500",
  },
  {
    name: "Travel & Entertainment",
    keywords: ["vacaya", "atlantis events", "rsvp vacations", "cruise", "hotel", "airbnb", "vrbo", "marriott", "hilton", "hyatt", "resort", "travel", "booking.com", "expedia", "kayak", "tripadvisor"],
    color: "bg-cyan-500",
  },
  {
    name: "Utilities & Bills",
    keywords: ["electric", "water", "gas bill", "internet", "comcast", "verizon", "at&t", "t-mobile", "sprint", "xfinity", "spectrum", "cox", "power", "utility", "sewage", "trash", "waste"],
    color: "bg-slate-500",
  },
  {
    name: "Healthcare",
    keywords: ["pharmacy", "cvs", "walgreens", "doctor", "hospital", "medical", "dental", "vision", "health", "urgent care", "clinic", "lab", "prescription", "rx"],
    color: "bg-red-500",
  },
  {
    name: "Donations & Memberships",
    keywords: ["donation", "donate", "charity", "church", "temple", "mosque", "synagogue", "chorus", "orchestra", "symphony", "museum", "zoo", "npr", "pbs", "aclu", "hrc", "planned parenthood", "united way", "red cross", "gofundme"],
    color: "bg-violet-500",
  },
  {
    name: "Transfers & Payments",
    keywords: ["transfer", "payment", "paypal", "venmo", "zelle", "cash app", "wire", "ach", "direct deposit"],
    color: "bg-gray-400",
  },
  {
    name: "Income",
    keywords: ["payroll", "direct deposit", "salary", "deposit", "refund", "reimbursement"],
    color: "bg-emerald-500",
  },
];

// Clean description by stripping common payment processor prefixes
const cleanDescription = (description: string): string => {
  let cleaned = description;
  
  // Strip common prefixes
  const prefixes = ["GOOGLE *", "SQ *", "SQC*", "PAYPAL *", "PP*"];
  for (const prefix of prefixes) {
    if (cleaned.toUpperCase().startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length);
      break;
    }
  }
  
  return cleaned;
};

const categorizeTransaction = (description: string, amount: number): { category: string; color: string } => {
  const originalDesc = description.toLowerCase();
  const cleanedDesc = cleanDescription(description).toLowerCase();
  
  // Check for TST* prefix (Toast payments - restaurants)
  if (originalDesc.startsWith("tst*")) {
    const foodCategory = CATEGORIES.find(c => c.name === "Food & Dining");
    return { category: foodCategory!.name, color: foodCategory!.color };
  }
  
  // Check for Income first if amount is positive
  if (amount > 0) {
    const incomeCategory = CATEGORIES.find(c => c.name === "Income");
    if (incomeCategory && incomeCategory.keywords.some(k => cleanedDesc.includes(k) || originalDesc.includes(k))) {
      return { category: incomeCategory.name, color: incomeCategory.color };
    }
  }
  
  // Check other categories using both original and cleaned description
  for (const cat of CATEGORIES) {
    if (cat.name === "Income") continue; // Skip income for expenses
    if (cat.keywords.some(keyword => cleanedDesc.includes(keyword) || originalDesc.includes(keyword))) {
      return { category: cat.name, color: cat.color };
    }
  }
  
  // Check for SP prefix (Shopify/Stripe merchants) - default to Shopping if no other match
  if (originalDesc.startsWith("sp ") && !originalDesc.includes("spotify")) {
    const shoppingCategory = CATEGORIES.find(c => c.name === "Shopping");
    return { category: shoppingCategory!.name, color: shoppingCategory!.color };
  }
  
  return { category: "Uncategorized", color: "bg-neutral-400" };
};

const calculateCategoryBreakdown = (txns: Transaction[]): CategoryBreakdown[] => {
  const categoryTotals: Record<string, { total: number; color: string }> = {};
  
  // Only process expenses (negative amounts), exclude transfers
  txns.forEach(txn => {
    if (txn.amount >= 0) return; // Skip income
    
    const { category, color } = categorizeTransaction(txn.description, txn.amount);
    if (category === "Transfers & Payments" || category === "Income") return; // Skip transfers from spending
    
    const absAmount = Math.abs(txn.amount);
    if (!categoryTotals[category]) {
      categoryTotals[category] = { total: 0, color };
    }
    categoryTotals[category].total += absAmount;
  });
  
  // Calculate total spending
  const totalSpending = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
  
  // Convert to array and sort by total (highest first)
  let breakdown = Object.entries(categoryTotals)
    .map(([name, { total, color }]) => ({
      name,
      total,
      percentage: totalSpending > 0 ? (total / totalSpending) * 100 : 0,
      color,
    }))
    .sort((a, b) => b.total - a.total);
  
  // If more than 8 categories, group the rest as "Other"
  if (breakdown.length > 8) {
    const top8 = breakdown.slice(0, 8);
    const rest = breakdown.slice(8);
    const otherTotal = rest.reduce((sum, cat) => sum + cat.total, 0);
    const otherPercentage = rest.reduce((sum, cat) => sum + cat.percentage, 0);
    
    breakdown = [
      ...top8,
      { name: "Other", total: otherTotal, percentage: otherPercentage, color: "bg-neutral-300" },
    ];
  }
  
  return breakdown;
};

type ToolStep = "upload" | "managing" | "results";

const MoneySnapshot = () => {
  const [step, setStep] = useState<ToolStep>("upload");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formatHelpOpen, setFormatHelpOpen] = useState(false);
  const [uncategorizedOpen, setUncategorizedOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [filesExpanded, setFilesExpanded] = useState(false);

  // Computed values from files
  const allTransactions = useMemo(() => {
    return files
      .filter(f => f.status === 'ready')
      .flatMap(f => f.transactions);
  }, [files]);

  const readyFiles = useMemo(() => files.filter(f => f.status === 'ready'), [files]);

  const combinedDateRange = useMemo(() => {
    if (readyFiles.length === 0) return null;
    
    let earliest: Date | null = null;
    let latest: Date | null = null;
    
    readyFiles.forEach(file => {
      const start = new Date(file.dateRange.start);
      const end = new Date(file.dateRange.end);
      
      if (!isNaN(start.getTime()) && (!earliest || start < earliest)) {
        earliest = start;
      }
      if (!isNaN(end.getTime()) && (!latest || end > latest)) {
        latest = end;
      }
    });
    
    if (!earliest || !latest) return null;
    
    return {
      start: earliest.toLocaleDateString(),
      end: latest.toLocaleDateString()
    };
  }, [readyFiles]);

  const totalTransactionCount = useMemo(() => {
    return readyFiles.reduce((sum, f) => sum + f.transactions.length, 0);
  }, [readyFiles]);

  // Get first 20 uncategorized transactions for debug view
  const uncategorizedTransactions = useMemo(() => {
    return allTransactions
      .filter(txn => {
        if (txn.amount >= 0) return false; // Skip income
        const { category } = categorizeTransaction(txn.description, txn.amount);
        return category === "Uncategorized";
      })
      .slice(0, 20);
  }, [allTransactions]);

  // Count all uncategorized transactions
  const uncategorizedCount = useMemo(() => {
    return allTransactions.filter(txn => {
      if (txn.amount >= 0) return false;
      const { category } = categorizeTransaction(txn.description, txn.amount);
      return category === "Uncategorized";
    }).length;
  }, [allTransactions]);

  const fetchInsights = useCallback(async () => {
    if (!analysis || categoryBreakdown.length === 0) return;
    
    setInsightsLoading(true);
    setInsightsError(null);
    
    try {
      const response = await fetch(
        "https://kjshbagskpzfbpfpucvq.supabase.co/functions/v1/generate-insights",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalIn: analysis.totalIn,
            totalOut: analysis.totalOut,
            net: analysis.net,
            monthsSpan: analysis.monthsSpan,
            categories: categoryBreakdown.map(cat => ({
              name: cat.name,
              total: cat.total,
              percentage: cat.percentage,
            })),
            uncategorizedCount,
            transactionCount: allTransactions.length,
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get insights");
      }
      
      setInsights(data.insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsightsError("Couldn't get insights right now. Want to try again?");
    } finally {
      setInsightsLoading(false);
    }
  }, [analysis, categoryBreakdown, uncategorizedCount, allTransactions.length]);

  const parseAmount = (value: string | number): number => {
    if (typeof value === "number") return value;
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[$,\s]/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const parseDate = (value: string): Date | null => {
    if (!value) return null;
    // Try common date formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
    
    // Try MM/DD/YYYY
    const parts = value.split(/[\/\-]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(p => parseInt(p, 10));
      // Assume MM/DD/YYYY or DD/MM/YYYY based on values
      if (a > 12) {
        return new Date(c, b - 1, a); // DD/MM/YYYY
      }
      return new Date(c, a - 1, b); // MM/DD/YYYY
    }
    return null;
  };

  const analyzeTransactions = (txns: Transaction[]): AnalysisResult => {
    let totalIn = 0;
    let totalOut = 0;
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    txns.forEach(txn => {
      if (txn.amount > 0) {
        totalIn += txn.amount;
      } else {
        totalOut += Math.abs(txn.amount);
      }

      const date = parseDate(txn.date);
      if (date) {
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      }
    });

    const monthsSpan = minDate && maxDate 
      ? Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 1;

    return {
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      transactionCount: txns.length,
      startDate: minDate ? minDate.toLocaleDateString() : "Unknown",
      endDate: maxDate ? maxDate.toLocaleDateString() : "Unknown",
      monthsSpan,
    };
  };

  const findColumn = (headers: string[], patterns: string[]): number => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    for (const pattern of patterns) {
      const index = lowerHeaders.findIndex(h => h.includes(pattern.toLowerCase()));
      if (index !== -1) return index;
    }
    return -1;
  };

  const calculateDateRange = (txns: Transaction[]): { start: string; end: string } => {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    txns.forEach(txn => {
      const date = parseDate(txn.date);
      if (date) {
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      }
    });

    return {
      start: minDate ? minDate.toLocaleDateString() : "Unknown",
      end: maxDate ? maxDate.toLocaleDateString() : "Unknown"
    };
  };

  const parseCSVFile = (file: File, fileId: string) => {
    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as string[][];
        if (rows.length < 2) {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error' as const, errorMessage: 'Not enough data' }
              : f
          ));
          return;
        }

        // Find header row (first non-empty row)
        let headerIndex = 0;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].some(cell => cell && cell.trim())) {
            headerIndex = i;
            break;
          }
        }

        const headers = rows[headerIndex];
        const dataRows = rows.slice(headerIndex + 1);

        // Find relevant columns
        const dateCol = findColumn(headers, ["date", "posted", "transaction date"]);
        const descCol = findColumn(headers, ["description", "memo", "payee", "name", "merchant"]);
        const amountCol = findColumn(headers, ["amount", "sum", "total"]);
        const debitCol = findColumn(headers, ["debit", "withdrawal", "expense"]);
        const creditCol = findColumn(headers, ["credit", "deposit", "income"]);

        const parsedTransactions: Transaction[] = [];

        dataRows.forEach(row => {
          if (!row || row.length === 0 || !row.some(cell => cell && cell.trim())) return;

          let amount = 0;
          if (amountCol !== -1) {
            amount = parseAmount(row[amountCol] || "0");
          } else if (debitCol !== -1 || creditCol !== -1) {
            const debit = debitCol !== -1 ? parseAmount(row[debitCol] || "0") : 0;
            const credit = creditCol !== -1 ? parseAmount(row[creditCol] || "0") : 0;
            amount = credit - debit;
          }

          const date = dateCol !== -1 ? row[dateCol] || "" : "";
          const description = descCol !== -1 ? row[descCol] || "" : row[1] || "";

          if (date || description || amount !== 0) {
            parsedTransactions.push({ date, description, amount });
          }
        });

        if (parsedTransactions.length === 0) {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error' as const, errorMessage: 'No transactions found' }
              : f
          ));
          return;
        }

        const dateRange = calculateDateRange(parsedTransactions);

        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'ready' as const, transactions: parsedTransactions, dateRange }
            : f
        ));
      },
      error: () => {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error' as const, errorMessage: 'Failed to parse file' }
            : f
        ));
      },
    });
  };

  const addFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(fileList).forEach(file => {
      if (!file.name.endsWith('.csv')) return;
      
      const fileId = crypto.randomUUID();
      newFiles.push({
        id: fileId,
        name: file.name,
        transactions: [],
        dateRange: { start: '', end: '' },
        status: 'parsing'
      });
      
      // Parse each file
      setTimeout(() => parseCSVFile(file, fileId), 0);
    });
    
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      setStep("managing");
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      if (updated.length === 0) {
        setStep("upload");
      }
      return updated;
    });
  };

  const analyzeAllFiles = () => {
    if (allTransactions.length === 0) return;
    
    setAnalysis(analyzeTransactions(allTransactions));
    setCategoryBreakdown(calculateCategoryBreakdown(allTransactions));
    setStep("results");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset input so same files can be selected again
    e.target.value = '';
  };

  const handleReset = () => {
    setStep("upload");
    setFiles([]);
    setAnalysis(null);
    setCategoryBreakdown([]);
    setInsights(null);
    setInsightsError(null);
    setInsightsLoading(false);
    setFilesExpanded(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isParsing = files.some(f => f.status === 'parsing');

  return (
    <Layout>
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-3">
              Money Snapshot
            </h1>
            <p className="text-xl text-lab-teal font-semibold mb-4">
              See where your money actually goes in 60 seconds
            </p>
            <p className="text-lab-warm-gray">
              Upload bank statement CSVs from multiple accounts. Your transactions are analyzed in your browser. Only spending summaries are shared if you opt into AI insights.
            </p>
          </div>

          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Upload Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-lab-teal bg-lab-teal/5"
                    : "border-border hover:border-lab-teal/50 hover:bg-secondary/30"
                }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload 
                  size={48} 
                  className={`mx-auto mb-4 transition-colors ${
                    isDragging ? "text-lab-teal" : "text-muted-foreground"
                  }`} 
                />
                <p className="text-lg font-medium text-lab-navy mb-2">
                  Drop your CSV files here or click to browse
                </p>
                <p className="text-sm text-lab-warm-gray">
                  Upload from multiple bank accounts and credit cards at once.
                </p>
              </div>

              {/* Privacy Note */}
              <div className="flex items-start gap-3 p-4 bg-lab-teal/5 rounded-lg border border-lab-teal/20">
                <Lock size={20} className="text-lab-teal mt-0.5 flex-shrink-0" />
                <p className="text-sm text-lab-warm-gray">
                  <span className="font-medium text-lab-navy">Privacy first:</span> Your files are processed entirely in your browser. Nothing is uploaded to any server.
                </p>
              </div>

              {/* Format Help */}
              <Collapsible open={formatHelpOpen} onOpenChange={setFormatHelpOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-lab-teal hover:underline">
                  {formatHelpOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  What format do I need?
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-lab-warm-gray mb-3">
                    We look for these common columns in your CSV:
                  </p>
                  <ul className="text-sm text-lab-warm-gray space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Date</span>
                      <span>When the transaction happened</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Description</span>
                      <span>What/who the transaction was with</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Amount</span>
                      <span>The dollar amount (negative = expense)</span>
                    </li>
                  </ul>
                  <p className="text-sm text-lab-warm-gray mt-3">
                    Most bank exports work automatically. We handle separate debit/credit columns too.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Step 2: Managing Files */}
          {step === "managing" && (
            <div className="space-y-6">
              {/* File List */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-lab-navy">Your Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {files.map(file => (
                    <div 
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {file.status === 'parsing' && (
                          <Loader2 size={18} className="text-lab-teal animate-spin flex-shrink-0" />
                        )}
                        {file.status === 'ready' && (
                          <Check size={18} className="text-lab-sage flex-shrink-0" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-lab-navy truncate">{file.name}</p>
                          {file.status === 'ready' && (
                            <p className="text-xs text-muted-foreground">
                              {file.dateRange.start} – {file.dateRange.end} • {file.transactions.length} transactions
                            </p>
                          )}
                          {file.status === 'parsing' && (
                            <p className="text-xs text-muted-foreground">Parsing...</p>
                          )}
                          {file.status === 'error' && (
                            <p className="text-xs text-red-500">{file.errorMessage || "Couldn't read this file"}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => removeFile(file.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}

                  {/* Add More Files */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-lab-teal/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                      <Plus size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Add more files</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Combined Summary */}
              {readyFiles.length > 0 && (
                <div className="p-4 bg-lab-teal/5 rounded-lg border border-lab-teal/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-lab-navy">Combined</p>
                      <p className="text-xs text-muted-foreground">
                        {totalTransactionCount} transactions
                        {combinedDateRange && ` • ${combinedDateRange.start} – ${combinedDateRange.end}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <Button
                onClick={analyzeAllFiles}
                disabled={readyFiles.length === 0 || isParsing}
                className="w-full bg-lab-teal hover:bg-lab-teal/90 text-white py-6 text-lg"
              >
                {isParsing ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Processing files...
                  </>
                ) : (
                  <>
                    Analyze {readyFiles.length === 1 ? 'File' : `All ${readyFiles.length} Files`}
                  </>
                )}
              </Button>

              {/* Privacy Note */}
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                <Lock size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  All processing happens in your browser. Your transactions never leave your device.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === "results" && analysis && (
            <div className="space-y-6">
              {/* File indicator */}
              <Collapsible open={filesExpanded} onOpenChange={setFilesExpanded}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText size={16} className="text-lab-teal" />
                      <span className="text-lab-navy font-medium">
                        {readyFiles.length} {readyFiles.length === 1 ? 'file' : 'files'}
                      </span>
                      <span className="text-muted-foreground">• {totalTransactionCount} transactions</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-muted-foreground transition-transform ${filesExpanded ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-3 bg-secondary/30 rounded-lg space-y-2">
                    {readyFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between text-sm">
                        <span className="text-lab-navy truncate">{file.name}</span>
                        <span className="text-muted-foreground text-xs">{file.transactions.length} transactions</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* The Big Picture */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-lab-navy flex items-center gap-2">
                    <DollarSign size={20} className="text-lab-teal" />
                    The Big Picture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-lab-sage/10 rounded-lg">
                    <div className="flex items-center gap-1 text-lab-sage mb-1">
                      <TrendingUp size={14} />
                      <span className="text-xs font-medium">Money In</span>
                    </div>
                    <p className="text-xl font-bold text-lab-navy">{formatCurrency(analysis.totalIn)}</p>
                    {analysis.monthsSpan > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{formatCurrency(Math.round(analysis.totalIn / analysis.monthsSpan))}/mo
                      </p>
                    )}
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-1 text-red-500 mb-1">
                      <TrendingDown size={14} />
                      <span className="text-xs font-medium">Money Out</span>
                    </div>
                    <p className="text-xl font-bold text-lab-navy">{formatCurrency(analysis.totalOut)}</p>
                    {analysis.monthsSpan > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{formatCurrency(Math.round(analysis.totalOut / analysis.monthsSpan))}/mo
                      </p>
                    )}
                  </div>
                    <div className={`p-4 rounded-lg ${analysis.net >= 0 ? "bg-lab-sage/10" : "bg-lab-amber/10"}`}>
                      <p className="text-xs font-medium text-lab-warm-gray mb-1">Net</p>
                      <p className={`text-xl font-bold ${analysis.net >= 0 ? "text-lab-sage" : "text-lab-amber"}`}>
                        {analysis.net >= 0 ? "+" : ""}{formatCurrency(analysis.net)}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-1 text-lab-warm-gray mb-1">
                        <Calendar size={14} />
                        <span className="text-xs font-medium">Period</span>
                      </div>
                      <p className="text-xl font-bold text-lab-navy">{analysis.monthsSpan} mo</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {analysis.startDate} – {analysis.endDate}
                  </p>
                </CardContent>
              </Card>

              {/* Where It Goes */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-lab-navy">Where It Goes</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      {categoryBreakdown.map((cat) => {
                        const maxPercentage = categoryBreakdown[0]?.percentage || 100;
                        const barWidth = (cat.percentage / maxPercentage) * 100;
                        
                        // Make Uncategorized expandable for debugging
                        if (cat.name === "Uncategorized" && uncategorizedTransactions.length > 0) {
                          return (
                            <Collapsible 
                              key={cat.name} 
                              open={uncategorizedOpen} 
                              onOpenChange={setUncategorizedOpen}
                            >
                              <CollapsibleTrigger className="w-full text-left">
                                <div className="space-y-1 p-1 -m-1 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-lab-navy flex items-center gap-1">
                                      <ChevronRight 
                                        size={14} 
                                        className={`text-muted-foreground transition-transform ${uncategorizedOpen ? 'rotate-90' : ''}`} 
                                      />
                                      {cat.name}
                                    </span>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lab-navy">{formatCurrency(cat.total)}</span>
                              <span className="text-muted-foreground text-xs w-12 text-right">
                                {cat.percentage.toFixed(1)}%
                              </span>
                            </div>
                            {analysis.monthsSpan > 1 && (
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(Math.round(cat.total / analysis.monthsSpan))}/mo avg
                              </span>
                            )}
                          </div>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${cat.color} opacity-70 rounded-full transition-all duration-500`}
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-2 ml-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                                  <ScrollArea className="max-h-[200px]">
                                    <div className="space-y-0">
                                      {uncategorizedTransactions.map((txn, idx) => (
                                        <div 
                                          key={idx} 
                                          className="flex items-center justify-between text-sm text-muted-foreground py-2.5 border-b border-border/30 last:border-0"
                                        >
                                          <span className="truncate max-w-[200px] sm:max-w-[280px]" title={txn.description}>
                                            {txn.description.length > 50 
                                              ? txn.description.substring(0, 50) + "..." 
                                              : txn.description}
                                          </span>
                                          <span className="font-mono font-medium text-lab-navy ml-2 flex-shrink-0">
                                            {formatCurrency(Math.abs(txn.amount))}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                  <p className="text-xs text-muted-foreground italic mt-3 pt-2 border-t border-border/30">
                                    Seeing something that should be categorized? Let me know!
                                  </p>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        }
                        
                        return (
                          <div key={cat.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-lab-navy">{cat.name}</span>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-lab-navy">{formatCurrency(cat.total)}</span>
                                  <span className="text-muted-foreground text-xs w-12 text-right">
                                    {cat.percentage.toFixed(1)}%
                                  </span>
                                </div>
                                {analysis.monthsSpan > 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatCurrency(Math.round(cat.total / analysis.monthsSpan))}/mo avg
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${cat.color} opacity-70 rounded-full transition-all duration-500`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <p className="text-xs text-muted-foreground mt-4 pt-2 border-t border-border">
                        Categories detected automatically based on transaction descriptions
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-lab-warm-gray text-sm">No spending categories detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Patterns */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-lab-navy flex items-center gap-2">
                    <Sparkles size={20} className="text-lab-amber" />
                    Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insightsLoading && (
                    <div className="py-8 text-center">
                      <Loader2 size={24} className="mx-auto mb-3 text-lab-teal animate-spin" />
                      <p className="text-lab-warm-gray text-sm">Analyzing your patterns...</p>
                    </div>
                  )}
                  
                  {insightsError && !insightsLoading && (
                    <div className="py-6 text-center">
                      <p className="text-lab-warm-gray text-sm mb-4">{insightsError}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchInsights}
                        className="text-lab-teal border-lab-teal/30 hover:bg-lab-teal/5"
                      >
                        <RefreshCw size={14} className="mr-2" />
                        Try again
                      </Button>
                    </div>
                  )}
                  
                  {insights && !insightsLoading && (
                    <div className="space-y-4">
                      <div className="text-lab-warm-gray text-sm leading-relaxed whitespace-pre-wrap">
                        {insights}
                      </div>
                      <p className="text-xs text-muted-foreground pt-3 border-t border-border/50 flex items-center gap-1">
                        <Sparkles size={12} className="text-lab-amber" />
                        Powered by Claude
                      </p>
                    </div>
                  )}
                  
                  {!insights && !insightsLoading && !insightsError && (
                    <div className="py-4 space-y-4">
                      <p className="text-lab-navy font-medium">
                        Want AI-powered insights about your spending?
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This will send a summary of your spending (totals and categories only) to Claude AI for analysis. Your individual transactions stay on your device.
                      </p>
                      <Button 
                        onClick={fetchInsights}
                        className="bg-lab-teal hover:bg-lab-teal/90 text-white"
                      >
                        <Sparkles size={14} className="mr-2" />
                        Get AI Insights
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled
                >
                  <Download size={16} className="mr-2" />
                  Download summary
                </Button>
                <Button 
                  onClick={handleReset}
                  className="flex-1 bg-lab-teal hover:bg-lab-teal/90 text-white"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Start over
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MoneySnapshot;
